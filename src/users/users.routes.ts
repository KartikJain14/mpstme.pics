import { Router } from 'express';
import {
  createUser,
  updateUser,
  deleteUser,
  listUsers,
} from './users.controller';
import { authenticate, requireRole } from '../auth/auth.middleware';

const router = Router();

router.use('/', authenticate, requireRole('superadmin'));

router.post('/admin/clubs/:clubId/users', createUser);
router.patch('/admin/users/:userId', updateUser);
router.delete('/admin/users/:userId', deleteUser);
router.get('/admin/users', listUsers);

export default router;
