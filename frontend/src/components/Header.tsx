'use client';

import { LogOut, Menu, X, Users } from 'lucide-react';
import { User } from '@/types';

interface HeaderProps {
    user: User | null;
    title: string;
    onLogout: () => void;
    onMenuToggle: () => void;
    isMenuOpen: boolean;
    onManageUsers?: () => void;
}

export default function Header({
    user,
    title,
    onLogout,
    onMenuToggle,
    isMenuOpen,
    onManageUsers,
}: HeaderProps) {
    const isAdmin = user?.role === 'ADMIN';

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        )}
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Welcome, {user?.name} • <span className="font-medium">{user?.role}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isAdmin && onManageUsers && (
                        <button
                            onClick={onManageUsers}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
                        >
                            <Users className="w-4 h-4" />
                            Manage Users
                        </button>
                    )}
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
