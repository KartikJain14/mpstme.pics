# Authentication — mpstme.pics

Auth is based on **email/password + JWT**.  
There is no self-signup or password reset. Only superadmins create users.

## 🧪 Flow

-   User sends `POST /auth/login` with:
    
    ```json
    {
      "email": "club@mpstme.in",
      "password": "secret"
    }
    
    ```
    
-   Returns:
    
    ```json
    {
      "token": "JWT_TOKEN_HERE",
      "user": {
        "id": 12,
        "role": "clubadmin",
        "clubId": 3
      }
    }
    
    ```
    
-   Token must be sent in `Authorization: Bearer <token>` header.
    

## 🛡 Middleware

-   `authenticate`: Parses JWT and sets `req.user`
    
-   Role checking logic done inside routes using `req.user.role`
    

## 🔐 JWT

-   Secret key from `.env.JWT_SECRET`
    
-   7-day expiry
    
-   Contains:
    
    -   `id`
        
    -   `role`
        
    -   `clubId` (if applicable)