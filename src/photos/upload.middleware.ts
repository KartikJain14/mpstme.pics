import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3 } from '../config/s3';
import { env } from '../config/env';
import path from 'path';
import { db } from '../config/db';
import { albums, clubs } from '../db/schema';
import { and, eq } from 'drizzle-orm';

// Helper: Generate unique file name with original extension
function generateFilename(originalName: string) {
  const ext = path.extname(originalName);
  const base = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2);
  return `${base}${ext}`;
}

export const upload = multer({
  storage: multerS3({
    s3,
    bucket: env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: async (req: any, file: Express.Multer.File, cb) => {
      try {
        const albumId = Number(req.params.albumId);
        const userClubId = req.user.clubId;

        // Fetch clubSlug and albumSlug
        const result = await db.select({
          clubSlug: clubs.slug,
          albumSlug: albums.slug,
        })
          .from(albums)
          .leftJoin(clubs, eq(albums.clubId, clubs.id))
          .where(
            and(eq(albums.id, albumId), eq(albums.clubId, userClubId), eq(albums.deleted, false))
          );

        if (!result.length) {
          return cb(new Error('Album not found or unauthorized'), '');
        }

        const { clubSlug, albumSlug } = result[0];
        const filename = generateFilename(file.originalname);
        const fullKey = `${clubSlug}/${albumSlug}/${filename}`;

        cb(null, fullKey);
      } catch (err) {
        cb(err as Error, '');
      }
    },
  }),
  limits: {
    fileSize: env.UPLOAD_MAX_MB * 1024 * 1024, // 10 MB per file
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  },
});
