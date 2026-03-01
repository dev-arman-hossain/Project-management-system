'use client';

import { useMemo, useState } from 'react';
import {
    FolderKanban,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    UserCheck,
    Calendar,
    Plus,
    IndianRupee,
} from 'lucide-react';
import { Project, User } from '@/types';
import ProjectCard from './ProjectCard';
import CreateProjectDialog from './CreateProjectDialog';

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
    const [showCreateProject, setShowCreateProject] = useState(false);

    // Filter projects assigned to this member
    const assignedProjects = useMemo(() => {
        return projects.filter((p) => p.assignedToId === user.id || p.createdById === user.id);
    }, [projects, user.id]);

    // Calculate statistics for assigned projects
    const memberStats = useMemo(() => {
        return {
            total: assignedProjects.length,
            completed: assignedProjects.filter((p) => p.status === 'COMPLETED').length,
            inProgress: assignedProjects.filter((p) => p.status === 'WIP').length,
            revision: assignedProjects.filter((p) => p.status === 'REVISION').length,
            canceled: assignedProjects.filter((p) => p.status === 'CANCELED').length,
            totalValue: assignedProjects
                .filter((p) => p.status === 'COMPLETED' || p.status === 'DELIVERED')
                .reduce((sum, p) => sum + (p.value || 0), 0),
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
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Member Dashboard</h2>
                <button
                    onClick={() => setShowCreateProject(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    New Project
                </button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{memberStats.total}</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                            <FolderKanban className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">In Progress</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{memberStats.inProgress}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completed</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{memberStats.completed}</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revision</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{memberStats.revision}</p>
                        </div>
                        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Delivery</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">${memberStats.totalValue.toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                            <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rate</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{completionRate}%</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
                                                    className={`text-xs font-medium px-2 py-1 rounded ${project.status === 'WIP'
                                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                        }`}
                                                >
                                                    {project.status}
                                                </span>
                                                {daysUntilDeadline !== null && (
                                                    <span
                                                        className={`text-xs font-medium ${isUrgent
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
                                        {typeof project.value === 'number' && (
                                            <div className="shrink-0 self-center ml-auto">
                                                <div className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 shadow-sm">
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none mb-0.5">Value</p>
                                                        <p className="text-base font-bold text-gray-900 dark:text-white tabular-nums leading-none">${project.value.toLocaleString()}</p>
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

            {/* Dialogs */}
            {showCreateProject && (
                <CreateProjectDialog
                    user={user}
                    users={[]} // Members don't need to see other users to assign
                    onClose={() => setShowCreateProject(false)}
                    onSuccess={() => {
                        setShowCreateProject(false);
                        onProjectUpdated();
                    }}
                />
            )}
        </div>
    );
}
