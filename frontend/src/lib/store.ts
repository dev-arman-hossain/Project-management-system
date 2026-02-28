import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Project, ProjectStats } from '@/types';

interface AuthStore {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
    isAuthenticated: () => boolean;
    isAdmin: () => boolean;
    isLeader: () => boolean;
}

interface DataCache {
    projects: Project[];
    users: User[];
    stats: ProjectStats | null;
    lastFetched: number;
}

interface DataStore {
    cache: DataCache | null;
    setCacheData: (projects: Project[], users: User[], stats: ProjectStats | null) => void;
    getCacheData: () => DataCache | null;
    isCacheValid: (maxAgeMinutes?: number) => boolean;
    clearCache: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,

            setAuth: (user, token) => {
                set({ user, token });
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
            },

            clearAuth: () => {
                set({ user: null, token: null });
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            },

            isAuthenticated: () => {
                const { token } = get();
                return !!token;
            },

            isAdmin: () => {
                const { user } = get();
                return user?.role === 'ADMIN';
            },

            isLeader: () => {
                const { user } = get();
                return user?.role === 'LEADER';
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);

// Data cache store (non-persistent, cleared on page refresh)
export const useDataCache = create<DataStore>((set, get) => ({
    cache: null,

    setCacheData: (projects, users, stats) => {
        set({
            cache: {
                projects,
                users,
                stats,
                lastFetched: Date.now(),
            },
        });
    },

    getCacheData: () => {
        return get().cache;
    },

    isCacheValid: (maxAgeMinutes = 5) => {
        const cache = get().cache;
        if (!cache) return false;
        const ageMinutes = (Date.now() - cache.lastFetched) / 1000 / 60;
        return ageMinutes < maxAgeMinutes;
    },

    clearCache: () => {
        set({ cache: null });
    },
}));
