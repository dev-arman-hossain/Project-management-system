'use client';

import { Project, ProjectStatus } from '@/types';
import { projectsAPI } from '@/lib/api';
import { Clock, User, Trash2, Calendar, CheckCircle2, CalendarX, Pencil, Check, X } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/store';

// Pastel badge colors (top badge)
const statusBadgeColors: Record<ProjectStatus, string> = {
    WIP: 'bg-sky-100     text-sky-700     border border-sky-200',
    NRA: 'bg-amber-100   text-amber-700   border border-amber-200',
    DELIVERED: 'bg-violet-100  text-violet-700  border border-violet-200',
    REVISION: 'bg-orange-100  text-orange-600  border border-orange-200',
    CANCELED: 'bg-rose-100    text-rose-600    border border-rose-200',
    COMPLETED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
};

// Dropdown background tints
const statusSelectStyles: Record<ProjectStatus, string> = {
    WIP: 'bg-sky-50      border-sky-300      text-sky-800      dark:bg-sky-900/30      dark:border-sky-700      dark:text-sky-200',
    NRA: 'bg-amber-50    border-amber-300    text-amber-800    dark:bg-amber-900/30    dark:border-amber-700    dark:text-amber-200',
    DELIVERED: 'bg-violet-50   border-violet-300   text-violet-800   dark:bg-violet-900/30   dark:border-violet-700   dark:text-violet-200',
    REVISION: 'bg-orange-50   border-orange-300   text-orange-800   dark:bg-orange-900/30   dark:border-orange-700   dark:text-orange-200',
    CANCELED: 'bg-rose-50     border-rose-300     text-rose-800     dark:bg-rose-900/30     dark:border-rose-700     dark:text-rose-200',
    COMPLETED: 'bg-emerald-50  border-emerald-300  text-emerald-800  dark:bg-emerald-900/30  dark:border-emerald-700  dark:text-emerald-200',
};

const statusLabels: Record<ProjectStatus, string> = {
    WIP: 'Work in Progress',
    NRA: 'Need Review / Approval',
    DELIVERED: 'Delivered',
    REVISION: 'Revision',
    CANCELED: 'Canceled',
    COMPLETED: 'Completed',
};

const TERMINAL_STATUSES: ProjectStatus[] = ['DELIVERED', 'COMPLETED', 'CANCELED'];

const GoogleSheetIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
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

