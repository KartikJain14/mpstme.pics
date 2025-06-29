# mpstme.pics

Refer to this [chat](https://chatgpt.com/share/68605077-abd8-8011-9fc7-b34ec70b2f39) for all the details regarding this project.

```
mpstme-pics-backend/
├── src/
│   ├── config/
│   │   ├── db.ts              # Drizzle ORM config and PostgreSQL connection
│   │   ├── s3.ts              # AWS S3 client config
│   │   └── env.ts             # Loads and validates environment variables (dotenv + Zod)
│   │
│   ├── auth/
│   │   ├── auth.controller.ts # Login logic, JWT generation
│   │   ├── auth.middleware.ts # Protect routes using JWTs and role-based access
│   │   └── auth.routes.ts     # /auth/login endpoint
│   │
│   ├── clubs/
│   │   ├── clubs.controller.ts  # Create/update/delete clubs (superadmin)
│   │   ├── clubs.routes.ts      # Club-related endpoints (superadmin + public)
│   │   └── clubs.service.ts     # Club business logic
│   │
│   ├── users/
│   │   ├── users.controller.ts  # Manage clubadmins (create, delete, list)
│   │   ├── users.routes.ts      # /admin/users routes
│   │   └── users.service.ts     # User account logic
│   │
│   ├── albums/
│   │   ├── albums.controller.ts # Create/update/delete albums, toggle visibility
│   │   ├── albums.routes.ts     # Routes for clubadmin + public album view
│   │   └── albums.service.ts    # Album logic (validation, slug gen, etc.)
│   │
│   ├── photos/
│   │   ├── photos.controller.ts # Upload/delete/toggle photos
│   │   ├── photos.routes.ts     # Clubadmin photo upload routes
│   │   ├── photos.service.ts    # S3 upload logic
│   │   └── upload.middleware.ts # multer + multer-s3 middleware setup
│   │
│   ├── public/
│   │   └── public.routes.ts     # Public browsing endpoints for clubs and albums
│   │
│   ├── audit/
│   │   ├── audit.middleware.ts  # Middleware to log all write actions
│   │   └── audit.model.ts       # Drizzle schema for audit_logs table
│   │
│   ├── middleware/
│   │   ├── rateLimiter.ts       # Global rate limiting middleware
│   │   ├── errorHandler.ts      # Express error handler middleware
│   │   └── validate.ts          # Zod validation middleware wrapper
│   │
│   ├── utils/
│   │   ├── generateSlug.ts      # Utility to convert names into URL-safe slugs
│   │   └── fileUtils.ts         # Helpers for file type, size checks, etc.
│   │
│   ├── db/
│   │   ├── schema.ts            # Drizzle schema definitions (users, clubs, etc.)
│   │   └── migrations/          # Auto-generated SQL migrations (drizzle-kit)
│   │
│   └── index.ts                 # App entry point: initializes express, routes, middlewares
│
├── .env                         # Environment variables (DO NOT commit)
├── .env.example                 # Template for required .env vars
├── drizzle.config.ts            # Drizzle config (DB URL, outDir, etc.)
├── docker-compose.yml           # PostgreSQL + backend container setup
├── Dockerfile                   # App Dockerfile
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript config
└── README.md                    # Setup instructions and dev notes
```

---

AUTH ROUTES
(Role: superadmin, clubadmin)

POST /auth/login
  → Log in with email/password, returns JWT

---

SUPERADMIN ROUTES
(Role: superadmin only)

Club Management

POST   /admin/clubs
  → Create a new club (name, slug, logo, bio, quota)

PATCH  /admin/clubs/:clubId
  → Update club info or storage quota

DELETE /admin/clubs/:clubId
  → Delete a club (cascades albums & users)

---

User (Club Admin) Management

POST   /admin/clubs/:clubId/users
  → Create new clubadmin for the club

PATCH  /admin/users/:userId
  → Reset password or modify role/club

DELETE /admin/users/:userId
  → Revoke a user (soft delete or force)

GET    /admin/users
  → List all clubadmin users with their club and role

---

Logs & Stats

GET /admin/audit-logs
  → View audit trail for all mutations (actor, action, target)

GET /admin/stats
  → Summary: total clubs, photos, storage used, recent uploads

---

CLUBADMIN ROUTES
(Role: clubadmin)

Club Self Info

GET /me/club
  → Get current club's metadata (name, logo, quota used, etc.)

Albums

POST   /me/albums
  → Create new album (name, slug auto-generated)

PATCH  /me/albums/:albumId
  → Rename or toggle public/private

DELETE /me/albums/:albumId
  → Soft delete an album

GET    /me/albums
  → List all albums for the logged-in club

Photos

POST   /me/albums/:albumId/photos
  → Upload photos (supports multiple files)

DELETE /me/photos/:photoId
  → Delete a specific photo

PATCH  /me/photos/:photoId
  → Toggle public/private (or update caption, if added later)

GET    /me/albums/:albumId/photos
  → List all photos in an album

---

PUBLIC ROUTES
(No auth required)

GET /:clubSlug
  → Public club page (logo, bio, public albums)

GET /:clubSlug/:albumSlug
  → Public album view (visible photos only)

GET /:clubSlug/:albumSlug/:photoId
  → Serve photo via backend proxy (secure delivery)

---

Final Notes

Slug generation: Album and club names are automatically slugified for public URLs.

Audit logging: Middleware will log every mutation (create/update/delete) with user ID and action type.

Soft deletes: Used for photos and albums to allow recovery/logging.

Rate limits: Apply per-IP limits on login, upload, and public browse endpoints.