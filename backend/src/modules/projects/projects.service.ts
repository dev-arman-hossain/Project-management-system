import { prisma } from '../../../lib/prisma';
import { NotFoundError, AuthorizationError } from '../../utils/errors';
import { ProjectStatus } from '@prisma/client';

export class ProjectService {
    /**
     * Create a new project (Admin only)
     */
    static async createProject(data: {
        title: string;
        description?: string;
        assignedToId?: string;
        createdById: string;
        sheetUrl?: string;
        sheetOption?: 'PROVIDED' | 'NOT_PROVIDED' | 'WILL_PROVIDE_LATER';
    }) {
        // Validate assigned user exists if provided
        if (data.assignedToId) {
            const assignedUser = await prisma.user.findUnique({
                where: { id: data.assignedToId },
            });

            if (!assignedUser) {
                throw new NotFoundError('Assigned user not found');
            }
        }

        const project = await prisma.project.create({
            data: {
                title: data.title,
                description: data.description,
                assignedToId: data.assignedToId,
                createdById: data.createdById,
                sheetUrl: data.sheetUrl,
                sheetOption: data.sheetOption,
            },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return project;
    }

    /**
     * Get all projects (role-based filtering)
     */
    static async getAllProjects(userId: string, userRole: 'ADMIN' | 'MEMBER') {
        const where = userRole === 'ADMIN' ? {} : { assignedToId: userId };

        const projects = await prisma.project.findMany({
            where,
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return projects;
    }

    /**
     * Get project by ID
     */
    static async getProjectById(
        projectId: string,
        userId: string,
        userRole: 'ADMIN' | 'MEMBER'
    ) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!project) {
            throw new NotFoundError('Project not found');
        }

        // Members can only view their assigned projects
        if (userRole === 'MEMBER' && project.assignedToId !== userId) {
            throw new AuthorizationError('You can only view your assigned projects');
        }

        return project;
    }

    /**
     * Update project
     */
    static async updateProject(
        projectId: string,
        userId: string,
        userRole: 'ADMIN' | 'MEMBER',
        data: {
            title?: string;
            description?: string;
            status?: ProjectStatus;
            assignedToId?: string;
            sheetUrl?: string;
            sheetOption?: 'PROVIDED' | 'NOT_PROVIDED' | 'WILL_PROVIDE_LATER';
        }
    ) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            throw new NotFoundError('Project not found');
        }

        // Members can only update status of their assigned projects
        if (userRole === 'MEMBER') {
            if (project.assignedToId !== userId) {
                throw new AuthorizationError('You can only update your assigned projects');
            }

            // Members can only update status
            if (Object.keys(data).some((key) => key !== 'status')) {
                throw new AuthorizationError('You can only update project status');
            }
        }

        // Validate assigned user if being updated
        if (data.assignedToId) {
            const assignedUser = await prisma.user.findUnique({
                where: { id: data.assignedToId },
            });

            if (!assignedUser) {
                throw new NotFoundError('Assigned user not found');
            }
        }

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data,
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return updatedProject;
    }

    /**
     * Delete project (Admin only)
     */
    static async deleteProject(projectId: string) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            throw new NotFoundError('Project not found');
        }

        await prisma.project.delete({
            where: { id: projectId },
        });

        return { message: 'Project deleted successfully' };
    }

    /**
     * Get project statistics
     */
    static async getProjectStats(userRole: 'ADMIN' | 'MEMBER', userId?: string) {
        const where = userRole === 'ADMIN' ? {} : { assignedToId: userId };

        const projects = await prisma.project.findMany({
            where,
            select: {
                status: true,
            },
        });

        const stats = projects.reduce((acc: Record<string, number>, project: { status: string }) => {
            acc[project.status] = (acc[project.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total: projects.length,
            byStatus: stats,
        };
    }
}
