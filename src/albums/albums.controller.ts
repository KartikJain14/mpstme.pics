import { db } from '../config/db';
import { albums } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { generateSlug } from '../utils/generateSlug';

// GET /me/albums
export const listAlbums = async (req: any, res: any) => {
  const clubId = req.user.clubId;
  const all = await db.select().from(albums).where(
    and(eq(albums.clubId, clubId), eq(albums.deleted, false))
  );
  res.json(all);
};

// POST /me/albums
export const createAlbum = async (req: any, res: any) => {
  const schema = z.object({ name: z.string().min(2).max(255) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });

  const clubId = req.user.clubId;
  const { name } = parsed.data;
  const slug = generateSlug(name);

  const [album] = await db.insert(albums).values({
    clubId,
    name,
    slug,
    isPublic: true,
  }).returning();

  res.status(201).json(album);
};

// PATCH /me/albums/:albumId
export const updateAlbum = async (req: any, res: any) => {
  const { albumId } = req.params;
  const schema = z.object({
    name: z.string().optional(),
    isPublic: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });

  const clubId = req.user.clubId;
  const changes: any = { ...parsed.data };
  if (changes.name) {
    changes.slug = generateSlug(changes.name);
  }

  const [updated] = await db.update(albums)
    .set(changes)
    .where(and(eq(albums.id, Number(albumId)), eq(albums.clubId, clubId)))
    .returning();

  if (!updated) return res.status(404).json({ error: 'Album not found' });
  res.json(updated);
};

// DELETE /me/albums/:albumId
export const deleteAlbum = async (req: any, res: any) => {
  const { albumId } = req.params;
  const clubId = req.user.clubId;

  const [deleted] = await db.update(albums)
    .set({ deleted: true })
    .where(and(eq(albums.id, Number(albumId)), eq(albums.clubId, clubId)))
    .returning();

  if (!deleted) return res.status(404).json({ error: 'Album not found' });
  res.json({ message: 'Album deleted', id: albumId });
};
