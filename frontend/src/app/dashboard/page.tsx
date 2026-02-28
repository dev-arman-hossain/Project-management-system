'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { projectsAPI, usersAPI } from '@/lib/api';
import { Project, User, ProjectStats } from '@/types';
import AdminDashboard from '@/components/AdminDashboard';
import LeaderDashboard from '@/components/LeaderDashboard';
import MemberDashboard from '@/components/MemberDashboard';
import UserManagement from '@/components/UserManagement';
import DashboardLayout from '@/components/DashboardLayout';

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
