'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { projectsAPI } from '@/lib/api';
import { User } from '@/types';
import { X } from 'lucide-react';

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

const projectSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    assignedToId: z.string().optional(),
    sheetOption: z.enum(['PROVIDED', 'NOT_PROVIDED', 'WILL_PROVIDE_LATER']),
    sheetUrl: z.string().optional().or(z.literal('')),
    startDate: z.string().min(1, 'Start date is required'),
    deadline: z.string().optional(),
});

type ProjectForm = z.infer<typeof projectSchema>;

interface CreateProjectDialogProps {
    user: User;
    users: User[];
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateProjectDialog({ user: currentUser, users, onClose, onSuccess }: CreateProjectDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ProjectForm>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            sheetOption: 'NOT_PROVIDED',
            startDate: new Date().toISOString().split('T')[0],
        }
    });

    const sheetOption = watch('sheetOption');

    const onSubmit = async (data: ProjectForm) => {
        try {
            setLoading(true);
            setError('');

            // If user is a member, auto-assign to themselves
            if (currentUser.role === 'MEMBER') {
                data.assignedToId = currentUser.id;
            }

            await projectsAPI.create(data);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Project</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Project Title *
                        </label>
                        <input
                            {...register('title')}
                            type="text"
                            id="title"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                            placeholder="Enter project title"
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            {...register('description')}
                            id="description"
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                            placeholder="Enter project description"
                        />
                    </div>

                    {currentUser.role !== 'MEMBER' && (
                        <div>
                            <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Assign To
                            </label>
                            <select
                                {...register('assignedToId')}
                                id="assignedToId"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                            >
                                <option value="">Unassigned</option>
                                {users.filter(u => u.role === 'MEMBER' || u.role === 'LEADER').map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label htmlFor="sheetOption" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <GoogleSheetIcon className="w-5 h-5" />
                            Google Sheet Option
                        </label>
                        <select
                            {...register('sheetOption')}
                            id="sheetOption"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                        >
                            <option value="NOT_PROVIDED">No Sheet</option>
                            <option value="PROVIDED">Provide Google Sheet</option>
                            <option value="WILL_PROVIDE_LATER">Will Provide Sheet Later</option>
                        </select>
                    </div>

                    {sheetOption === 'PROVIDED' && (
                        <div>
                            <label htmlFor="sheetUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Google Sheet URL *
                            </label>
                            <input
                                {...register('sheetUrl')}
                                type="url"
                                id="sheetUrl"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                                placeholder="https://docs.google.com/spreadsheets/d/..."
                            />
                            {errors.sheetUrl && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.sheetUrl.message}</p>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Start Date *
                            </label>
                            <input
                                {...register('startDate')}
                                type="date"
                                id="startDate"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                            />
                            {errors.startDate && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate.message}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Deadline
                            </label>
                            <input
                                {...register('deadline')}
                                type="date"
                                id="deadline"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                            />
                            {errors.deadline && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.deadline.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
