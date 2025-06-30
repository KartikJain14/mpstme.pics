import { Router } from 'express';
import {
  createUser,
  updateUser,
  deleteUser,
  listUsers,
} from './users.controller';
import { authenticate, requireRole } from '../auth/auth.middleware';

const router = Router();

router.post(
    "/admin/clubs/:clubId/users",
    authenticate,
    requireRole("superadmin"),
    createUser
);
router.patch('/admin/users/:userId', authenticate, requireRole('superadmin'), updateUser);
router.delete('/admin/users/:userId', authenticate, requireRole('superadmin'), deleteUser);
router.get('/admin/users', authenticate, requireRole('superadmin'), listUsers);

export default router;
