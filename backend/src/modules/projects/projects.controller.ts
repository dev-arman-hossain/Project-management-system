import { Request, Response, NextFunction } from 'express';
import { ProjectService } from './projects.service';

export class ProjectController {
    /**
     * Create a new project
     */
    static async createProject(req: Request, res: Response, next: NextFunction) {
        try {
            const project = await ProjectService.createProject({
                ...req.body,
                createdById: req.user!.id,
            });

            res.status(201).json({
                success: true,
                data: { project },
                message: 'Project created successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all projects
     */
    static async getAllProjects(req: Request, res: Response, next: NextFunction) {
        try {
            const projects = await ProjectService.getAllProjects(
                req.user!.id,
                req.user!.role
            );

            res.status(200).json({
                success: true,
                data: { projects },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get project by ID
     */
    static async getProjectById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const project = await ProjectService.getProjectById(
                id,
                req.user!.id,
                req.user!.role
            );

            res.status(200).json({
                success: true,
                data: { project },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update project
     */
    static async updateProject(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const project = await ProjectService.updateProject(
                id,
                req.user!.id,
                req.user!.role,
                req.body
            );

            res.status(200).json({
                success: true,
                data: { project },
                message: 'Project updated successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete project
     */
    static async deleteProject(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            await ProjectService.deleteProject(id, req.user!.id, req.user!.role);

            res.status(200).json({
                success: true,
                message: 'Project deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get project statistics
     */
    static async getProjectStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await ProjectService.getProjectStats(
                req.user!.role,
                req.user!.id
            );

            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }
}
