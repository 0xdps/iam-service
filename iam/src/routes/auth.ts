import { Router, Request, Response } from 'express';
import { authorizationService } from '../services/authorizationService';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, resource } = req.body;

    if (!action || !resource) {
      return res.status(400).json({
        error: 'action and resource are required'
      });
    }

    const authorizeRequest = {
      sub: req.user!.id,
      session_id: req.user!.sessionId,
      action,
      resource
    };

    const result = await authorizationService.authorize(
      authorizeRequest,
      { ipAddress: req.ip }
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Authorization failed'
    });
  }
});

export { router as authRoutes };