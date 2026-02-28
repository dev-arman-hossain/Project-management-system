'use client';

import { useState } from 'react';
import { User, ProjectStats } from '@/types';
import Header from './Header';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
    user: User | null;
    title: string;
    onLogout: () => void;
    onManageUsers?: () => void;
    children: React.ReactNode;
}

export default function DashboardLayout({
    user,
    title,
    onLogout,
    onManageUsers,
    children,
}: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex h-screen flex-col">
                {/* Header */}
                <Header
                    user={user}
                    title={title}
                    onLogout={onLogout}
                    onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    isMenuOpen={isSidebarOpen}
                    onManageUsers={onManageUsers}
                />

                {/* Main Content Area */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <Sidebar
                        user={user}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
