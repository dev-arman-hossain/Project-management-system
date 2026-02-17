'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { projectsAPI } from '@/lib/api';
import { User } from '@/types';
import { X } from 'lucide-react';

const projectSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    assignedToId: z.string().optional(),
});

type ProjectForm = z.infer<typeof projectSchema>;

interface CreateProjectDialogProps {
    users: User[];
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateProjectDialog({ users, onClose, onSuccess }: CreateProjectDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProjectForm>({
        resolver: zodResolver(projectSchema),
    });

    const onSubmit = async (data: ProjectForm) => {
        try {
            setLoading(true);
            setError('');
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
                            {users.filter(u => u.role === 'MEMBER').map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
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
