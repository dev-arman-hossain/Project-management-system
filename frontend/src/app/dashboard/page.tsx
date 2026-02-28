'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { projectsAPI, usersAPI } from '@/lib/api';
import { Project, User, ProjectStats } from '@/types';
import { LogOut } from 'lucide-react';
import AdminDashboard from '@/components/AdminDashboard';
import LeaderDashboard from '@/components/LeaderDashboard';
import MemberDashboard from '@/components/MemberDashboard';
import UserManagement from '@/components/UserManagement';

export default function DashboardPage() {
    const router = useRouter();
    const { user, clearAuth, isAdmin, isLeader } = useAuthStore();
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<ProjectStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showUserManagement, setShowUserManagement] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!user) {
            router.push('/login');
            return;
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, router, mounted]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projectsRes, statsRes] = await Promise.all([
                projectsAPI.getAll(),
                projectsAPI.getStats(),
            ]);

            setProjects(projectsRes.data.data.projects);
            setStats(statsRes.data.data);

            if (user) {
                const usersRes = await usersAPI.getAll();
                setUsers(usersRes.data.data.users);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Silent background refresh — no loading spinner, used after status changes
    const silentRefresh = async () => {
        try {
            const [projectsRes, statsRes] = await Promise.all([
                projectsAPI.getAll(),
                projectsAPI.getStats(),
            ]);
            setProjects(projectsRes.data.data.projects);
            setStats(statsRes.data.data);
        } catch (error) {
            console.error('Failed to refresh data:', error);
        }
    };

    const handleLogout = () => {
        clearAuth();
        router.push('/login');
    };

    const handleProjectUpdated = () => {
        silentRefresh();
    };

    const handleUsersUpdated = () => {
        fetchData();
    };

    if (!mounted || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
    const getRoleBasedTitle = () => {
        if (isAdmin()) return 'Admin Dashboard';
        if (isLeader()) return 'Leader Dashboard';
        return 'Member Dashboard';
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {getRoleBasedTitle()}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Welcome back, {user?.name} • {user?.role}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {isAdmin() && (
                                <button
                                    onClick={() => setShowUserManagement(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Manage Users
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isAdmin() ? (
                    <AdminDashboard
                        user={user!}
                        projects={projects}
                        users={users}
                        stats={stats}
                        onProjectUpdated={handleProjectUpdated}
                        onUsersUpdated={handleUsersUpdated}
                    />
                ) : isLeader() ? (
                    <LeaderDashboard
                        user={user!}
                        projects={projects}
                        users={users}
                        stats={stats}
                        onProjectUpdated={handleProjectUpdated}
                    />
                ) : (
                    <MemberDashboard
                        user={user!}
                        projects={projects}
                        stats={stats}
                        onProjectUpdated={handleProjectUpdated}
                    />
                )}
            </div>

            {/* Dialogs */}
            {showUserManagement && (
                <UserManagement
                    users={users}
                    onClose={() => setShowUserManagement(false)}
                    onUpdate={handleUsersUpdated
            )}
        </div>
    );
}
