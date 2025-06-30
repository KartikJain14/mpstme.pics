# Photo Management — Clubadmin

Photos are media files (images or videos) uploaded to a specific album. Files are stored in AWS S3 and metadata is stored in PostgreSQL.

## 📌 Endpoints

| Method | Path                              | Description                 |
|--------|-----------------------------------|-----------------------------|
| POST   | /me/albums/:albumId/photos        | Upload photos               |
| GET    | /me/albums/:albumId/photos        | List all photos in album    |
| PATCH  | /me/photos/:photoId               | Toggle public/private       |
| DELETE | /me/photos/:photoId               | Soft delete                 |

## 📦 Storage Details

- Files are uploaded via `upload.middleware.ts`
- Key format: `/clubSlug/albumSlug/filename.ext`
- File metadata stored in DB:
  - `fileKey`, `s3Url`, `sizeInBytes`, `uploadedAt`

## 🧹 Soft Delete

- Photos are never actually deleted from S3
- Soft-deleted photos are hidden from all queries

## 📏 Quota Enforcement

- Clubs have a quota (MB) set during creation
- Total photo `sizeInBytes` is calculated per club
- Uploads are blocked if quota exceeded
