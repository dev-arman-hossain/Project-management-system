'use client';

import { useState } from 'react';
import {
    BarChart3,
    FolderKanban,
    Users,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    Plus,
    IndianRupee,
} from 'lucide-react';
import { Project, User, ProjectStats } from '@/types';
import ProjectCard from './ProjectCard';
import CreateProjectDialog from './CreateProjectDialog';

interface LeaderDashboardProps {
    user: User;
    projects: Project[];
    users: User[];
    stats: ProjectStats | null;
    onProjectUpdated: () => void;
}

export default function LeaderDashboard({
    user,
    projects,
    users,
    stats,
    onProjectUpdated,
}: LeaderDashboardProps) {
    const [showCreateProject, setShowCreateProject] = useState(false);

    const createdProjects = projects.filter((p) => p.createdById === user.id);
    const teamMembers = users.filter((u) => u.role === 'MEMBER');

    const projectStatuses = [
        { label: 'In Progress', value: stats?.byStatus?.WIP || 0, icon: Clock, color: 'blue' },
        { label: 'Completed', value: stats?.byStatus?.COMPLETED || 0, icon: CheckCircle, color: 'green' },
        { label: 'Revision', value: stats?.byStatus?.REVISION || 0, icon: AlertCircle, color: 'yellow' },
        { label: 'Canceled', value: stats?.byStatus?.CANCELED || 0, icon: XCircle, color: 'red' },
    ];

    return (
        <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Projects</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{createdProjects.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                            <FolderKanban className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Members</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{teamMembers.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {createdProjects.length
                                    ? Math.round(
                                        (createdProjects.filter((p) => p.status === 'COMPLETED').length /
                                            createdProjects.length) *
                                        100
                                    )
                                    : 0}
                                %
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {createdProjects.filter((p) => p.status === 'WIP').length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Delivery</p>
                            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                                ₹{projects
                                    .filter((p) => (p.status === 'COMPLETED' || p.status === 'DELIVERED') && p.createdById === user.id)
                                    .reduce((sum, p) => sum + (p.value || 0), 0)
                                    .toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <IndianRupee className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Status Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {projectStatuses.map((status) => {
                    const Icon = status.icon;
                    const colorClasses = {
                        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                        green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                        yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
                        red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
                    };

                    const statusCount = createdProjects.filter(
                        (p) => p.status === status.label.replace(' ', '_').toUpperCase()
                    ).length;

                    return (
                        <div
                            key={status.label}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{status.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{statusCount}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[status.color as keyof typeof colorClasses]}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Team Members */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {teamMembers.length === 0 ? (
                                <div className="p-6 text-center text-gray-500 dark:text-gray-400">No team members yet</div>
                            ) : (
                                teamMembers.map((member) => {
                                    const assignedCount = projects.filter((p) => p.assignedToId === member.id).length;
                                    const completedCount = projects.filter(
                                        (p) => p.assignedToId === member.id && p.status === 'COMPLETED'
                                    ).length;

                                    return (
                                        <div
                                            key={member.id}
                                            className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {assignedCount} assigned
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {completedCount} completed
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                    <button
                        onClick={() => setShowCreateProject(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition mb-3"
                    >
                        <Plus className="w-5 h-5" />
                        New Project
                    </button>
                </div>
            </div>

            {/* Projects */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Projects</h2>
                </div>

                {createdProjects.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center border border-gray-200 dark:border-gray-700">
                        <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-4">No projects created yet</p>
                        <button
                            onClick={() => setShowCreateProject(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                        >
                            Create Your First Project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {createdProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onUpdate={onProjectUpdated}
                                isAdmin={true}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Dialogs */}
            {showCreateProject && (
                <CreateProjectDialog
                    user={user}
                    users={teamMembers}
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
