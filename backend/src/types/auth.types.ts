export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'MEMBER';
}

export interface JWTPayload {
    userId: string;
    email: string;
    role: 'ADMIN' | 'MEMBER';
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
