# Audit Logging

Every data mutation (create, update, delete) is logged in the `audit_logs` table.

## 🧠 Purpose

-   Track who did what and when
-   Allows forensic debugging
-   Required for admin transparency

## 📝 Schema

```ts
auditLogs = pgTable("audit_logs", {
    id: serial("id").primaryKey(),
    actorId: integer("actor_id"),
    action: text("action"),
    targetTable: text("target_table"),
    targetId: integer("target_id"),
    timestamp: timestamp("timestamp").defaultNow(),
});
```

## ⚙️ How It Works

-   `audit.middleware.ts` is registered globally
-   Hooks into all `POST`, `PATCH`, `DELETE` requests
-   Reads `req.user`, `req.method`, `req.originalUrl`

## 📌 Endpoint

Method

Path

Description

GET

/admin/audit-logs

List recent mutations

## 🔐 Access Control

-   Only superadmins can view audit logs
