# mpstme.pics — Backend Overview

`mpstme.pics` is a photo-sharing platform for college clubs at MPSTME. This backend enables authenticated club admins to manage photo albums, upload media, and display them publicly through clean URLs. It is designed to be:

- Production-ready and secure
- Modular and maintainable
- Scalable via AWS S3
- Developer-friendly with strong structure and docs

---

## 🎯 Goals

- Give each club isolated media space
- Enforce quotas to manage storage
- Make photos publicly browsable without exposing raw S3
- Allow superadmin control over clubs, users, and moderation
- Serve clean, predictable URLs for public sharing

---

## 🧱 Core Features

| Area             | Description                                                                 |
|------------------|-----------------------------------------------------------------------------|
| Auth             | JWT-based login for superadmins and clubadmins                             |
| Club Management  | Superadmins can create/update/delete clubs                                  |
| Album Management | Clubadmins create, rename, soft-delete albums with visibility toggles       |
| Photo Upload     | Upload via multer-s3 to AWS S3 with structured prefixes                     |
| Quota Control    | Each club has a max quota (MB); uploads are blocked if exceeded             |
| Audit Logging    | All mutations are logged with actor info                                    |
| Public Access    | Anyone can browse `/clubSlug/albumSlug` style URLs without authentication   |

---

## 🔐 User Roles

| Role        | Description                                                                  |
|-------------|------------------------------------------------------------------------------|
| superadmin  | Can manage all clubs, users, quotas, logs, stats                             |
| clubadmin   | Can manage albums/photos within their assigned club                          |

---

## 📦 Media Uploads

- Uploaded to AWS S3 using prefix: `/<clubSlug>/<albumSlug>/<filename>`
- Handled securely via backend proxy — S3 URLs are never exposed
- Upload limits enforced via env-configured `UPLOAD_MAX_MB`

---

## 📊 Architecture

| Layer         | Technology           |
|---------------|----------------------|
| Language      | TypeScript           |
| Framework     | Express.js           |
| ORM           | Drizzle ORM (PostgreSQL) |
| Storage       | AWS S3 (via `multer-s3`) |
| Auth          | JWT + role-based access |
| Validation    | Zod                  |
| Infra         | Docker, Docker Compose |

---

## 🧪 Test Coverage

Testing via mock API calls is encouraged. No testing framework is enforced yet, but planned.

---

## 🔧 Deployment

The backend runs as a containerized app on a VPS:

- Uses Docker and Docker Compose
- Exposes backend via port defined in `.env`
- No reverse proxy included by default

---

## 📚 Where To Go Next

If you're a new contributor:

- Read `/docs/setup.md` to get the project running locally
- Explore `/docs/auth.md` to understand login & JWTs
- Look at `/docs/photos.md` for S3 upload internals

> Each module has its own documentation under `/docs`.

```
/docs
├── overview.md              # High-level goals, system summary
├── setup.md                 # How to run the project locally
├── auth.md                  # Auth flow and roles
├── clubs.md                 # Clubs module (schema, endpoints, permissions)
├── users.md                 # Superadmin clubadmin management
├── albums.md                # Album CRUD and visibility rules
├── photos.md                # Upload, delete, quota enforcement, S3 logic
├── public.md                # Clean URL browsing + media delivery
├── audit.md                 # Audit log system
├── storage.md               # S3 structure, quotas, size tracking
├── middleware.md            # Rate limiting, JWT, validation, error handler
├── env.md                   # Required environment variables
├── api-reference.md         # All API endpoints in OpenAPI-style format
├── development.md           # Contributing, migrations, testing
└── roadmap.md               # Future plans, optional features
```