'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataCache } from '@/lib/store';
import { projectsAPI, usersAPI } from '@/lib/api';
import { Project, User } from '@/types';
import { FolderKanban, Plus } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import DashboardLayout from '@/components/DashboardLayout';
import CreateProjectDialog from '@/components/CreateProjectDialog';

export default function ProjectsPage() {
    const router = useRouter();
    const { user, clearAuth } = useAuthStore();
    const { cache, setCacheData, isCacheValid } = useDataCache();

    const [projects, setProjects] = useState<Project[]>(useDataCache.getState().cache?.projects || []);
    const [users, setUsers] = useState<User[]>(useDataCache.getState().cache?.users || []);
    const [loading, setLoading] = useState(!isCacheValid());
    const [showCreateProject, setShowCreateProject] = useState(false);
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
            // Use cached data immediately
            const cachedData = cache;
            if (cachedData) {
                setProjects(cachedData.projects);
                setLoading(false);
                // Silently refresh in background
                silentRefresh();
            }
        } else {
            // No valid cache, fetch fresh data with loading
            fetchData();
        }
    }, [user, mounted]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projectsRes, usersRes] = await Promise.all([
                projectsAPI.getAll(),
                usersAPI.getAll()
            ]);

            const projectsData = projectsRes.data.data.projects;
            const usersData = usersRes.data.data.users;

            setProjects(projectsData);
            setUsers(usersData);

            // Update cache
            if (cache && user) {
                setCacheData(projectsData, usersData, cache.stats, user.id);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };


    const silentRefresh = async () => {
        try {
            const [projectsRes, usersRes] = await Promise.all([
                projectsAPI.getAll(),
                usersAPI.getAll()
            ]);

            const projectsData = projectsRes.data.data.projects;
            const usersData = usersRes.data.data.users;

            setProjects(projectsData);
            setUsers(usersData);

            // Update cache
            if (cache && user) {
                setCacheData(projectsData, usersData, cache.stats, user.id);
            }
        } catch (error) {
            console.error('Failed to refresh data:', error);
        }
    };

    const handleLogout = () => {
        clearAuth();
        router.push('/login');
    };

    if ((!mounted || loading) && !isCacheValid()) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <DashboardLayout
            user={user}
            title="Projects"
            onLogout={handleLogout}
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Projects</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Total: <span className="font-semibold text-gray-900 dark:text-white">{projects.length}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateProject(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Project
                    </button>
                </div>

                {projects.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center border border-gray-200 dark:border-gray-700">
                        <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No projects found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects
                            .filter((project) =>
                                user?.role !== 'MEMBER' ||
                                project.assignedToId === user?.id ||
                                project.createdById === user?.id
                            )
                            .map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onUpdate={fetchData}
                                    isAdmin={user?.role !== 'MEMBER' || project.createdById === user?.id || project.assignedToId === user?.id}
                                />
                            ))}
                    </div>
                )}
            </div>

            {/* Dialogs */}
            {showCreateProject && (
                <CreateProjectDialog
                    user={user!}
                    users={users}
                    onClose={() => setShowCreateProject(false)}
                    onSuccess={() => {
                        setShowCreateProject(false);
                        silentRefresh();
                    }}
                />
            )}
        </DashboardLayout>
    );
}
