import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3";
import { env } from "../config/env";
import { db } from "../config/db";
import { albums, clubs } from "../db/schema";
import {
    resolvePublicPhotoKey,
    getPublicAlbumsForClub,
    getPublicAlbumWithPhotos,
} from "../utils/fileUtils";
import { and, count, eq } from "drizzle-orm";
import { redis } from "../config/redis";

export const getAllPublicClubs = async (req: any, res: any) => {
    try {
        const allClubs = await db.select().from(clubs);
        const newClubs: {
            id: number;
            name: string;
            slug: string;
            logoUrl: string | null;
            bio: string | null;
            albumCount: number;
        }[] = [];
        for (const i in allClubs) {
            const club = allClubs[i];
            const [albumCount] = await db
                .select({ count: count() })
                .from(albums)
                .where(
                    and(
                        eq(albums.clubId, club.id),
                        eq(albums.isPublic, true),
                        eq(albums.deleted, false),
                    ),
                )
                .limit(1);
            newClubs.push({
                ...club,
                albumCount: albumCount?.count || 0,
            });
        }
        res.json({
            success: true,
            message: null,
            error: null,
            data: newClubs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: null,
            error: "Failed to fetch clubs",
            data: null,
        });
    }
};

export const getClubPublicPage = async (req: any, res: any) => {
    const { clubSlug } = req.params;

    const data = await getPublicAlbumsForClub(clubSlug);
    if (!data)
        return res.status(404).json({
            success: false,
            message: null,
            error: "Club not found",
            data: null,
        });

    const { club, publicAlbums } = data;

    res.json({
        success: true,
        message: null,
        error: null,
        data: {
            club: {
                name: club.name,
                slug: club.slug,
                logoUrl: club.logoUrl,
                bio: club.bio,
            },
            publicAlbums,
        },
    });
};

export const getPublicAlbum = async (req: any, res: any) => {
    const { clubSlug, albumSlug } = req.params;

    const album = await getPublicAlbumWithPhotos(clubSlug, albumSlug);
    if (!album)
        return res.status(404).json({
            success: false,
            message: null,
            error: "Album not found or not public",
            data: null,
        });

    res.json({ success: true, message: null, error: null, data: album });
};

export const servePublicPhoto = async (req: any, res: any) => {
    const { clubSlug, albumSlug, photoId } = req.params;
    const fileKey = await resolvePublicPhotoKey(clubSlug, albumSlug, Number(photoId));
    if (!fileKey)
        return res.status(404).json({
            success: false,
            message: null,
            error: "Photo not found or not public",
            data: null,
        });
    const cacheKey = `public-photo:${fileKey}`;
    try {
        // Try Redis cache first
        const cached = await redis.getBuffer(cacheKey);
        if (cached) {
            res.setHeader("Content-Type", "image/jpeg"); // Optionally store type in cache
            res.setHeader("Content-Length", cached.length.toString());
            res.setHeader("Cache-Control", "public, max-age=3600");
            return res.end(cached);
        }
        const command = new GetObjectCommand({ Bucket: env.S3_BUCKET_NAME, Key: fileKey });
        const data = await s3.send(command);
        // Buffer the stream
        const chunks: Buffer[] = [];
        for await (const chunk of data.Body as any) { chunks.push(chunk); }
        const buffer = Buffer.concat(chunks);
        res.setHeader("Content-Type", data.ContentType || "application/octet-stream");
        res.setHeader("Content-Length", buffer.length.toString());
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.end(buffer);
        redis.set(cacheKey, buffer, "EX", 60 * 60 * 24 * 7);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: null,
            error: "Failed to fetch image from S3",
            data: null,
        });
    }
};

export const proxyClubLogo = async (req: any, res: any) => {
    const { clubSlug } = req.params;
    try {
        // Find the club by slug
        const club = await db.select().from(clubs).where(eq(clubs.slug, clubSlug)).limit(1);
        if (!club || club.length === 0 || !club[0].logoUrl) {
            return res.status(404).json({
                success: false,
                message: null,
                error: "Club or logo not found",
                data: null,
            });
        }
        const logoKey = club[0].logoUrl;
        const cacheKey = `club-logo:${logoKey}`;
        // Try Redis cache first
        const cached = await redis.getBuffer(cacheKey);
        if (cached) {
            res.setHeader("Content-Type", "image/png"); // Optionally store type in cache
            res.setHeader("Content-Length", cached.length.toString());
            res.setHeader("Cache-Control", "public, max-age=3600");
            return res.end(cached);
        }
        const command = new GetObjectCommand({ Bucket: env.S3_BUCKET_NAME, Key: logoKey });
        const data = await s3.send(command);
        // Buffer the stream
        const chunks: Buffer[] = [];
        for await (const chunk of data.Body as any) { chunks.push(chunk); }
        const buffer = Buffer.concat(chunks);
        res.setHeader("Content-Type", data.ContentType || "application/octet-stream");
        res.setHeader("Content-Length", buffer.length.toString());
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.end(buffer);
        redis.set(cacheKey, buffer, "EX", 60 * 60 * 24 * 7);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: null,
            error: "Failed to fetch club logo from S3",
            data: null,
        });
    }
};
