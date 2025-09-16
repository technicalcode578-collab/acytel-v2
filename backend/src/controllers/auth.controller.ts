import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../core/database';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

// Define a schema for input validation using Zod.
// This ensures the data we receive conforms to our expectations.
const registerSchema = z.object({
  email: z.string().email('Invalid email format.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

export async function register(req: Request, res: Response) {
  try {
    // 1. Validate Input
    const { email, password } = registerSchema.parse(req.body);

    // 2. Check for Existing User
    // We use a parameterized query to prevent CQL injection.
    const existingUserQuery = 'SELECT email FROM users WHERE email = ? ALLOW FILTERING';
    const existingUserResult = await dbClient.execute(existingUserQuery, [email], { prepare: true });

    if (existingUserResult.rowLength > 0) {
      logger.logAuthFailure(req.ip || 'unknown', 'registration_attempt_existing_email', email);
      // Use 409 Conflict status code for duplicate resource
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // 3. Hash Password
    // A salt round of 12 is a strong, recommended standard.
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Generate UUID
    const userId = uuidv4();
    const now = new Date();

    // 5. Persist to Database
    // Again, we use a parameterized query for security.
    const insertQuery = 'INSERT INTO users (id, email, hashed_password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)';
    const params = [userId, email, hashedPassword, now, now];
    await dbClient.execute(insertQuery, params, { prepare: true });

    logger.logSecurityEvent('User registered', { userId }, req.ip || 'unknown');
    // 6. Return Success Response
    return res.status(201).json({
      message: 'User registered successfully.',
      userId: userId,
    });

  } catch (error) {
    // Handle validation errors from Zod
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', issues: error.issues });
    }
    // Handle all other potential errors
    logger.logSecurityEvent('Registration error', { error }, req.ip || 'unknown');
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}

// Add this new login function after the existing register function
export async function login(req: Request, res: Response) {
  try {
    // 1. Validate Input
    const { email, password } = registerSchema.parse(req.body);

    // 2. Find User by Email
    const findUserQuery = 'SELECT id, email, hashed_password FROM users WHERE email = ? LIMIT 1 ALLOW FILTERING';
    const userResult = await dbClient.execute(findUserQuery, [email], { prepare: true });
    const user = userResult.first();

    // 3. Handle "Not Found"
    if (!user) {
      logger.logAuthFailure(req.ip || 'unknown', 'login_attempt_user_not_found', email);
      // Return a generic 401 to prevent attackers from knowing which emails are registered
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 4. Compare Passwords
    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);

    // 5. Handle "Incorrect Password"
    if (!isPasswordValid) {
      logger.logAuthFailure(req.ip || 'unknown', 'login_attempt_invalid_password', email);
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 6. Generate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.logSecurityEvent('JWT_SECRET not found', undefined, undefined, req.ip || 'unknown');
      throw new Error('JwtSecretNotStored: JWT_SECRET is not defined in environment variables.');
    }

    const token = jwt.sign(
      { userId: user.id.toString() }, // Payload
      secret,                         // Secret Key
      { expiresIn: '7d' }             // Options
    );

    logger.logAuthSuccess(user.id.toString(), req.ip || 'unknown', 'local');
    // 7. Return Token
    return res.status(200).json({ token });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', issues: error.issues });
    }
    logger.logSecurityEvent('Login error', { error }, req.ip || 'unknown');
    console.error('Login error:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}

export async function googleAuth(req: Request, res: Response) {
  // This will be handled by Passport middleware
}

export async function googleCallback(req: Request, res: Response) {
  try {
    const user = req.user as any;
    
    if (!user) {
      logger.logAuthFailure(req.ip || 'unknown', 'google_oauth_callback_no_user');
      return res.redirect(`${process.env.CORS_ORIGIN}/welcome?error=authentication_failed`);
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.logSecurityEvent('JWT_SECRET not found', undefined, user.id, req.ip || 'unknown');
      console.error('JWT_SECRET not found');
      return res.redirect(`${process.env.CORS_ORIGIN}/welcome?error=server_error`);
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        authProvider: user.authProvider
      },
      secret,
      { expiresIn: '7d' }
    );

    logger.logAuthSuccess(user.id, req.ip || 'unknown', 'google');
    // Redirect to frontend with token
    const redirectURL = `${process.env.CORS_ORIGIN}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      profilePicture: user.profilePicture,
      authProvider: user.authProvider
    }))}`;

    res.redirect(redirectURL);

  } catch (error) {
    logger.logSecurityEvent('Google callback error', { error }, (req.user as any)?.id, req.ip || 'unknown');
    console.error('Google callback error:', error);
    res.redirect(`${process.env.CORS_ORIGIN}/welcome?error=callback_failed`);
  }
}

export async function refreshUserProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userQuery = 'SELECT * FROM users WHERE id = ? LIMIT 1';
    const result = await dbClient.execute(userQuery, [userId], { prepare: true });
    const user = result.first();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id.toString(),
      email: user.email,
      displayName: user.display_name,
      profilePicture: user.profile_picture,
      authProvider: user.auth_provider,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });

  } catch (error) {
    logger.logSecurityEvent('Profile refresh error', { error }, req.user?.id, req.ip || 'unknown');
    console.error('Profile refresh error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    // For JWT-based auth, logout is primarily client-side
    // But we can log the logout event for security monitoring
    const userId = req.user?.id;
    
    if (userId) {
      logger.logSecurityEvent('User logged out', undefined, userId, req.ip || 'unknown');
      console.log(`User ${userId} logged out at ${new Date().toISOString()}`);
    }

    // Clear session if using sessions
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          logger.logSecurityEvent('Session destruction error', { error: err }, userId, req.ip || 'unknown');
          console.error('Session destruction error:', err);
        }
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.logSecurityEvent('Logout error', { error }, req.user?.id, req.ip || 'unknown');
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
