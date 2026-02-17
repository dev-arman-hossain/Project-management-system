import { Router } from 'express';
import { ProjectController } from './projects.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
    createProjectSchema,
    updateProjectSchema,
    projectIdSchema,
} from './projects.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all projects (role-based filtering)
router.get('/', ProjectController.getAllProjects);

// Get project statistics
router.get('/stats', ProjectController.getProjectStats);

// Create project (Admin only)
router.post(
    '/',
    authorize('ADMIN'),
    validate(createProjectSchema),
    ProjectController.createProject
);

// Get project by ID
router.get('/:id', validate(projectIdSchema), ProjectController.getProjectById);

// Update project (Admin can update all fields, Members can only update status)
router.patch(
    '/:id',
    validate(projectIdSchema),
    validate(updateProjectSchema),
    ProjectController.updateProject
);

// Delete project (Admin only)
router.delete(
    '/:id',
    authorize('ADMIN'),
    validate(projectIdSchema),
    ProjectController.deleteProject
);

export default router;
