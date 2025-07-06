import { db } from "../config/db";
import { albums, clubs, photos } from "../db/schema";
import { and, eq, sum } from "drizzle-orm";

export const checkStorageQuota = async (
    clubId: number,
    incomingBytes: number,
) => {
    // Get total bytes already used
    const [agg] = await db
        .select({ used: sum(photos.sizeInBytes) })
        .from(photos)
        .leftJoin(albums, eq(photos.albumId, albums.id))
        .where(and(eq(albums.clubId, clubId), eq(photos.deleted, false)));

    const usedBytes = Number(agg.used || 0);

    const [club] = await db.select().from(clubs).where(eq(clubs.id, clubId));
    const quotaBytes = (club?.storageQuotaMb || 500) * 1024 * 1024;

    if (usedBytes + incomingBytes > quotaBytes) {
        throw new Error("Club has exceeded its storage quota.");
    }
};
