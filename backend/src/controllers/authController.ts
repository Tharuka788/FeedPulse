import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Handles admin login by matching credentials from .env
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const jwtSecret = process.env.JWT_SECRET;

        if (!adminEmail || !adminPassword || !jwtSecret) {
            return res.status(500).json({ message: 'Authentication is not properly configured on server' });
        }

        if (email === adminEmail && password === adminPassword) {
            // Create token
            const token = jwt.sign({ role: 'admin' }, jwtSecret, {
                expiresIn: '24h'
            });

            return res.status(200).json({
                message: 'Login successful',
                token
            });
        }

        return res.status(401).json({ message: 'Invalid email or password' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
