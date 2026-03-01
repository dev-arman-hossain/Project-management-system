'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI, usersAPI } from '@/lib/api';
import { User } from '@/types';
import { X, Plus, Trash2, Shield, User as UserIcon } from 'lucide-react';

const userSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['ADMIN', 'MEMBER']),
    profilePhoto: z.string().optional(),
});

type UserForm = z.infer<typeof userSchema>;

interface UserManagementProps {
    users: User[];
    onClose: () => void;
    onUpdate: () => void;
}

export default function UserManagement({ users, onClose, onUpdate }: UserManagementProps) {
    const [showAddUser, setShowAddUser] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UserForm>({
        resolver: zodResolver(userSchema),
        defaultValues: { role: 'MEMBER' },
    });

    const onSubmit = async (data: UserForm) => {
        try {
            setLoading(true);
            setError('');
            await authAPI.register(data);
            reset();
            setShowAddUser(false);
            onUpdate();
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await usersAPI.delete(userId);
            onUpdate();
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {!showAddUser ? (
                    <>
                        <button
                            onClick={() => setShowAddUser(true)}
                            className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                        >
                            <Plus className="w-5 h-5" />
                            Add New User
                        </button>

                        <div className="space-y-3">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center overflow-hidden">
                                            {user.profilePhoto ? (
                                                <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                                            ) : user.role === 'ADMIN' ? (
                                                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            ) : (
                                                <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Name *
                            </label>
                            <input
                                {...register('name')}
                                type="text"
                                id="name"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                                placeholder="Enter name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email *
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                id="email"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                                placeholder="Enter email"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password *
                            </label>
                            <input
                                {...register('password')}
                                type="password"
                                id="password"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                                placeholder="Enter password"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Role *
                            </label>
                            <select
                                {...register('role')}
                                id="role"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                            >
                                <option value="MEMBER">Member</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Profile Photo (Google Drive Link)
                            </label>
                            <input
                                {...register('profilePhoto')}
                                type="text"
                                id="profilePhoto"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                                placeholder="Paste Google Drive link"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Supporting: drive.google.com/file/d/ID/view
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddUser(false);
                                    reset();
                                    setError('');
                                }}
                                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
