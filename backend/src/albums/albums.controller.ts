import { db } from "../config/db";
import { albums, clubs } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { generateSlug } from "../utils/generateSlug";

// GET /me/albums
export const listAlbums = async (req: any, res: any) => {
    const clubId = req.user.clubId;
    const [all, [clubSlug]] = await Promise.all([
        db
            .select()
            .from(albums)
            .where(and(eq(albums.clubId, clubId), eq(albums.deleted, false))),
        db
            .select({ slug: clubs.slug })
            .from(clubs)
            .where(eq(clubs.id, clubId))
            .limit(1),
    ]);
    res.json({
        success: true,
        message: null,
        error: null,
        data: { albums: all, clubSlug: clubSlug.slug },
    });
};

// GET /me/albums/:albumId
export const getAlbum = async (req: any, res: any) => {
    const { albumId } = req.params;
    const clubId = req.user.clubId;

    const [album] = await db
        .select()
        .from(albums)
        .where(
            and(
                eq(albums.id, Number(albumId)),
                eq(albums.clubId, clubId),
                eq(albums.deleted, false),
            ),
        );

    if (!album) {
        return res.status(404).json({
            success: false,
            message: null,
            error: "Album not found",
            data: null,
        });
    }

    res.json({ success: true, message: null, error: null, data: album });
};

// POST /me/albums
export const createAlbum = async (req: any, res: any) => {
    const schema = z.object({ name: z.string().min(2).max(255) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({
            success: false,
            message: null,
            error: parsed.error.format(),
            data: null,
        });

    const clubId = req.user.clubId;
    const { name } = parsed.data;
    const slug = generateSlug(name);

    const [album] = await db
        .insert(albums)
        .values({
            clubId,
            name,
            slug,
            isPublic: true,
        })
        .returning();

    res.locals.action = {
        type: "create",
        resource: "album",
        id: album.id,
    };
    res.status(201).json({
        success: true,
        message: "Album created",
        error: null,
        data: album,
    });
};

// PATCH /me/albums/:albumId
export const updateAlbum = async (req: any, res: any) => {
    const { albumId } = req.params;
    const schema = z.object({
        name: z.string().optional(),
        isPublic: z.boolean().optional(),
        slug: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({
            success: false,
            message: null,
            error: parsed.error.format(),
            data: null,
        });

    const clubId = req.user.clubId;
    const changes: any = { ...parsed.data };
    if (changes.name && !changes.slug) {
        changes.slug = generateSlug(changes.name);
    }

    const [updated] = await db
        .update(albums)
        .set(changes)
        .where(and(eq(albums.id, Number(albumId)), eq(albums.clubId, clubId)))
        .returning();

    if (!updated)
        return res.status(404).json({
            success: false,
            message: null,
            error: "Album not found",
            data: null,
        });
    res.json({
        success: true,
        message: "Album updated",
        error: null,
        data: updated,
    });
};

// DELETE /me/albums/:albumId
export const deleteAlbum = async (req: any, res: any) => {
    const { albumId } = req.params;
    const clubId = req.user.clubId;

    const [deleted] = await db
        .update(albums)
        .set({ deleted: true })
        .where(and(eq(albums.id, Number(albumId)), eq(albums.clubId, clubId)))
        .returning();

    if (!deleted)
        return res.status(404).json({
            success: false,
            message: null,
            error: "Album not found",
            data: null,
        });
    res.json({
        success: true,
        message: "Album deleted",
        error: null,
        data: { id: albumId },
    });
};
