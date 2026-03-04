import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { getCostMetrics, getDataIntegrityIssues, resetCostMetrics } from '../controllers/adminController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/authorizeMiddleware';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(protect);
router.use(authorize([UserRole.ADMIN]));

// Cost monitoring endpoints
router.get('/metrics/cost', getCostMetrics);
router.get('/metrics/integrity', getDataIntegrityIssues);
router.post('/metrics/reset', resetCostMetrics);

export default router;
