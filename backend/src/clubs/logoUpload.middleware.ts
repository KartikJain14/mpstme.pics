import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "../config/s3";
import { env } from "../config/env";
import path from "path";

function generateFilename(originalName: string) {
    const ext = path.extname(originalName);
    const base =
        Date.now().toString(36) + "-" + Math.random().toString(36).substring(2);
    return `${base}${ext}`;
}

export const clubLogoUpload = multer({
    storage: multerS3({
        s3,
        bucket: env.S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: async (req: any, file: Express.Multer.File, cb) => {
            try {
                // Use club name or slug for folder, fallback to 'clubs'
                const name = req.body.name || "clubs";
                const slug = name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
                const filename = generateFilename(file.originalname);
                const fullKey = `clubs/${slug}/logo/${filename}`;
                cb(null, fullKey);
            } catch (err) {
                cb(err as Error, "");
            }
        },
    }),
    limits: {
        fileSize: env.UPLOAD_MAX_MB * 1024 * 1024, // 10 MB per file
    },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Invalid file type"));
        }
        cb(null, true);
    },
});
