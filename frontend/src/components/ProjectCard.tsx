'use client';

import { Project } from '@/types';
import { projectsAPI } from '@/lib/api';
import { Clock, User, Trash2, Calendar } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

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

const GoogleSheetIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#0F9D58" />
        <path d="M14 2V8H20L14 2Z" fill="#B7E1CD" />
        <path d="M8 13H16V15H8V13Z" fill="white" />
        <path d="M8 17H16V19H8V17Z" fill="white" />
        <path d="M8 9H11V11H8V9Z" fill="white" />
    </svg>
);

interface ProjectCardProps {
    project: Project;
    onUpdate: () => void;
    isAdmin: boolean;
}

export default function ProjectCard({ project, onUpdate, isAdmin }: ProjectCardProps) {
    const [updating, setUpdating] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>('');

    const calculateTimeLeft = useMemo(() => {
        return () => {
            if (!project.deadline) return '';
            const deadline = new Date(project.deadline).getTime();
            const now = new Date().getTime();
            const diff = deadline - now;

            if (diff <= 0) return 'Overdue';

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        };
    }, [project.deadline]);

    useEffect(() => {
        if (!project.deadline) return;

        const updateTimer = () => setTimeLeft(calculateTimeLeft());
        updateTimer();

        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [calculateTimeLeft, project.deadline]);

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

    const getTimerStyles = () => {
        if (!project.deadline) return '';
        const diff = new Date(project.deadline).getTime() - Date.now();
        const days = diff / (1000 * 60 * 60 * 24);

        if (timeLeft === 'Overdue' || days <= 2) {
            return 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30';
        }
        if (days <= 7) {
            return 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/30';
        }
        return 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    {project.sheetOption !== 'NOT_PROVIDED' && (
                        project.sheetOption === 'PROVIDED' && project.sheetUrl ? (
                            <a
                                href={project.sheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                title="Open Google Sheet"
                            >
                                <GoogleSheetIcon className="w-6 h-6" />
                            </a>
                        ) : (
                            <div
                                className="p-1"
                                title="Sheet will be provided later"
                            >
                                <GoogleSheetIcon className="w-6 h-6 opacity-30 grayscale" />
                            </div>
                        )
                    )}
                    {isAdmin && (
                        <button
                            onClick={handleDelete}
                            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition"
                            title="Delete Project"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {project.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {project.description}
                </p>
            )}

            <div className="mt-4 space-y-4">
                {/* Meta Dates Section */}
                <div className="grid grid-cols-2 gap-4 pb-2">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Started</span>
                            <span className="text-sm font-semibold">{new Date(project.startDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 opacity-70 shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Last Update</span>
                            <span className="text-xs">{new Date(project.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100 dark:border-gray-700/50" />

                {/* Footer Management Section */}
                <div className="pt-2 space-y-4">
                    {project.assignedTo && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 px-1">
                            <User className="w-3.5 h-3.5" />
                            <span>Assigned to: <span className="font-semibold text-gray-700 dark:text-gray-300">{project.assignedTo.name}</span></span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                Project Status
                            </label>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[project.status]}`}>
                                {statusLabels[project.status]}
                            </span>
                        </div>
                        <select
                            value={project.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={updating}
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                        >
                            {Object.entries(statusLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Deadline & Countdown Hero Section - Moved to Bottom */}
                <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-tight">Deadline</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}
                        </span>
                    </div>
                    {project.deadline && (
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all shadow-sm ${getTimerStyles()}`}>
                            <Clock className="w-6 h-6 opacity-80" />
                            <span className="text-xl font-bold tracking-tighter tabular-nums">
                                {timeLeft || 'Calculating...'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
