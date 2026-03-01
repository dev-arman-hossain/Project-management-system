import { z } from 'zod';

export const updateUserSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
        role: z.enum(['ADMIN', 'MEMBER']).optional(),
        profilePhoto: z.string().optional(),
    }),
});

export const userIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'User ID is required'),
    }),
});
