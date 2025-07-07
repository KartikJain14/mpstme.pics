import express from "express";
import cors from "cors";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import auditRoutes from "./audit/audit.routes";
import authRoutes from "./auth/auth.routes";
import albumsRoutes from "./albums/albums.routes";
import clubRoutes from "./clubs/clubs.routes";
import photosRoutes from "./photos/photos.routes";
import publicRoutes from "./public/public.routes";
import userRoutes from "./users/users.routes";
import { env } from "./config/env";
import morgan from "morgan";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Frontend dev server (Next.js default)
      "http://localhost:3001", // Alternative frontend port
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

morgan.token("user-id", (req: any, _) => {
  return req.user != undefined ? req.user.id : "Unauthenticated";
});
const logFormat = `[:date[web]] - :method :url HTTP/:http-version :status :referrer :user-agent User::user-id - :response-time ms`;
app.use(morgan(logFormat));
app.use(rateLimiter);
app.use(express.json());

app.get("/health", (req: any, res: any) =>
  res.json({ status: "ok", time: new Date().toISOString() })
);

app.use(albumsRoutes);
app.use("/auth", authRoutes);
app.use(auditRoutes);
app.use(clubRoutes);
app.use(photosRoutes);
app.use(userRoutes);

app.use(publicRoutes);

app.use((_req: any, res: any) => res.status(404).json({ error: "Not found" }));
app.use(errorHandler);

const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 mpstme.pics backend running on http://localhost:${PORT}`);
});
