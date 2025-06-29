import { Router } from 'express';
import {
  listPhotos,
  uploadPhotos,
  deletePhoto,
  togglePhotoVisibility,
} from './photos.controller';
import { authenticate, requireRole } from '../auth/auth.middleware';
import { upload } from './upload.middleware';

const router = Router();

router.use(authenticate, requireRole('clubadmin'));

router.get('/me/albums/:albumId/photos', listPhotos);
router.post('/me/albums/:albumId/photos', upload.array('photos'), uploadPhotos);
router.delete('/me/photos/:photoId', deletePhoto);
router.patch('/me/photos/:photoId', togglePhotoVisibility);

export default router;