export default function ProjectCard({ project, onUpdate, isAdmin: isGlobalOwner }: ProjectCardProps) {
    const { user } = useAuthStore();

    // Permission check: Admin, Leader, or the assigned Member
    const canEdit = isGlobalOwner || (user?.role === 'MEMBER' && project.assignedToId === user?.id);

    // ── Optimistic local state ──
    const [localStatus, setLocalStatus] = useState<ProjectStatus>(project.status);
    const [localTitle, setLocalTitle] = useState(project.title);
    const [localDeadline, setLocalDeadline] = useState(
        project.deadline ? new Date(new Date(project.deadline).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''
    );

    // ── Edit mode toggles ──
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingDeadline, setEditingDeadline] = useState(false);

    // ── Countdown ──
    const [timeLeft, setTimeLeft] = useState<string>('');
    const titleInputRef = useRef<HTMLInputElement>(null);

    // Sync when parent refreshes
    useEffect(() => { setLocalStatus(project.status); }, [project.status]);
    useEffect(() => { setLocalTitle(project.title); }, [project.title]);
    useEffect(() => {
        setLocalDeadline(project.deadline ? new Date(new Date(project.deadline).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
    }, [project.deadline]);

    // Focus title input when edit mode opens
    useEffect(() => {
        if (editingTitle) titleInputRef.current?.focus();
    }, [editingTitle]);

    const calculateTimeLeft = useCallback(() => {
        const deadlineStr = localDeadline ? localDeadline : project.deadline;
        if (!deadlineStr) return '';
        const diff = new Date(deadlineStr).getTime() - Date.now();
        if (diff <= 0) return 'Overdue';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, [localDeadline, project.deadline]);

    useEffect(() => {
        const hasDeadline = localDeadline || project.deadline;
        if (!hasDeadline) return;
        const tick = () => setTimeLeft(calculateTimeLeft());
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [calculateTimeLeft, localDeadline, project.deadline]);

    // ── Handlers ──
    const handleStatusChange = async (newStatus: string) => {
        const prev = localStatus;
        setLocalStatus(newStatus as ProjectStatus);
        try {
            await projectsAPI.update(project.id, { status: newStatus });
            onUpdate();
        } catch {
            setLocalStatus(prev);
        }
    };

    const handleSaveTitle = async () => {
        const trimmed = localTitle.trim();
        if (!trimmed || trimmed === project.title) { setEditingTitle(false); return; }
        const prev = project.title;
        setEditingTitle(false);
        try {
            await projectsAPI.update(project.id, { title: trimmed });
            onUpdate();
        } catch {
            setLocalTitle(prev);
        }
    };

    const handleCancelTitle = () => {
        setLocalTitle(project.title);
        setEditingTitle(false);
    };

    const handleSaveDeadline = async () => {
        setEditingDeadline(false);
        const newDeadline = localDeadline || null;
        const prevDeadline = project.deadline
            ? new Date(new Date(project.deadline).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
            : '';
        if (localDeadline === prevDeadline) return;
        try {
            await projectsAPI.update(project.id, { deadline: newDeadline ?? undefined });
            onUpdate();
        } catch {
            setLocalDeadline(prevDeadline);
        }
    };

    const handleCancelDeadline = () => {
        setLocalDeadline(project.deadline ? new Date(new Date(project.deadline).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
        setEditingDeadline(false);
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

    // ── Styles ──
    const getTimerStyles = () => {
        const deadlineDate = localDeadline || project.deadline;
        if (!deadlineDate) return '';
        const days = (new Date(deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (timeLeft === 'Overdue' || days <= 2)
            return 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30';
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/30';
    };

    const getDeadlineDateColor = () => {
        const deadlineDate = localDeadline || project.deadline;
        if (!deadlineDate) return 'text-gray-400';
        const days = (new Date(deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return days <= 2 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-emerald-700 dark:text-emerald-400 font-bold';
    };

    const hasDeadline = !!(localDeadline || project.deadline);
    const showCountdown = hasDeadline && !TERMINAL_STATUSES.includes(localStatus);
    const isTerminal = TERMINAL_STATUSES.includes(localStatus);

    const displayDeadline = localDeadline
        ? new Date(localDeadline).toLocaleDateString()
        : project.deadline
            ? new Date(project.deadline).toLocaleDateString()
            : 'Not set';

    const formatDateTime = (dateStr: string | Date) => {
        if (!dateStr) return 'Not set';
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(new Date(dateStr));
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition">

            {/* ── Title row ── */}
            <div className="flex items-start justify-between mb-4 gap-2">
                <div className="flex-1 min-w-0 group">
                    {editingTitle ? (
                        <div className="flex items-center gap-1">
                            <input
                                ref={titleInputRef}
                                value={localTitle}
                                onChange={(e) => setLocalTitle(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') handleCancelTitle(); }}
                                className="flex-1 text-base font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-indigo-400 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button onClick={handleSaveTitle} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"><Check className="w-4 h-4" /></button>
                            <button onClick={handleCancelTitle} className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg transition"><X className="w-4 h-4" /></button>
                        </div>
                    ) : (
                        <div
                            className={`flex items-center gap-1.5 ${canEdit ? 'cursor-pointer group' : ''}`}
                            onClick={() => canEdit && setEditingTitle(true)}
                            title={canEdit ? "Click to edit name" : ""}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{localTitle}</h3>
                            {canEdit && (
                                <Pencil className="w-3.5 h-3.5 text-indigo-500 opacity-70 group-hover:opacity-100 transition shrink-0" />
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {project.sheetOption !== 'NOT_PROVIDED' && (
                        project.sheetOption === 'PROVIDED' && project.sheetUrl ? (
                            <a href={project.sheetUrl} target="_blank" rel="noopener noreferrer"
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition" title="Open Google Sheet">
                                <GoogleSheetIcon className="w-6 h-6" />
                            </a>
                        ) : (
                            <div className="p-1" title="Sheet will be provided later">
                                <GoogleSheetIcon className="w-6 h-6 opacity-30 grayscale" />
                            </div>
                        )
                    )}
                    {(isGlobalOwner || (user?.id === project.createdById)) && (
                        <button onClick={handleDelete}
                            className="p-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition" title="Delete Project">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {project.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{project.description}</p>
            )}

            <div className="mt-4 space-y-4">

                {/* ── Dates row ── */}
                <div className="grid grid-cols-2 gap-4 pb-2">
                    {/* Start date (read-only) */}
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Start Date</span>
                            <span className="text-sm font-semibold">{formatDateTime(project.startDate)}</span>
                        </div>
                    </div>

                    {/* Delivery date — editable */}
                    <div className={`flex items-start gap-2 ${editingDeadline ? 'col-span-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50' : ''}`}>
                        <CalendarX className="w-4 h-4 shrink-0 text-gray-400 mt-1" />
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Delivery Date</span>
                            {editingDeadline ? (
                                <div className="flex flex-col gap-3 mt-2">
                                    <input
                                        type="datetime-local"
                                        value={localDeadline}
                                        onChange={(e) => setLocalDeadline(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveDeadline(); if (e.key === 'Escape') handleCancelDeadline(); }}
                                        className="w-full px-3 py-2 text-sm border-2 border-indigo-400 rounded-xl bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleSaveDeadline}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition text-xs font-bold uppercase tracking-wider shadow-sm"
                                        >
                                            <Check className="w-4 h-4" /> Save Changes
                                        </button>
                                        <button
                                            onClick={handleCancelDeadline}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition text-xs font-bold uppercase tracking-wider"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={`flex items-center gap-1 mt-0.5 ${canEdit ? 'group cursor-pointer' : ''}`}
                                    onClick={() => canEdit && setEditingDeadline(true)}
                                    title={canEdit ? "Click to edit deadline" : ""}
                                >
                                    <span className={`text-sm ${getDeadlineDateColor()}`}>
                                        {formatDateTime(localDeadline || project.deadline || '')}
                                    </span>
                                    {canEdit && (
                                        <Pencil className="w-3 h-3 text-indigo-500 opacity-70 group-hover:opacity-100 transition shrink-0" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100 dark:border-gray-700/50" />

                {/* ── Footer ── */}
                <div className="pt-2 space-y-4">
                    {project.assignedTo && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 px-1">
                            <User className="w-3.5 h-3.5" />
                            <span>Assigned to: <span className="font-semibold text-gray-700 dark:text-gray-300">{project.assignedTo.name}</span></span>
                        </div>
                    )}

                    {/* Coloured status dropdown */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Project Status</label>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadgeColors[localStatus]}`}>
                                {statusLabels[localStatus]}
                            </span>
                        </div>
                        <select
                            value={localStatus}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={!canEdit}
                            className={`w-full px-3 py-2.5 text-sm rounded-xl border-2 focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 focus:outline-none transition-all appearance-none font-medium
                                ${!canEdit ? 'opacity-70 cursor-not-allowed' : ''}
                                bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')]
                                bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat ${statusSelectStyles[localStatus]}`}
                        >
                            {Object.entries(statusLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── Countdown / Done ── */}
                <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-700/50">
                    {showCountdown && (
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-sm ${getTimerStyles()}`}>
                            <Clock className="w-5 h-5 opacity-80 shrink-0" />
                            <span className="text-lg font-bold tracking-tighter tabular-nums">
                                {timeLeft || 'Calculating...'}
                            </span>
                        </div>
                    )}

                    {isTerminal && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/30 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{statusLabels[localStatus]}</span>
                        </div>
                    )}

                    {!hasDeadline && !isTerminal && (
                        <p className="text-xs text-gray-400 text-center py-1 italic">
                            No deadline set {canEdit && (
                                <>— <button onClick={() => setEditingDeadline(true)} className="underline hover:text-gray-600">add one</button></>
                            )}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
