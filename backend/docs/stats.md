# Stats Dashboard — Superadmin

The stats endpoint summarizes platform-wide metrics.

## 📌 Endpoint

| Method | Path         | Description                |
| ------ | ------------ | -------------------------- |
| GET    | /admin/stats | Get platform usage summary |

## 📊 Response Includes

```json
{
    "totalClubs": 5,
    "totalUsers": 12,
    "totalAlbums": 40,
    "totalPhotos": 873,
    "storageUsedMb": 428.43
}
```

## 🛠 How It Works

-   Joins the `photos`, `albums`, and `clubs` tables
-   Uses `SUM(sizeInBytes)` to calculate total storage used
-   Soft-deleted entities are excluded

## 🔐 Access Control

-   Only available to `superadmin`
