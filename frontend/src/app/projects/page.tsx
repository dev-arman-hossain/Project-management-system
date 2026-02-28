'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { projectsAPI } from '@/lib/api';
import { Project } from '@/types';
import { FolderKanban } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import DashboardLayout from '@/components/DashboardLayout';

export default function ProjectsPage() {
    const router = useRouter();
    const { user, clearAuth } = useAuthStore();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
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
        fetchProjects();
    }, [user, mounted]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await projectsAPI.getAll();
            setProjects(res.data.data.projects);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        clearAuth();
        router.push('/login');
    };

    if (!mounted || loading) {
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Projects</h1>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total: <span className="font-semibold text-gray-900 dark:text-white">{projects.length}</span>
                    </div>
                </div>

                {projects.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center border border-gray-200 dark:border-gray-700">
                        <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No projects found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onUpdate={fetchProjects}
                                isAdmin={user?.role !== 'MEMBER' || project.assignedToId === user?.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
