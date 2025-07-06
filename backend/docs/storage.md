# S3 Uploads, Media Handling & Quotas

All uploaded files (images/videos) are stored in AWS S3 with strict quota enforcement.

---

## 🧰 `upload.middleware.ts`

Uses `multer-s3` for storage with:

-   Club + Album slugs in key prefix
-   Example path:
    `/acm/farewell-2024/somephoto.jpg`

Validates:

-   Max size: `UPLOAD_MAX_MB` from `.env`
-   Allowed types: jpeg, png, webp, mp4

---

## 🔐 Secure Downloads

-   Raw S3 URLs are never exposed
-   Public access: `GET /:clubSlug/:albumSlug/:photoId`
-   Backend streams file with content-type headers

---

## 📊 Quota Handling

Each club has:

-   `storageQuotaMb` (default 500MB)
-   All uploads tracked in `photos.sizeInBytes`

Before uploads, backend checks:

```ts
SELECT SUM(sizeInBytes) WHERE clubId = ?

```

And compares to quota.

---

## ✅ Features

-   Slug-safe file paths
-   Clean public structure in S3
-   Upload errors logged
