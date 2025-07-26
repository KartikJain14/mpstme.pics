import {
    pgTable,
    serial,
    text,
    varchar,
    timestamp,
    boolean,
    integer,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: text("role", { enum: ["superadmin", "clubadmin"] }).notNull(),
    clubId: integer("club_id").references(() => clubs.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Clubs table
export const clubs = pgTable("clubs", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    logoUrl: varchar("logo_url", { length: 512 }),
    bio: text("bio"),
    storageQuotaMb: integer("storage_quota_mb").default(500),
    website: varchar("website", { length: 255 }),
    instagram: varchar("instagram", { length: 255 }),
    linkedin: varchar("linkedin", { length: 255 }),
    otherLinks: text("other_links").array().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Albums table
export const albums = pgTable("albums", {
    id: serial("id").primaryKey(),
    clubId: integer("club_id")
        .references(() => clubs.id)
        .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    isPublic: boolean("is_public").default(true),
    deleted: boolean("deleted").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Photos table
export const photos = pgTable("photos", {
    id: serial("id").primaryKey(),
    albumId: integer("album_id")
        .references(() => albums.id)
        .notNull(),
    fileKey: varchar("file_key", { length: 512 }).notNull(),
    sizeInBytes: integer("size_in_bytes").notNull().default(0),
    s3Url: varchar("s3_url", { length: 1024 }).notNull(),
    isPublic: boolean("is_public").default(true),
    deleted: boolean("deleted").default(false),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow(),
});

// Audit Logs table
export const auditLogs = pgTable("audit_logs", {
    id: serial("id").primaryKey(),
    actorId: integer("actor_id").notNull(),
    action: text("action").notNull(),
    targetTable: text("target_table").notNull(),
    targetId: integer("target_id").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
});
