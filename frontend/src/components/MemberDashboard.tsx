'use client';

import { useMemo } from 'react';
import {
    FolderKanban,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    UserCheck,
    Calendar,
} from 'lucide-react';
import { Project, User } from '@/types';
import ProjectCard from './ProjectCard';

interface MemberDashboardProps {
    user: User;
    projects: Project[];
    onProjectUpdated: () => void;
}

export default function MemberDashboard({
    user,
    projects,
    onProjectUpdated,
}: MemberDashboardProps) {
    // Filter projects assigned to this member
    const assignedProjects = useMemo(() => {
        return projects.filter((p) => p.assignedToId === user.id);
    }, [projects, user.id]);

    // Calculate statistics for assigned projects
    const memberStats = useMemo(() => {
        return {
            total: assignedProjects.length,
            completed: assignedProjects.filter((p) => p.status === 'COMPLETED').length,
            inProgress: assignedProjects.filter((p) => p.status === 'WIP').length,
            revision: assignedProjects.filter((p) => p.status === 'REVISION').length,
            canceled: assignedProjects.filter((p) => p.status === 'CANCELED').length,
        };
    }, [assignedProjects]);

    const completionRate =
        memberStats.total > 0 ? Math.round((memberStats.completed / memberStats.total) * 100) : 0;

    // Get projects by deadline urgency
    const urgentProjects = assignedProjects
        .filter((p) => p.status !== 'COMPLETED' && p.status !== 'CANCELED')
        .sort((a, b) => {
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        })
        .slice(0, 3);

    return (
        <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned Projects</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{memberStats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                            <FolderKanban className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{memberStats.inProgress}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{memberStats.completed}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{completionRate}%</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Status Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{memberStats.inProgress}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{memberStats.completed}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revision</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{memberStats.revision}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Canceled</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{memberStats.canceled}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Urgent/Upcoming Projects */}
            {urgentProjects.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming & Active</h3>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {urgentProjects.map((project) => {
                            const daysUntilDeadline = project.deadline
                                ? Math.ceil(
                                    (new Date(project.deadline).getTime() - new Date().getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                                : null;

                            const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 3;

                            return (
                                <div
                                    key={project.id}
                                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white">{project.title}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {project.description}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span
                                                    className={`text-xs font-medium px-2 py-1 rounded ${
                                                        project.status === 'WIP'
                                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                    }`}
                                                >
                                                    {project.status}
                                                </span>
                                                {daysUntilDeadline !== null && (
                                                    <span
                                                        className={`text-xs font-medium ${
                                                            isUrgent
                                                                ? 'text-red-600 dark:text-red-400'
                                                                : 'text-gray-600 dark:text-gray-400'
                                                        }`}
                                                    >
                                                        {daysUntilDeadline > 0
                                                            ? `${daysUntilDeadline} days left`
                                                            : daysUntilDeadline === 0
                                                                ? 'Due today'
                                                                : 'Overdue'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {project.value && project.value > 0 && (
                                            <div className="shrink-0">
                                                <div className="relative bg-linear-to-br from-yellow-300 via-orange-400 to-red-500 dark:from-orange-500 dark:via-red-500 dark:to-yellow-600 rounded-2xl px-6 py-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border-2 border-white/50 dark:border-yellow-300/50">
                                                    <div className="absolute inset-0 bg-white/10 dark:bg-black/10 rounded-2xl" />
                                                    <div className="relative z-10">
                                                        <p className="text-xs font-black text-white dark:text-gray-900 uppercase tracking-widest mb-1">Project Value</p>
                                                        <p className="text-3xl font-black text-white dark:text-gray-900 tabular-nums leading-none">₹{project.value.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* All Assigned Projects */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">All Assigned Projects</h2>

                {assignedProjects.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center border border-gray-200 dark:border-gray-700">
                        <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No projects assigned to you yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assignedProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onUpdate={onProjectUpdated}
                                isAdmin={false}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
