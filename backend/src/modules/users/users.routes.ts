import { Router } from 'express';
import { UserController } from './users.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { updateUserSchema, userIdSchema } from './users.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all users (Admin only)
router.get('/', authorize('ADMIN'), UserController.getAllUsers);

// Get user by ID
router.get('/:id', validate(userIdSchema), UserController.getUserById);

// Get user statistics
router.get('/:id/stats', validate(userIdSchema), UserController.getUserStats);

// Update user (Admin only)
router.patch(
    '/:id',
    authorize('ADMIN'),
    validate(userIdSchema),
    validate(updateUserSchema),
    UserController.updateUser
);

// Delete user (Admin only)
router.delete(
    '/:id',
    authorize('ADMIN'),
    validate(userIdSchema),
    UserController.deleteUser
);

export default router;
