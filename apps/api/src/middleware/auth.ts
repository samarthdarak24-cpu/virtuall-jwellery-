import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
    userId?: string;
    userEmail?: string;
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new AppError('Authentication required', 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
            email: string;
        };

        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        next(new AppError('Invalid or expired token', 401));
    }
};

export const optionalAuth = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
                userId: string;
                email: string;
            };
            req.userId = decoded.userId;
            req.userEmail = decoded.email;
        }
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};
