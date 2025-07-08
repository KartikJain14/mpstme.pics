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

    const fileKey = await resolvePublicPhotoKey(
        clubSlug,
        albumSlug,
        Number(photoId),
    );
    if (!fileKey)
        return res.status(404).json({
            success: false,
            message: null,
            error: "Photo not found or not public",
            data: null,
        });

    try {
        const command = new GetObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: fileKey,
        });

        const data = await s3.send(command);

        res.setHeader(
            "Content-Type",
            data.ContentType || "application/octet-stream",
        );
        res.setHeader("Content-Length", data.ContentLength?.toString() || "");
        res.setHeader("Cache-Control", "public, max-age=3600"); // optional

        // @ts-ignore - Body is a readable stream
        data.Body.pipe(res); // ✅ stream from backend to browser
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
        const club = await db
            .select()
            .from(clubs)
            .where(eq(clubs.slug, clubSlug))
            .limit(1);
        if (!club || club.length === 0 || !club[0].logoUrl) {
            return res.status(404).json({
                success: false,
                message: null,
                error: "Club or logo not found",
                data: null,
            });
        }
        // logoUrl is expected to be the S3 key (path in bucket)
        const logoKey = club[0].logoUrl;
        const command = new GetObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: logoKey,
        });
        const data = await s3.send(command);
        res.setHeader(
            "Content-Type",
            data.ContentType || "application/octet-stream",
        );
        res.setHeader("Content-Length", data.ContentLength?.toString() || "");
        res.setHeader("Cache-Control", "public, max-age=3600");
        // @ts-ignore - Body is a readable stream
        data.Body.pipe(res);
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
