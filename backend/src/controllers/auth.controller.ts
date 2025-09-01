import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../core/database';
import jwt from 'jsonwebtoken';

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
    const existingUserQuery = 'SELECT email FROM acytel.users WHERE email = ? ALLOW FILTERING';
    const existingUserResult = await dbClient.execute(existingUserQuery, [email], { prepare: true });

    if (existingUserResult.rowLength > 0) {
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
    const insertQuery = 'INSERT INTO acytel.users (id, email, hashed_password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)';
    const params = [userId, email, hashedPassword, now, now];
    await dbClient.execute(insertQuery, params, { prepare: true });

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
    const findUserQuery = 'SELECT id, email, hashed_password FROM acytel.users WHERE email = ? LIMIT 1 ALLOW FILTERING';
    const userResult = await dbClient.execute(findUserQuery, [email], { prepare: true });
    const user = userResult.first();

    // 3. Handle "Not Found"
    if (!user) {
      // Return a generic 401 to prevent attackers from knowing which emails are registered
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 4. Compare Passwords
    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);

    // 5. Handle "Incorrect Password"
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 6. Generate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JwtSecretNotStored: JWT_SECRET is not defined in environment variables.');
    }

    const token = jwt.sign(
      { userId: user.id.toString() }, // Payload
      secret,                         // Secret Key
      { expiresIn: '7d' }             // Options
    );

    // 7. Return Token
    return res.status(200).json({ token });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', issues: error.issues });
    }
    console.error('Login error:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}