export interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'LEADER' | 'MEMBER';
    createdAt?: string;
    updatedAt?: string;
}

export interface Project {
    id: string;
    title: string;
    description?: string;
    status: ProjectStatus;
    assignedToId?: string;
    assignedTo?: {
        id: string;
        name: string;
        email: string;
    };
    createdById: string;
    createdBy?: {
        id: string;
        name: string;
        email: string;
    };
    sheetUrl?: string;
    sheetOption: SheetOption;
    startDate: string;
    deadline?: string;
    createdAt: string;
    updatedAt: string;
}

export type SheetOption = 'PROVIDED' | 'NOT_PROVIDED' | 'WILL_PROVIDE_LATER';

export type ProjectStatus = 'WIP' | 'NRA' | 'DELIVERED' | 'REVISION' | 'CANCELED' | 'COMPLETED';

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        token: string;
    };
    message?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        details?: any;
    };
    message?: string;
}

export interface ProjectStats {
    total: number;
    byStatus: {
        WIP: number;
        NRA: number;
        DELIVERED: number;
        REVISION: number;
        CANCELED: number;
        COMPLETED: number;
    };
}
