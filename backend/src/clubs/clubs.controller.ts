import { db } from "../config/db";
import { clubs } from "../db/schema";
import { z } from "zod";
import { generateSlug } from "../utils/generateSlug";
import { eq, sum } from "drizzle-orm";
import { albums, photos } from "../db/schema";

export const createClub = async (req: any, res: any) => {
    // Accept file upload for logo as req.file
    const hasLogoFile = !!req.file;
    // Accept text fields from form-data or JSON
    const bodySchema = z.object({
        name: z.string().min(2),
        bio: z.string().optional(),
        storageQuotaMb: z.coerce.number().int().positive().optional(),
    });
    // If multipart, fields are in req.body as strings
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: null,
            error: parsed.error.format(),
            data: null,
        });
    }
    const { name, bio, storageQuotaMb } = parsed.data;
    const slug = generateSlug(name);
    const [existing] = await db
        .select()
        .from(clubs)
        .where(eq(clubs.slug, slug));
    if (existing)
        return res.status(409).json({
            success: false,
            message: null,
            error: `Slug ${slug} already exists`,
            data: null,
        });
    let logoKey: string | undefined = undefined;
    if (hasLogoFile && req.file?.key) {
        logoKey = req.file.key;
    } else if (
        req.body.logoKey &&
        typeof req.body.logoKey === "string"
    ) {
        logoKey = req.body.logoKey;
    }
    const [created] = await db
        .insert(clubs)
        .values({
            name,
            slug,
            logoUrl: logoKey, // store only the key
            bio,
            storageQuotaMb,
        })
        .returning();
    res.status(201).json({
        success: true,
        message: "Club created",
        error: null,
        data: created,
    });
};

export const updateClub = async (req: any, res: any) => {
    const { clubId } = req.params;
    // Accept both JSON and multipart/form-data
    const hasLogoFile = !!req.file;
    // Accept text fields from form-data or JSON
    const bodySchema = z.object({
        name: z.string().min(2).optional(),
        bio: z.string().optional(),
        slug: z.string().optional(),
        storageQuotaMb: z.coerce.number().int().positive().optional(),
    });
    // If multipart, fields are in req.body as strings
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: null,
            error: parsed.error.format(),
            data: null,
        });
    }

    const updateData: any = { ...parsed.data };
    if (updateData.name && !updateData.slug) {
        updateData.slug = generateSlug(updateData.name);
    }
    // Only update logoUrl if a file was uploaded
    if (hasLogoFile && req.file?.key) {
        updateData.logoUrl = req.file.key;
    }
    // If no file uploaded, do not touch logoUrl (do not allow direct URL update)

    const [updated] = await db
        .update(clubs)
        .set(updateData)
        .where(eq(clubs.id, Number(clubId)))
        .returning();

    if (!updated)
        return res.status(404).json({
            success: false,
            message: null,
            error: "Club not found",
            data: null,
        });

    res.json({
        success: true,
        message: "Club updated",
        error: null,
        data: updated,
    });
};

export const deleteClub = async (req: any, res: any) => {
    const { clubId } = req.params;

    const [deleted] = await db
        .delete(clubs)
        .where(eq(clubs.id, Number(clubId)))
        .returning();

    if (!deleted)
        return res.status(404).json({
            success: false,
            message: null,
            error: "Club not found",
            data: null,
        });

    res.json({
        success: true,
        message: "Club deleted",
        error: null,
        data: deleted,
    });
};

export const getMyClub = async (req: any, res: any) => {
    const clubId = req.user.clubId;

    const [club] = await db.select().from(clubs).where(eq(clubs.id, clubId));
    if (!club)
        return res.status(404).json({
            success: false,
            message: null,
            error: "Club not found",
            data: null,
        });

    const [photoStats] = await db
        .select({ totalSize: sum(photos.sizeInBytes) })
        .from(photos)
        .leftJoin(albums, eq(photos.albumId, albums.id))
        .where(eq(albums.clubId, clubId));

    const used = photoStats?.totalSize || 0;

    res.json({
        success: true,
        message: null,
        error: null,
        data: {
            id: club.id,
            name: club.name,
            slug: club.slug,
            logoUrl: club.logoUrl,
            bio: club.bio,
            storageQuotaMb: club.storageQuotaMb,
            storageUsedMb: +(Number(used) / (1024 * 1024)).toFixed(2),
        },
    });
};

export const getAllClubs = async (req: any, res: any) => {
    const all = await db.select().from(clubs);
    res.json({ success: true, message: null, error: null, data: all });
};
