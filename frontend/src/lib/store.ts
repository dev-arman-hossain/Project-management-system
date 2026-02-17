import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthStore {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
    isAuthenticated: () => boolean;
    isAdmin: () => boolean;
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
        }),
        {
            name: 'auth-storage',
        }
    )
);
