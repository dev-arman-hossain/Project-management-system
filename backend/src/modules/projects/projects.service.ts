import { prisma } from '../../lib/prisma';
import { NotFoundError, AuthorizationError } from '../../utils/errors';
import { ProjectStatus } from '../../generated/prisma/index.js';

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
        startDate?: string | Date;
        deadline?: string | Date;
        value?: number;
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
                startDate: (data.startDate && data.startDate !== '') ? new Date(data.startDate) : undefined,
                deadline: (data.deadline && data.deadline !== '') ? new Date(data.deadline) : undefined,
                value: data.value,
            },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                assignedToId: true,
                createdById: true,
                sheetUrl: true,
                sheetOption: true,
                startDate: true,
                deadline: true,
                value: true,
                createdAt: true,
                updatedAt: true,
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
    static async getAllProjects(userId: string, userRole: 'ADMIN' | 'LEADER' | 'MEMBER') {
        const where = (userRole === 'ADMIN' || userRole === 'LEADER')
            ? {}
            : {
                OR: [
                    { assignedToId: userId },
                    { createdById: userId }
                ]
            };

        const projects = await prisma.project.findMany({
            where,
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                assignedToId: true,
                createdById: true,
                sheetUrl: true,
                sheetOption: true,
                startDate: true,
                deadline: true,
                value: true,
                createdAt: true,
                updatedAt: true,
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
        userRole: 'ADMIN' | 'LEADER' | 'MEMBER'
    ) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                assignedToId: true,
                createdById: true,
                sheetUrl: true,
                sheetOption: true,
                startDate: true,
                deadline: true,
                value: true,
                createdAt: true,
                updatedAt: true,
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

        // Members can only view their assigned projects or projects they created
        if (userRole === 'MEMBER' && project.assignedToId !== userId && project.createdById !== userId) {
            throw new AuthorizationError('You can only view your assigned projects or projects you created');
        }

        return project;
    }

    /**
     * Update project
     */
    static async updateProject(
        projectId: string,
        userId: string,
        userRole: 'ADMIN' | 'LEADER' | 'MEMBER',
        data: {
            title?: string;
            description?: string;
            status?: ProjectStatus;
            assignedToId?: string;
            sheetUrl?: string;
            sheetOption?: 'PROVIDED' | 'NOT_PROVIDED' | 'WILL_PROVIDE_LATER';
            startDate?: string | Date;
            deadline?: string | Date;
            value?: number;
        }
    ) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            throw new NotFoundError('Project not found');
        }

        // Members can only update status of their assigned projects or projects they created
        if (userRole !== 'ADMIN' && userRole !== 'LEADER') {
            if (project.assignedToId !== userId && project.createdById !== userId) {
                throw new AuthorizationError('You can only update your assigned projects or projects you created');
            }

            // Members can only update status, title, and deadline
            const allowedKeys = ['status', 'title', 'deadline'];
            if (Object.keys(data).some((key) => !allowedKeys.includes(key))) {
                throw new AuthorizationError('You can only update project status, title, and deadline');
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
            data: {
                ...data,
                startDate: (data.startDate && data.startDate !== '') ? new Date(data.startDate) : undefined,
                deadline: (data.deadline && data.deadline !== '') ? new Date(data.deadline) : undefined,
            },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                assignedToId: true,
                createdById: true,
                sheetUrl: true,
                sheetOption: true,
                startDate: true,
                deadline: true,
                value: true,
                createdAt: true,
                updatedAt: true,
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
     * Delete project (Admin, Leader, or Creator)
     */
    static async deleteProject(projectId: string, userId: string, userRole: 'ADMIN' | 'LEADER' | 'MEMBER') {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            throw new NotFoundError('Project not found');
        }

        // Only Admin, Leader, Creator, or Assigned user can delete
        if (userRole !== 'ADMIN' && userRole !== 'LEADER' && project.createdById !== userId && project.assignedToId !== userId) {
            throw new AuthorizationError('You can only delete projects you created or are assigned to you');
        }

        await prisma.project.delete({
            where: { id: projectId },
        });

        return { message: 'Project deleted successfully' };
    }

    /**
     * Get project statistics
     */
    static async getProjectStats(userRole: 'ADMIN' | 'LEADER' | 'MEMBER', userId?: string) {
        const where = (userRole === 'ADMIN' || userRole === 'LEADER')
            ? {}
            : {
                OR: [
                    { assignedToId: userId },
                    { createdById: userId }
                ]
            };

        const projects = await prisma.project.findMany({
            where,
            select: {
                status: true,
                value: true,
            },
        });

        const stats = projects.reduce((acc: any, project: { status: string; value?: number | null }) => {
            acc.byStatus[project.status] = (acc.byStatus[project.status] || 0) + 1;

            // Sum values for delivered/completed projects
            if (project.status === 'COMPLETED' || project.status === 'DELIVERED') {
                acc.totalValue += Number(project.value || 0);
            }

            return acc;
        }, {
            byStatus: {} as Record<string, number>,
            totalValue: 0
        });

        return {
            total: projects.length,
            byStatus: stats.byStatus,
            totalValue: stats.totalValue,
        };
    }
}
