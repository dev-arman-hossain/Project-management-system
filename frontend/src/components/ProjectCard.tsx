'use client';

import { Project } from '@/types';
import { projectsAPI } from '@/lib/api';
import { useState } from 'react';
import { Clock, User, Trash2 } from 'lucide-react';

const statusColors = {
    WIP: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    NRA: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    DELIVERED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    REVISION: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    CANCELED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const statusLabels = {
    WIP: 'Work in Progress',
    NRA: 'Need Review/Approval',
    DELIVERED: 'Delivered',
    REVISION: 'Revision',
    CANCELED: 'Canceled',
    COMPLETED: 'Completed',
};

interface ProjectCardProps {
    project: Project;
    onUpdate: () => void;
    isAdmin: boolean;
}

export default function ProjectCard({ project, onUpdate, isAdmin }: ProjectCardProps) {
    const [updating, setUpdating] = useState(false);

    const handleStatusChange = async (newStatus: string) => {
        try {
            setUpdating(true);
            await projectsAPI.update(project.id, { status: newStatus });
            onUpdate();
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            await projectsAPI.delete(project.id);
            onUpdate();
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                {isAdmin && (
                    <button
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {project.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {project.description}
                </p>
            )}

            <div className="space-y-3 mb-4">
                {project.assignedTo && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <User className="w-4 h-4" />
                        <span>{project.assignedTo.name}</span>
                    </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                </label>
                <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updating}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition disabled:opacity-50"
                >
                    {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
                <div className="flex items-center justify-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                        {statusLabels[project.status]}
                    </span>
                </div>
            </div>
        </div>
    );
}
