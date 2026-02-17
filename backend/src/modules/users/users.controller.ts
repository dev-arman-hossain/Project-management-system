import { Request, Response, NextFunction } from 'express';
import { UserService } from './users.service';

export class UserController {
    /**
     * Get all users
     */
    static async getAllUsers(_req: Request, res: Response, next: NextFunction) {
        try {
            const users = await UserService.getAllUsers();

            res.status(200).json({
                success: true,
                data: { users },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user by ID
     */
    static async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const user = await UserService.getUserById(id);

            res.status(200).json({
                success: true,
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update user
     */
    static async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const user = await UserService.updateUser(id, req.body);

            res.status(200).json({
                success: true,
                data: { user },
                message: 'User updated successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete user
     */
    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            await UserService.deleteUser(id);

            res.status(200).json({
                success: true,
                message: 'User deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user statistics
     */
    static async getUserStats(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const stats = await UserService.getUserStats(id);

            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }
}
