import { Request, Response } from 'express';
import dbClient from '../core/database';

export async function getCurrentUser(req: Request, res: Response) {
  try {
    // The user ID is attached by the authenticateToken middleware
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication error.' });
    }

    const query = 'SELECT id, email, created_at, updated_at FROM acytel.users WHERE id = ? LIMIT 1';
    const result = await dbClient.execute(query, [userId], { prepare: true });
    const user = result.first();

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Return user data, explicitly omitting the hashed password
    return res.status(200).json(user);

  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}