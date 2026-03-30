import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware to protect routes by verifying JWT tokens
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token provided' });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ message: 'JWT Secret is not configured on server' });
        }

        // Verify token
        const decoded = jwt.verify(token, jwtSecret);

        // Attach decoded info if needed
        (req as any).user = decoded;
        
        next();
    } catch (error: any) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
