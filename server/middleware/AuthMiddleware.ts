import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * AuthMiddleware — Handles JWT token verification
 * Converted from auth.js to a class with a static method
 * matching the class diagram's AuthMiddleware.verifyToken()
 */
class AuthMiddleware {
  public static verifyToken(req: Request, res: Response, next: NextFunction): void {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      res.status(403).json({ success: false, message: 'A token is required for authentication' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
      req.user = decoded as Request['user'];
    } catch (err) {
      res.status(401).json({ success: false, message: 'Invalid Token' });
      return;
    }

    next();
  }
}

export default AuthMiddleware;
