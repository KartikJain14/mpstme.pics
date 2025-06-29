# Public Browsing

These endpoints allow unauthenticated users to browse visible clubs, albums, and photos.

## 📌 Endpoints

| Method | Path                                       | Description                  |
|--------|--------------------------------------------|------------------------------|
| GET    | /:clubSlug                                 | View public club page        |
| GET    | /:clubSlug/:albumSlug                      | View public album gallery    |
| GET    | /:clubSlug/:albumSlug/:photoId             | Securely serve photo         |

## 🌐 Club Page

Shows:
- Name, logo, bio
- All public albums (not deleted)

## 🌐 Album Page

- Lists all visible photos
- Supports image and video thumbnails
- No deleted/private photos shown

## 🛡 Secure Media Access

- Photos are **not** exposed via raw S3 URLs
- `GET /:clubSlug/:albumSlug/:photoId` acts as a backend proxy
- Downloads are streamed securely

## 🧱 Rate Limiting

- Public endpoints are rate-limited
- Protects against scraping and DDoS abuse
