# 📸 mpstme.pics — Backend API

A secure, scalable, and modular backend for managing and sharing photos within MPSTME college clubs.

> 📚 Full documentation is in [`/docs`](./docs/)

---

## 📂 Project Structure


```

mpstme-pics-backend/  
├── src/  
│ ├── albums/ # [docs/albums.md]  
│ ├── audit/ # [docs/audit.md]  
│ ├── auth/ # [docs/auth.md]  
│ ├── clubs/ # [docs/clubs.md]  
│ ├── config/ # DB, S3, and env config  
│ ├── db/ # Drizzle schemas  
│ ├── middleware/ # [docs/middleware.md]  
│ ├── photos/ # [docs/photos.md]  
│ ├── public/ # [docs/public.md]  
│ ├── users/ # [docs/users.md]  
│ ├── utils/ # Slug and file helpers  
│ └── index.ts # App entry point  
│  
├── docs/ # 📚 See below  
├── drizzle.config.ts  
├── docker-compose.yml  
├── Dockerfile  
├── package.json  
└── tsconfig.json

```

---

## 🔐 Authentication ([docs/auth.md](./docs/auth.md))

- Email + Password login
- JWT-based stateless sessions
- Two roles: `superadmin`, `clubadmin`
- Middleware: `authenticate` injects `req.user`

---

## 🛡 Superadmin Routes ([docs/clubs.md](./docs/clubs.md), [docs/users.md](./docs/users.md), [docs/audit.md](./docs/audit.md), [docs/stats.md](./docs/stats.md))

| Feature         | Docs Link                  |
|-----------------|----------------------------|
| Club CRUD       | [clubs.md](./docs/clubs.md)  |
| Manage Users    | [users.md](./docs/users.md)  |
| Audit Logging   | [audit.md](./docs/audit.md)  |
| Stats Dashboard | [stats.md](./docs/stats.md)  |

---

## 🏫 Clubadmin Dashboard ([docs/albums.md](./docs/albums.md), [docs/photos.md](./docs/photos.md), [docs/storage.md](./docs/storage.md))

| Feature           | Docs Link                    |
|-------------------|------------------------------|
| View club info    | [albums.md](./docs/albums.md) |
| Album CRUD        | [albums.md](./docs/albums.md) |
| Upload photos     | [photos.md](./docs/photos.md) |
| Toggle/delete     | [photos.md](./docs/photos.md) |
| Enforce quotas    | [storage.md](./docs/storage.md) |

---

## 🌐 Public Interface ([docs/public.md](./docs/public.md))

| Route                        | Description                     |
|-----------------------------|---------------------------------|
| `/clubSlug`                 | Club bio + public albums        |
| `/clubSlug/albumSlug`       | Album gallery                   |
| `/clubSlug/albumSlug/photo` | Secure file proxy               |

---

## 🧰 Global Middleware ([docs/middleware.md](./docs/middleware.md))

- `authenticate.ts` — injects JWT claims
- `rateLimiter.ts` — protects login & public
- `errorHandler.ts` — consistent error shape
- `validate.ts` — wraps Zod schemas

---

## 🗃 Storage ([docs/storage.md](./docs/storage.md))

- AWS S3 storage with structured keys  
  `clubSlug/albumSlug/filename.jpg`
- Max size: `env.UPLOAD_MAX_MB`  
- Public/private toggle via DB
- Backend serves/proxies all media

---

## 🚀 Local Setup ([docs/setup.md](./docs/setup.md))

```bash
git clone https://github.com/your-org/mpstme.pics-backend
cp .env.example .env
docker-compose up --build
npx drizzle-kit push

```

Health check: [`GET /health`](./docs/health.md)

----------

## 📚 Documentation Index

Each major module has a dedicated `.md` file:

```
/docs/
├── albums.md
├── audit.md
├── auth.md
├── clubs.md
├── guidelines.md
├── health.md
├── middleware.md
├── overview.md
├── photos.md
├── public.md
├── setup.md
├── stats.md
├── storage.md
└── users.md

```

Start with [overview.md](./docs/overview.md) or [guidelines.md](./guidelines.md) before contributing!

----------

## ✅ Design Principles

-   Soft deletes for all media
    
-   Slugs for clean URLs
    
-   No direct S3 exposure
    
-   Club quota enforcement
    
-   Read-only public access
    
-   Express-only, no `server.ts`