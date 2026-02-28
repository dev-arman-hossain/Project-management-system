'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sliders } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function SettingsPage() {
    const router = useRouter();
    const { user, clearAuth, isAdmin } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!user || !isAdmin()) {
            router.push('/dashboard');
            return;
        }
    }, [user, mounted]);

    const handleLogout = () => {
        clearAuth();
        router.push('/login');
    };

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <DashboardLayout
            user={user}
            title="Settings"
            onLogout={handleLogout}
        >
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                        <Sliders className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage application settings and preferences</p>
                    </div>
                </div>

                {/* Settings sections will be added here */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h2>
                        <p className="text-gray-600 dark:text-gray-400">Configure general application settings</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h2>
                        <p className="text-gray-600 dark:text-gray-400">Manage notification preferences</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
