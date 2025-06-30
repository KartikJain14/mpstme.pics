# Clubadmin User Management — Superadmin

Superadmins can create, manage, or delete users (clubadmins). Each user is assigned to one club.

## 📌 Endpoints

| Method | Path                              | Description                    |
|--------|-----------------------------------|--------------------------------|
| POST   | /admin/clubs/:clubId/users        | Create a new clubadmin         |
| PATCH  | /admin/users/:userId              | Update password, role, club    |
| DELETE | /admin/users/:userId              | Soft-delete the user           |
| GET    | /admin/users                      | List all users and their club  |

## 👤 Clubadmin Properties

- `email`: must be unique
- `passwordHash`: securely hashed
- `role`: always `clubadmin`
- `clubId`: references one club

## 🔐 Notes

- Only superadmin can access these routes
- There is no password reset endpoint
- Clubadmins cannot self-signup
