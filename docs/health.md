# Health & Monitoring

The `/health` endpoint provides a simple sanity check during development and CI/CD pipelines.

---

## ✅ GET /health

Returns:
```json
{
  "status": "ok",
  "time": "2025-06-28T18:29:55.282Z"
}

```

----------

## 💡 Use Cases

-   Health checks in CI/CD
    
-   Ping from frontend during SSR startup
    
-   Load balancer health probe
    

----------

## ⚠️ Notes

-   This route requires no auth
    
-   Do not remove this endpoint