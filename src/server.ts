import express from 'express';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import auditRoutes from './audit/audit.routes';
import authRoutes from './auth/auth.routes';
import albumsRoutes from './albums/albums.routes';
import clubRoutes from './clubs/clubs.routes';
import photosRoutes from './photos/photos.routes';
import publicRoutes from './public/public.routes';
import userRoutes from './users/users.routes';
import { env } from './config/env';

const app = express();

app.use(rateLimiter);
app.use(express.json());

app.use(albumsRoutes);
app.use('/auth', authRoutes);
app.use(auditRoutes);
app.use(clubRoutes);
app.use(photosRoutes);
app.use(userRoutes);

app.use(publicRoutes);

app.get('/health', (_req: any, res: any) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('*', (_req: any, res: any) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 mpstme.pics backend running on http://localhost:${PORT}`);
});
