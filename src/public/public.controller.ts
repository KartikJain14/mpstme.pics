import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../config/s3';
import { env } from '../config/env';
import {
  resolvePublicPhotoKey,
  getPublicAlbumsForClub,
  getPublicAlbumWithPhotos,
} from '../utils/fileUtils';

export const getClubPublicPage = async (req: any, res: any) => {
  const { clubSlug } = req.params;

  const data = await getPublicAlbumsForClub(clubSlug);
  if (!data) return res.status(404).json({ error: 'Club not found' });

  const { club, publicAlbums } = data;

  res.json({
    club: {
      name: club.name,
      slug: club.slug,
      logoUrl: club.logoUrl,
      bio: club.bio,
    },
    publicAlbums,
  });
};

export const getPublicAlbum = async (req: any, res: any) => {
  const { clubSlug, albumSlug } = req.params;

  const album = await getPublicAlbumWithPhotos(clubSlug, albumSlug);
  if (!album) return res.status(404).json({ error: 'Album not found or not public' });

  res.json(album);
};

export const servePublicPhoto = async (req: any, res: any) => {
  const { clubSlug, albumSlug, photoId } = req.params;

  const fileKey = await resolvePublicPhotoKey(clubSlug, albumSlug, Number(photoId));
  if (!fileKey) return res.status(404).json({ error: 'Photo not found or not public' });

  try {
    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: fileKey,
    });

    const data = await s3.send(command);

    res.setHeader('Content-Type', data.ContentType || 'application/octet-stream');
    res.setHeader('Content-Length', data.ContentLength?.toString() || '');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // optional

    // @ts-ignore - Body is a readable stream
    data.Body.pipe(res); // ✅ stream from backend to browser
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch image from S3' });
  }
};