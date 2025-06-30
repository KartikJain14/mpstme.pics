import { db } from '../config/db';
import { clubs } from '../db/schema';
import { z } from 'zod';
import { generateSlug } from '../utils/generateSlug';
import { count, eq, sum } from 'drizzle-orm';
import { albums, photos } from '../db/schema';

export const createClub = async (req: any, res: any) => {
  const bodySchema = z.object({
    name: z.string().min(2),
    logoUrl: z.string().url().optional(),
    bio: z.string().optional(),
    storageQuotaMb: z.number().int().positive().optional(),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const { name, logoUrl, bio, storageQuotaMb } = parsed.data;
  const slug = generateSlug(name);

  const [existing] = await db.select().from(clubs).where(eq(clubs.slug, slug));
  if (existing) return res.status(409).json({ error: 'Slug already exists' });

  const [created] = await db.insert(clubs).values({
    name,
    slug,
    logoUrl,
    bio,
    storageQuotaMb,
  }).returning();

  res.status(201).json(created);
};

export const updateClub = async (req: any, res: any) => {
  const { clubId } = req.params;
  const bodySchema = z.object({
    name: z.string().min(2).optional(),
    logoUrl: z.string().url().optional(),
    bio: z.string().optional(),
    storageQuotaMb: z.number().int().positive().optional(),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const updateData: any = { ...parsed.data };
  if (updateData.name) {
    updateData.slug = generateSlug(updateData.name);
  }

  const [updated] = await db.update(clubs)
    .set(updateData)
    .where(eq(clubs.id, Number(clubId)))
    .returning();

  if (!updated) return res.status(404).json({ error: 'Club not found' });

  res.json(updated);
};

export const deleteClub = async (req: any, res: any) => {
  const { clubId } = req.params;

  const [deleted] = await db.delete(clubs)
    .where(eq(clubs.id, Number(clubId)))
    .returning();

  if (!deleted) return res.status(404).json({ error: 'Club not found' });

  res.json({ message: 'Club deleted', deleted });
};

export const getMyClub = async (req: any, res: any) => {
  const clubId = req.user.clubId;

  const [club] = await db.select().from(clubs).where(eq(clubs.id, clubId));
  if (!club) return res.status(404).json({ error: 'Club not found' });

  const [photoStats] = await db
    .select({ totalSize: sum(photos.sizeInBytes) })
    .from(photos)
    .leftJoin(albums, eq(photos.albumId, albums.id))
    .where(eq(albums.clubId, clubId));

  const used = photoStats?.totalSize || 0;

  res.json({
    id: club.id,
    name: club.name,
    slug: club.slug,
    logoUrl: club.logoUrl,
    bio: club.bio,
    storageQuotaMb: club.storageQuotaMb,
    storageUsedMb: +(Number(used) / (1024 * 1024)).toFixed(2),
  });
};