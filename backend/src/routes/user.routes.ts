import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getCurrentUser } from '../controllers/user.controller';

const router = Router();

// This route is protected. The authenticateToken middleware will run first.
// If the token is valid, it will call next() and pass control to getCurrentUser.
// If not, the middleware will send a 401/403 response and stop the request.
router.get('/me', authenticateToken, getCurrentUser);

export default router;