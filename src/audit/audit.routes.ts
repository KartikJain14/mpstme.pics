import { Router } from 'express';
import { getAuditLogs, getStats } from './audit.controller';
import { authenticate, requireRole } from '../auth/auth.middleware';

const router = Router();

router.get('/admin/audit-logs', authenticate, requireRole('superadmin'), getAuditLogs);
router.get('/admin/stats', authenticate, requireRole('superadmin'), getStats);

export default router;
