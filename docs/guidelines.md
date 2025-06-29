# Contributor Guidelines

Welcome! This backend follows a clean modular structure with type-safety and consistency as top priorities.

---

## 🧭 Structure

Each feature lives in its own directory:


```

src/  
└── feature/  
├── routes.ts  
├── controller.ts  
└── service.ts

```

---

## 📋 Style Rules

- Use `req: any`, `res: any` in controllers
- Avoid `server.ts`, everything in `index.ts`
- Always soft-delete, never hard-delete
- Validate with Zod + `validate.ts` middleware
- Keep file names lowercase and kebab-style

---

## ✅ Testing Guidelines

- Use Postman or cURL to test routes
- JWT auth required for most `/me/` and `/admin/` endpoints
- For uploads, use Postman with `form-data`

---

## 🔄 Slugs

- Use `generateSlug.ts`
- Ensure uniqueness **per club**

---

## 🔐 JWT Notes

- Store in `Authorization: Bearer <token>`
- Never expose sensitive user info in public routes