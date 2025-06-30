import { Router } from 'express';
import { createClub, updateClub, deleteClub, getMyClub } from './clubs.controller';
import { authenticate, requireRole } from '../auth/auth.middleware';

const router = Router();

router.use('/', authenticate, requireRole('superadmin'));

router.post('/admin/clubs', createClub);
router.patch('/admin/clubs/:clubId', updateClub);
router.delete('/admin/clubs/:clubId', deleteClub);
router.get('/me/club', authenticate, requireRole('clubadmin'), getMyClub);

export default router;
