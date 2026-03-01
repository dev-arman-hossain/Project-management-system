'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataCache } from '@/lib/store';
import { projectsAPI, usersAPI, authAPI } from '@/lib/api';
import { Project, User, ProjectStats } from '@/types';
import AdminDashboard from '@/components/AdminDashboard';
import LeaderDashboard from '@/components/LeaderDashboard';
import MemberDashboard from '@/components/MemberDashboard';
import UserManagement from '@/components/UserManagement';
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardPage() {
    const router = useRouter();
    const { user, clearAuth, isAdmin, isLeader } = useAuthStore();
    const { cache, setCacheData, isCacheValid, clearCache } = useDataCache();

    const [projects, setProjects] = useState<Project[]>(useDataCache.getState().cache?.projects || []);
    const [users, setUsers] = useState<User[]>(useDataCache.getState().cache?.users || []);
    const [stats, setStats] = useState<ProjectStats | null>(useDataCache.getState().cache?.stats || null);
    const [loading, setLoading] = useState(!isCacheValid());
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

        // Check if we have valid cached data
        if (isCacheValid()) {
            // Use cached data immediately (no loading)
            const cachedData = cache;
            if (cachedData) {
                setProjects(cachedData.projects);
                setUsers(cachedData.users);
                setStats(cachedData.stats);
                setLoading(false);
                // Silently refresh in background
                silentRefresh();
            }
        } else {
            // No valid cache, fetch fresh data with loading
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, router, mounted]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projectsRes, statsRes] = await Promise.all([
                projectsAPI.getAll(),
                projectsAPI.getStats(),
            ]);

            const projectsData = projectsRes.data.data.projects;
            const statsData = statsRes.data.data;

            setProjects(projectsData);
            setStats(statsData);

            if (user) {
                const usersRes = await usersAPI.getAll();
                const usersData = usersRes.data.data.users;
                setUsers(usersData);
                // Update cache with userId
                setCacheData(projectsData, usersData, statsData, user.id);
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
            const projectsData = projectsRes.data.data.projects;
            const statsData = statsRes.data.data;
            setProjects(projectsData);
            setStats(statsData);

            if (user) {
                const usersRes = await usersAPI.getAll();
                const usersData = usersRes.data.data.users;
                setUsers(usersData);
                // Update cache with userId
                setCacheData(projectsData, usersData, statsData, user.id);
            }
        } catch (error) {
            console.error('Failed to refresh data:', error);
        }
    };

    const handleLogout = async () => {
        try {
            // Try to logout from the server
            await authAPI.logout().catch(() => {
                // Ignore errors from server logout, proceed with client cleanup
            });
        } catch {
            // Silently ignore logout errors
        } finally {
            // Clear cache and auth state
            clearCache();
            clearAuth();
            // Navigate to login
            router.replace('/login');
        }
    };

    const handleProjectUpdated = () => {
        silentRefresh();
    };

    const handleUsersUpdated = () => {
        silentRefresh();
    };

    if (!mounted && !isCacheValid()) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user && mounted) {
        router.push('/login');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (loading && !isCacheValid()) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const getRoleBasedTitle = () => {
        if (isAdmin()) return 'Admin Dashboard';
        if (isLeader()) return 'Leader Dashboard';
        return 'Member Dashboard';
    };

    return (
        <DashboardLayout
            user={user}
            title={getRoleBasedTitle()}
            onLogout={handleLogout}
            onManageUsers={isAdmin() ? () => setShowUserManagement(true) : undefined}
        >
            {isAdmin() ? (
                <AdminDashboard
                    user={user!}
                    projects={projects}
                    users={users}
                    stats={stats}
                    onProjectUpdated={handleProjectUpdated}
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
                    onProjectUpdated={handleProjectUpdated}
                />
            )}

            {/* User Management Modal */}
            {showUserManagement && (
                <UserManagement
                    users={users}
                    onClose={() => setShowUserManagement(false)}
                    onUpdate={handleUsersUpdated}
                />
            )}
        </DashboardLayout>
    );
}
