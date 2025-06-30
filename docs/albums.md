# Albums — Clubadmin Interface

Albums are folders that belong to clubs. Each album:

- Belongs to exactly one club
- Has a name + unique slug (per club)
- Can be public or private
- Supports soft deletes

## 📌 Endpoints

| Method | Path                    | Description               |
|--------|-------------------------|---------------------------|
| POST   | /me/albums              | Create album              |
| GET    | /me/albums              | List all club albums      |
| PATCH  | /me/albums/:albumId     | Rename / toggle visibility|
| DELETE | /me/albums/:albumId     | Soft delete album         |

## 🔄 Slug Handling

- Generated using `generateSlug.ts`
- Unique per club (ex: `acm/farewell-2024`)
- Used for public URLs

## 🔒 Access Rules

- Clubadmin can only manage albums of their club
- Soft deleted albums are hidden in all views
- Public albums are accessible to all
