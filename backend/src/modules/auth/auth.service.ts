import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../config/index';
import { AuthenticationError, ConflictError } from '../../utils/errors';
import { JWTPayload } from '../../types/auth.types';
import { prisma } from '../../lib/prisma';

export class AuthService {
    /**
     * Register a new user
     */
    static async register(data: {
        email: string;
        name: string;
        password: string;
        role?: 'ADMIN' | 'MEMBER';
    }) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new ConflictError('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: hashedPassword,
                role: data.role || 'MEMBER',
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        return user;
    }

    /**
     * Login user
     */
    static async login(email: string, password: string) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new AuthenticationError('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid credentials');
        }

        // Generate JWT token
        const token = this.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Create session
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                expiresAt,
            },
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        };
    }

    /**
     * Logout user
     */
    static async logout(token: string) {
        await prisma.session.deleteMany({
            where: { token },
        });
    }

    /**
     * Verify token
     */
    static async verifyToken(token: string) {
        try {
            jwt.verify(token, config.jwtSecret) as JWTPayload;

            // Check if session exists
            const session = await prisma.session.findUnique({
                where: { token },
                include: { user: true },
            });

            if (!session || session.expiresAt < new Date()) {
                throw new AuthenticationError('Session expired');
            }

            return {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role,
            };
        } catch (error) {
            throw new AuthenticationError('Invalid token');
        }
    }

    /**
     * Generate JWT token
     */
    private static generateToken(payload: JWTPayload): string {
        return jwt.sign(payload, config.jwtSecret, {
            expiresIn: '7d',
        });
    }

    /**
     * Refresh token
     */
    static async refreshToken(oldToken: string) {
        const user = await this.verifyToken(oldToken);

        // Delete old session
        await prisma.session.deleteMany({
            where: { token: oldToken },
        });

        // Generate new token
        const newToken = this.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Create new session
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await prisma.session.create({
            data: {
                userId: user.id,
                token: newToken,
                expiresAt,
            },
        });

        return {
            user,
            token: newToken,
        };
    }
}
