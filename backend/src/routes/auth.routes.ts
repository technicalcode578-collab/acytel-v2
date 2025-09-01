import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();

// Route for new user registration
router.post('/register', register);

// Route for existing user login
router.post('/login', login);

export default router;