'use client';

import { useState } from 'react';
import {
    BarChart3,
    FolderKanban,
    Users,
    AlertCircle,
    TrendingUp,
    CheckCircle,
    Clock,
    XCircle,
    IndianRupee,
} from 'lucide-react';
import { Project, User, ProjectStats } from '@/types';
import ProjectCard from './ProjectCard';
import CreateProjectDialog from './CreateProjectDialog';

interface AdminDashboardProps {
    user: User;
    projects: Project[];
    users: User[];
    stats: ProjectStats | null;
    onProjectUpdated: () => void;
}

export default function AdminDashboard({
    user,
    projects,
    users,
    stats,
    onProjectUpdated,
}: AdminDashboardProps) {
    const [showCreateProject, setShowCreateProject] = useState(false);

    const adminCount = users.filter((u) => u.role === 'ADMIN').length;
    const leaderCount = users.filter((u) => u.role === 'LEADER').length;
    const memberCount = users.filter((u) => u.role === 'MEMBER').length;

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
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats?.total || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                            <FolderKanban className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{users.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {stats?.total ? Math.round((stats?.byStatus?.COMPLETED || 0) / stats.total * 100) : 0}%
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg per User</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {users.length && stats ? Math.round(stats.total / users.length) : 0}
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
                                ₹{(stats?.totalValue || 0).toLocaleString()}
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

                    return (
                        <div
                            key={status.label}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{status.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{status.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[status.color as keyof typeof colorClasses]}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Distribution</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Admins</span>
                            <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-red-600 h-2 rounded-full"
                                        style={{
                                            width: users.length ? `${(adminCount / users.length) * 100}%` : 0,
                                        }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{adminCount}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Leaders</span>
                            <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{
                                            width: users.length ? `${(leaderCount / users.length) * 100}%` : 0,
                                        }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{leaderCount}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Members</span>
                            <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{
                                            width: users.length ? `${(memberCount / users.length) * 100}%` : 0,
                                        }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{memberCount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Leaders</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {users
                            .filter((u) => u.role === 'LEADER')
                            .map((leader) => (
                                <div key={leader.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{leader.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{leader.email}</p>
                                    </div>
                                </div>
                            ))}
                        {users.filter((u) => u.role === 'LEADER').length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No leaders yet</p>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Users</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {users.slice(0, 5).map((u) => (
                            <div key={u.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{u.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Projects */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Projects</h2>
                    <button
                        onClick={() => setShowCreateProject(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2"
                    >
                        + New Project
                    </button>
                </div>

                {projects.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center border border-gray-200 dark:border-gray-700">
                        <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No projects yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
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
                    users={users}
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
