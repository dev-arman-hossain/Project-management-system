import { z } from 'zod';

export const createProjectSchema = z.object({
    body: z.object({
        title: z.string().min(3, 'Title must be at least 3 characters'),
        description: z.string().optional(),
        assignedToId: z.string().optional(),
    }),
});

export const updateProjectSchema = z.object({
    body: z.object({
        title: z.string().min(3).optional(),
        description: z.string().optional(),
        status: z.enum(['WIP', 'NRA', 'DELIVERED', 'REVISION', 'CANCELED', 'COMPLETED']).optional(),
        assignedToId: z.string().optional(),
    }),
});

export const projectIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Project ID is required'),
    }),
});
