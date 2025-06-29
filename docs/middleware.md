# Global Middleware

The `src/middleware/` directory contains shared middleware for auth, validation, rate limiting, and error handling.

---

## 🔐 `authenticate.ts`
Adds `req.user` from JWT if valid.

- Parses JWT from `Authorization` header
- Verifies using `env.JWT_SECRET`
- Injects `{ id, role, clubId }` into `req.user`

```ts
Authorization: Bearer <JWT>

```

----------

## 📊 `rateLimiter.ts`

Protects sensitive endpoints against abuse.

-   Uses `express-rate-limit`
    
-   Limits:
    
    -   Login: 5 reqs/min
        
    -   Uploads: 10 reqs/min
        
    -   Public: 60 reqs/min/IP
        

----------

## 🧪 `validate.ts`

Wrapper for validating request bodies via Zod.

```ts
app.post('/route', validate(schema), handler)

```

-   Returns 400 with detailed error if invalid
    

----------

## 🛑 `errorHandler.ts`

Handles thrown errors consistently.

-   Catches thrown errors from any controller
    
-   Returns JSON `{ error: 'message' }`
    
-   Handles Zod, auth, and DB errors