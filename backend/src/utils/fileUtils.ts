import { db } from "../config/db";
import { albums, clubs, photos } from "../db/schema";
import { and, eq } from "drizzle-orm";

export async function resolvePublicPhotoKey(
    clubSlug: string,
    albumSlug: string,
    photoId: number,
) {
    const result = await db
        .select({ fileKey: photos.fileKey })
        .from(photos)
        .leftJoin(albums, eq(photos.albumId, albums.id))
        .leftJoin(clubs, eq(albums.clubId, clubs.id))
        .where(
            and(
                eq(photos.id, photoId),
                eq(photos.isPublic, true),
                eq(photos.deleted, false),
                eq(albums.slug, albumSlug),
                eq(albums.isPublic, true),
                eq(albums.deleted, false),
                eq(clubs.slug, clubSlug),
            ),
        );

    return result[0]?.fileKey || null;
}

export async function getPublicAlbumsForClub(clubSlug: string) {
    const club = await db.query.clubs.findFirst({
        where: eq(clubs.slug, clubSlug),
    });
    if (!club) return null;

    const albumsResult = await db
        .select({
            id: albums.id,
            name: albums.name,
            slug: albums.slug,
            createdAt: albums.createdAt,
        })
        .from(albums)
        .where(
            and(
                eq(albums.clubId, club.id),
                eq(albums.isPublic, true),
                eq(albums.deleted, false),
            ),
        );

    return { club, publicAlbums: albumsResult };
}

export async function getPublicAlbumWithPhotos(
    clubSlug: string,
    albumSlug: string,
) {
    const result = await db
        .select({
            albumId: albums.id,
            albumName: albums.name,
            albumSlug: albums.slug,
            clubId: clubs.id,
        })
        .from(albums)
        .leftJoin(clubs, eq(albums.clubId, clubs.id))
        .where(
            and(
                eq(clubs.slug, clubSlug),
                eq(albums.slug, albumSlug),
                eq(albums.isPublic, true),
                eq(albums.deleted, false),
            ),
        );

    if (!result.length) return null;

    const album = result[0];

    const images = await db
        .select({
            id: photos.id,
            fileKey: photos.fileKey,
            uploadedAt: photos.uploadedAt,
        })
        .from(photos)
        .where(
            and(
                eq(photos.albumId, album.albumId),
                eq(photos.isPublic, true),
                eq(photos.deleted, false),
            ),
        );

    return {
        album: {
            id: album.albumId,
            name: album.albumName,
            slug: album.albumSlug,
        },
        photos: images.map((p) => ({
            id: p.id,
            fileName: p.fileKey.split("/").pop(),
            uploadedAt: p.uploadedAt,
        })),
    };
}
