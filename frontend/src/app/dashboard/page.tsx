'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { projectsAPI, usersAPI } from '@/lib/api';
import { Project, User } from '@/types';
import { LogOut, Plus, Users, FolderKanban, BarChart3 } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import UserManagement from '@/components/UserManagement';

export default function DashboardPage() {
    const router = useRouter();
    const { user, clearAuth, isAdmin } = useAuthStore();
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [showUserManagement, setShowUserManagement] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, router]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projectsRes, statsRes] = await Promise.all([
                projectsAPI.getAll(),
                projectsAPI.getStats(),
            ]);

            setProjects(projectsRes.data.data.projects);
            setStats(statsRes.data.data);

            if (isAdmin()) {
                const usersRes = await usersAPI.getAll();
                setUsers(usersRes.data.data.users);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        clearAuth();
        router.push('/login');
    };

    const handleProjectCreated = () => {
        setShowCreateProject(false);
        fetchData();
    };

    const handleProjectUpdated = () => {
        fetchData();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Project Management
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Welcome back, {user?.name} ({user?.role})
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {isAdmin() && (
                                <>
                                    <button
                                        onClick={() => setShowUserManagement(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition"
                                    >
                                        <Users className="w-4 h-4" />
                                        Manage Users
                                    </button>
                                    <button
                                        onClick={() => setShowCreateProject(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                                    >
                                        <Plus className="w-4 h-4" />
                                        New Project
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats?.total || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                <FolderKanban className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    {stats?.byStatus?.WIP || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    {stats?.byStatus?.COMPLETED || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects Grid */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        {isAdmin() ? 'All Projects' : 'My Projects'}
                    </h2>
                    {projects.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
                            <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">No projects found</p>
                            {isAdmin() && (
                                <button
                                    onClick={() => setShowCreateProject(true)}
                                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                                >
                                    Create Your First Project
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onUpdate={handleProjectUpdated}
                                    isAdmin={isAdmin()}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Dialogs */}
            {showCreateProject && (
                <CreateProjectDialog
                    users={users}
                    onClose={() => setShowCreateProject(false)}
                    onSuccess={handleProjectCreated}
                />
            )}

            {showUserManagement && (
                <UserManagement
                    users={users}
                    onClose={() => setShowUserManagement(false)}
                    onUpdate={fetchData}
                />
            )}
        </div>
    );
}
