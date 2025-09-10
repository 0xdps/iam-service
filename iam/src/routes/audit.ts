import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { database } from '../database';

const router = Router();

// Get audit logs
router.get('/', authenticate, async (req: any, res: any) => {
  try {
    const logs = await database.getAuditLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export { router as auditRoutes };