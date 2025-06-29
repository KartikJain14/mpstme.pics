# Club Management — Superadmin

Superadmins can create, update, or delete clubs. Each club has:

-   Unique slug (`/acm`, `/ieee`)
    
-   Logo URL
    
-   Bio
    
-   Storage quota (in MB)
    

## 📌 Endpoints

Method

Path

Description

POST

/admin/clubs

Create new club

PATCH

/admin/clubs/:id

Update club info/quota

DELETE

/admin/clubs/:id

Delete a club

## 🔍 Validations

-   Slugs are auto-generated with `generateSlug()`
    
-   Logo is optional (S3 URL)
    
-   Bio is optional
    
-   Quota is enforced during uploads
    

## 🔁 Deletion

-   Deleting a club soft-deletes:
    
    -   Its albums
        
    -   Its photos
        
    -   Its users
        

## 🌐 Public Access

Public can view `/acm` (slug) to access:

-   Club name
    
-   Logo
    
-   Bio
    
-   Public albums