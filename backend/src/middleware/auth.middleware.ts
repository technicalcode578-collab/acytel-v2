import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  // The token is expected in the format "Bearer <TOKEN>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token provided
    return res.sendStatus(401); // Unauthorized
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT Secret not found!');
    return res.sendStatus(500); // Internal Server Error
  }

  try {
    // Verify the token's signature and expiration
    const decoded = jwt.verify(token, secret) as JwtPayload;
    // Attach the user's ID to the request object for later use
    req.user = { id: decoded.userId };
    next(); // Token is valid, proceed to the next middleware or route handler
  } catch (err) {
    // Token is invalid (bad signature, expired, etc.)
    return res.sendStatus(403); // Forbidden
  }
};
// ... (existing authenticateToken function)

export function verifyStreamToken(req: Request, res: Response, next: NextFunction) {
  const token = req.query.token as string;

  if (!token) {
    return res.status(401).send('Unauthorized: No token provided.');
  }

  const secret = process.env.STREAM_TOKEN_SECRET;
  if (!secret) {
    console.error('Stream token secret is not configured!');
    return res.sendStatus(500);
  }

  try {
    // Verify the temporary token using the dedicated secret
    const decoded = jwt.verify(token, secret);
    // You could optionally attach the decoded payload to the request if needed
    // req.streamPayload = decoded;
    next();
  } catch (err) {
    return res.status(401).send('Unauthorized: Invalid or expired token.');
  }
}