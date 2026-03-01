'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataCache } from '@/lib/store';
import { usersAPI } from '@/lib/api';
import { User } from '@/types';
import { Users, Shield, User2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function UsersPage() {
    const router = useRouter();
    const { user: currentUser, clearAuth, isAdmin } = useAuthStore();
    const { cache, setCacheData, isCacheValid } = useDataCache();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!currentUser || !isAdmin()) {
            router.push('/dashboard');
            return;
        }

        // Check if we have valid cached data
        if (isCacheValid()) {
            // Use cached data immediately
            const cachedData = cache;
            if (cachedData) {
                setUsers(cachedData.users);
                setLoading(false);
                // Silently refresh in background
                silentRefresh();
            }
        } else {
            // No valid cache, fetch fresh data with loading
            fetchUsers();
        }
    }, [currentUser, mounted]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await usersAPI.getAll();
            const usersData = res.data.data.users;
            setUsers(usersData);
            // Update cache
            if (cache && currentUser) {
                setCacheData(cache.projects, usersData, cache.stats, currentUser.id);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const silentRefresh = async () => {
        try {
            const res = await usersAPI.getAll();
            const usersData = res.data.data.users;
            setUsers(usersData);
            // Update cache
            if (cache && currentUser) {
                setCacheData(cache.projects, usersData, cache.stats, currentUser.id);
            }
        } catch (error) {
            console.error('Failed to refresh users:', error);
        }
    };

    const handleLogout = () => {
        clearAuth();
        router.push('/login');
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />;
            case 'LEADER':
                return <User2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
            default:
                return <User2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
        }
    };

    if (!mounted || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const roleGroups = {
        ADMIN: users.filter((u) => u.role === 'ADMIN'),
        LEADER: users.filter((u) => u.role === 'LEADER'),
        MEMBER: users.filter((u) => u.role === 'MEMBER'),
    };

    return (
        <DashboardLayout
            user={currentUser}
            title="User Management"
            onLogout={handleLogout}
        >
            <div className="space-y-8">
                {/* User Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{users.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admins</p>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{roleGroups.ADMIN.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Members</p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{roleGroups.MEMBER.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <User2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                {Object.entries(roleGroups).map(([role, roleUsers]) =>
                    roleUsers.length > 0 ? (
                        <div key={role} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{role}s ({roleUsers.length})</h3>
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {roleUsers.map((u) => (
                                    <div
                                        key={u.id}
                                        className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center overflow-hidden">
                                                {u.profilePhoto ? (
                                                    <img src={u.profilePhoto} alt={u.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getRoleIcon(role)}
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{role}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null
                )}
            </div>
        </DashboardLayout>
    );
}
