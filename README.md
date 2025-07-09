# mpstme.pics

A full-stack web application for managing and sharing club photo albums at MPSTME.

## Features
- User authentication (superadmin, clubadmin)
- Club and album management
- Public and private photo galleries
- S3-backed image storage with Redis caching
- RESTful API (Express.js backend)
- Modern Next.js frontend

## Tech Stack
- **Backend:** Node.js, Express.js, Drizzle ORM, PostgreSQL, Redis, AWS S3
- **Frontend:** Next.js, React, Tailwind CSS
- **Other:** Docker, TypeScript

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- pnpm (or npm/yarn)
- Docker (for local Postgres/Redis)
- AWS S3 credentials (for image storage)

### Backend Setup
1. Install dependencies:
   ```sh
   cd backend
   pnpm install
   ```
2. Copy `.env.example` to `.env` and fill in your environment variables.
3. Start Postgres and Redis (recommended: `docker-compose up` in `backend/`).
4. Run migrations and seed:
   ```sh
   pnpm run migrate
   pnpm run seed
   ```
5. Start the backend server:
   ```sh
   pnpm run dev
   ```

### Frontend Setup
1. Install dependencies:
   ```sh
   cd ../frontend
   pnpm install
   ```
2. Copy `.env.example` to `.env` and set API URLs as needed.
3. Start the frontend:
   ```sh
   pnpm run dev
   ```

### Usage
- Visit the frontend at `http://localhost:3000`.
- API runs at `http://localhost:3001` by default.
- See `backend/docs/` for API documentation.

## Project Structure
- `backend/` — Express.js API, database, and business logic
- `frontend/` — Next.js app, React components, and static assets

## Development
- Use `pnpm` for consistent dependency management.
- Backend and frontend are decoupled; run both for full functionality.
- See `backend/docs/` for API endpoints and usage.

## License
MIT
