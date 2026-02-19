import { prisma } from '../../lib/prisma';
import { NotFoundError, AuthorizationError } from '../../utils/errors';
import bcrypt from 'bcryptjs';

export class UserService {
    /**
     * Get all users (Admin only)
     */
    static async getAllUsers() {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        assignedProjects: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return users;
    }

    /**
     * Get user by ID
     */
    static async getUserById(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                assignedProjects: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return user;
    }

    /**
     * Update user
     */
    static async updateUser(
        userId: string,
        data: {
            name?: string;
            email?: string;
            password?: string;
            role?: 'ADMIN' | 'MEMBER';
        }
    ) {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            throw new NotFoundError('User not found');
        }

        // If email is being updated, check if it's already taken
        if (data.email && data.email !== existingUser.email) {
            const emailTaken = await prisma.user.findUnique({
                where: { email: data.email },
            });

            if (emailTaken) {
                throw new AuthorizationError('Email already in use');
            }
        }

        // Hash password if provided
        const updateData: any = { ...data };
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 12);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                updatedAt: true,
            },
        });

        return updatedUser;
    }

    /**
     * Delete user
     */
    static async deleteUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return { message: 'User deleted successfully' };
    }

    /**
     * Get user statistics
     */
    static async getUserStats(userId: string) {
        const stats = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                _count: {
                    select: {
                        assignedProjects: true,
                    },
                },
                assignedProjects: {
                    select: {
                        status: true,
                    },
                },
            },
        });

        if (!stats) {
            throw new NotFoundError('User not found');
        }

        // Count projects by status
        const projectsByStatus = stats.assignedProjects.reduce((acc: Record<string, number>, project: { status: string }) => {
            acc[project.status] = (acc[project.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalProjects: stats._count.assignedProjects,
            projectsByStatus,
        };
    }
}
