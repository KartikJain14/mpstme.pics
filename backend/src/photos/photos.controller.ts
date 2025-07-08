import { db } from "../config/db";
import { albums, photos } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { checkStorageQuota } from "./photos.service";
import { s3 } from "../config/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env";

// GET /me/albums/:albumId/photos
export const listPhotos = async (req: any, res: any) => {
    const { albumId } = req.params;
    const clubId = req.user.clubId;

    const album = await db
        .select()
        .from(albums)
        .where(
            and(
                eq(albums.id, Number(albumId)),
                eq(albums.clubId, clubId),
                eq(albums.deleted, false),
            ),
        );

    if (!album.length)
        return res.status(404).json({
            success: false,
            message: null,
            error: "Album not found",
            data: null,
        });

    const result = await db
        .select()
        .from(photos)
        .where(
            and(eq(photos.albumId, Number(albumId)), eq(photos.deleted, false)),
        );
    res.json({ success: true, message: null, error: null, data: result });
};

// POST /me/albums/:albumId/photos
export const uploadPhotos = async (req: any, res: any) => {
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

    if (!album)
        return res.status(404).json({
            success: false,
            message: null,
            error: "Album not found",
            data: null,
        });
    if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({
            success: false,
            message: null,
            error: "No files uploaded",
            data: null,
        });
    }

    const incomingBytes = req.files.reduce(
        (acc: number, f: any) => acc + f.size,
        0,
    );

    // 💡 Enforce quota BEFORE inserting
    await checkStorageQuota(clubId, incomingBytes);

    const entries = req.files.map((file: any) => ({
        albumId: album.id,
        fileKey: file.key,
        s3Url: file.location,
        sizeInBytes: file.size,
    }));

    const result = await db.insert(photos).values(entries).returning();
    res.status(201).json({
        success: true,
        message: "Photos uploaded",
        error: null,
        data: result,
    });
};

// DELETE /me/photos/:photoId
export const deletePhoto = async (req: any, res: any) => {
    const { photoId } = req.params;
    const clubId = req.user.clubId;

    const match = await db
        .select({ id: photos.id })
        .from(photos)
        .leftJoin(albums, eq(albums.id, photos.albumId))
        .where(
            and(
                eq(photos.id, Number(photoId)),
                eq(albums.clubId, clubId),
                eq(photos.deleted, false),
            ),
        );

    if (!match.length)
        return res.status(404).json({
            success: false,
            message: null,
            error: "Not found or unauthorized",
            data: null,
        });

    await db
        .update(photos)
        .set({ deleted: true })
        .where(eq(photos.id, Number(photoId)));

    res.json({
        success: true,
        message: "Photo deleted",
        error: null,
        data: null,
    });
};

// PATCH /me/photos/:photoId
export const togglePhotoVisibility = async (req: any, res: any) => {
    const { photoId } = req.params;
    const clubId = req.user.clubId;

    const match = await db
        .select({ isPublic: photos.isPublic })
        .from(photos)
        .leftJoin(albums, eq(albums.id, photos.albumId))
        .where(
            and(
                eq(photos.id, Number(photoId)),
                eq(albums.clubId, clubId),
                eq(photos.deleted, false),
            ),
        );

    if (!match.length)
        return res.status(404).json({
            success: false,
            message: null,
            error: "Not found or unauthorized",
            data: null,
        });

    const current = match[0].isPublic;
    const [updated] = await db
        .update(photos)
        .set({ isPublic: !current })
        .where(eq(photos.id, Number(photoId)))
        .returning();

    res.json({
        success: true,
        message: "Photo visibility toggled",
        error: null,
        data: updated,
    });
};

// GET /me/photos/:photoId - Serve photo for authenticated admin
export const serveAdminPhoto = async (req: any, res: any) => {
    const { photoId } = req.params;
    const clubId = req.user.clubId;

    const match = await db
        .select({ fileKey: photos.fileKey })
        .from(photos)
        .leftJoin(albums, eq(albums.id, photos.albumId))
        .where(
            and(
                eq(photos.id, Number(photoId)),
                eq(albums.clubId, clubId),
                eq(photos.deleted, false),
            ),
        );

    if (!match.length)
        return res.status(404).json({
            success: false,
            message: null,
            error: "Photo not found or unauthorized",
            data: null,
        });

    const { fileKey } = match[0];

    try {
        const command = new GetObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: fileKey,
        });

        const data = await s3.send(command);

        res.setHeader("Content-Type", data.ContentType || "image/jpeg");
        res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year cache

        const stream = data.Body as any;
        stream.pipe(res);
    } catch (error) {
        console.error("Error serving admin photo:", error);
        res.status(500).json({
            success: false,
            message: null,
            error: "Failed to serve photo",
            data: null,
        });
    }
};
