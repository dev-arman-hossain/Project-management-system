export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'LEADER' | 'MEMBER';
}

export interface JWTPayload {
    userId: string;
    email: string;
    role: 'ADMIN' | 'LEADER' | 'MEMBER';
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
