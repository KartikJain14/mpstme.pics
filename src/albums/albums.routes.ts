import { Router } from 'express';
import {
  listAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} from './albums.controller';
import { authenticate, requireRole } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate, requireRole('clubadmin'));

router.get('/me/albums', listAlbums);
router.post('/me/albums', createAlbum);
router.patch('/me/albums/:albumId', updateAlbum);
router.delete('/me/albums/:albumId', deleteAlbum);

export default router;
