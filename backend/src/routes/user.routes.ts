import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getCurrentUser, updateCurrentUser, deleteCurrentUser } from '../controllers/user.controller';

const router = Router();

// This route is protected. The authenticateToken middleware will run first.
// If the token is valid, it will call next() and pass control to getCurrentUser.
// If not, the middleware will send a 401/403 response and stop the request.
router.get('/profile', authenticateToken, getCurrentUser);

// Route to update user profile
router.put('/profile', authenticateToken, updateCurrentUser);

// Route to delete user account
router.delete('/account', authenticateToken, deleteCurrentUser);

export default router;