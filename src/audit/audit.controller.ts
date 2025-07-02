import { db } from "../config/db";
import { auditLogs, users, albums, clubs, photos } from "../db/schema";
import { desc, eq, count, sum } from "drizzle-orm";

export const getAuditLogs = async (req: any, res: any) => {
    const logs = await db
        .select({
            id: auditLogs.id,
            actorId: auditLogs.actorId,
            actorEmail: users.email,
            action: auditLogs.action,
            table: auditLogs.targetTable,
            targetId: auditLogs.targetId,
            timestamp: auditLogs.timestamp,
        })
        .from(auditLogs)
        .leftJoin(users, eq(users.id, auditLogs.actorId))
        .orderBy(desc(auditLogs.timestamp))
        .limit(100);

    res.json({ success: true, message: null, error: null, data: logs });
};

export const getStats = async (req: any, res: any) => {
    const [clubCount] = await db.select({ count: count() }).from(clubs);
    const [photoCount] = await db.select({ count: count() }).from(photos);
    const [userCount] = await db.select({ count: count() }).from(users);
    const [storageUsed] = await db
        .select({ totalSize: sum(photos.sizeInBytes) })
        .from(photos);

    res.json({
        success: true,
        message: null,
        error: null,
        data: {
            totalClubs: Number(clubCount.count),
            totalPhotos: Number(photoCount.count),
            totalUsers: Number(userCount.count),
            totalStorageMb: +(
                Number(storageUsed.totalSize || 0) /
                (1024 * 1024)
            ).toFixed(2),
        },
    });
};
