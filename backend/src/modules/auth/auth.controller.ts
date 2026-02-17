import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
    /**
     * Register a new user
     */
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await AuthService.register(req.body);

            res.status(201).json({
                success: true,
                data: { user },
                message: 'User registered successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Login user
     */
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);

            res.status(200).json({
                success: true,
                data: result,
                message: 'Login successful',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Logout user
     */
    static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (token) {
                await AuthService.logout(token);
            }

            res.status(200).json({
                success: true,
                message: 'Logout successful',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get current user
     */
    static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
        try {
            res.status(200).json({
                success: true,
                data: { user: req.user },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Refresh token
     */
    static async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({
                    success: false,
                    error: { message: 'No token provided' },
                });
            }

            const result = await AuthService.refreshToken(token);

            return res.status(200).json({
                success: true,
                data: result,
                message: 'Token refreshed successfully',
            });
        } catch (error) {
            return next(error);
        }
    }
}
