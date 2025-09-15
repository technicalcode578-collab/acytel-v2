import { Router } from 'express';
import passport from 'passport';
import { register, login, googleAuth, googleCallback, refreshUserProfile, logout } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authRateLimit } from '../middleware/rateLimiter.middleware';

const router = Router();

// Existing routes
router.post('/register', authRateLimit, register);
router.post('/login', authRateLimit, login);

// Google OAuth routes
router.get('/google', authRateLimit, 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account' // Force account selection for better UX
  })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CORS_ORIGIN}/welcome?error=oauth_failed`,
    session: false 
  }),
  googleCallback
);

// Protected route to get user profile
router.get('/profile', authenticateToken, refreshUserProfile);

router.post('/logout', authenticateToken, logout);

export default router;