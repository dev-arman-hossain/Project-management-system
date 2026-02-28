import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../modules/auth/auth.service';
import { AuthenticationError, AuthorizationError } from '../utils/errors';

/**
 * Middleware to authenticate user
 */
export const authenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError('No token provided');
        }

        const token = authHeader.replace('Bearer ', '');
        const user = await AuthService.verifyToken(token);

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to authorize user based on role
 */
export const authorize = (...roles: Array<'ADMIN' | 'LEADER' | 'MEMBER'>) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AuthenticationError('User not authenticated'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AuthorizationError('Insufficient permissions'));
        }

        next();
    };
};
