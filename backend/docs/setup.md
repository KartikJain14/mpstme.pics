# Local Setup Guide — mpstme.pics

Follow this guide to run the backend locally.

---

## 🧱 Prerequisites

-   Node.js >= 18.x
-   Docker + Docker Compose
-   PostgreSQL DB (via Compose)
-   AWS S3 credentials

---

## 🛠 Steps

1. Clone repo

```bash
git clone https://github.com/mpstme-club/mpstme.pics-backend
cd mpstme.pics-backend

```

2.  Copy env file

```bash
cp .env.example .env

```

3.  Start DB and backend

```bash
docker-compose up --build

```

4.  Run migrations

```bash
npx drizzle-kit push

```

5.  Hit `/health`

```
GET http://localhost:3000/health

```

---

## 🔐 S3 Notes

-   You must use your real S3 credentials in `.env`
-   Bucket must exist before use

```
S3_BUCKET_NAME=your-bucket
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=yyy

```

---

## 📁 Dev Structure

Main code lives in:

```
src/
  auth/
  clubs/
  users/
  albums/
  photos/
  public/
  audit/

```
