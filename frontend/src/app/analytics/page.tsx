'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataCache } from '@/lib/store';
import { projectsAPI } from '@/lib/api';
import { Project, ProjectStats } from '@/types';
import { BarChart3, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import MonthlyProgress from '@/components/MonthlyProgress';

export default function AnalyticsPage() {
    const router = useRouter();
    const { user, clearAuth, isAdmin, isLeader } = useAuthStore();
    const { cache, setCacheData, isCacheValid } = useDataCache();
    
    const [projects, setProjects] = useState<Project[]>([]);
    const [stats, setStats] = useState<ProjectStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!user || (!isAdmin() && !isLeader())) {
            router.push('/dashboard');
            return;
        }

        // Check if we have valid cached data
        if (isCacheValid()) {
            // Use cached data immediately
            const cachedData = cache;
            if (cachedData) {
                setProjects(cachedData.projects);
                setStats(cachedData.stats);
                setLoading(false);
                // Silently refresh in background
                silentRefresh();
            }
        } else {
            // No valid cache, fetch fresh data with loading
            fetchData();
        }
    }, [user, mounted]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projectsRes, statsRes] = await Promise.all([
                projectsAPI.getAll(),
                projectsAPI.getStats(),
            ]);
            const projectsData = projectsRes.data.data.projects;
            const statsData = statsRes.data.data;
            setProjects(projectsData);
            setStats(statsData);
            // Update cache
            if (cache) {
                setCacheData(projectsData, cache.users, statsData);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const silentRefresh = async () => {
        try {
            const [projectsRes, statsRes] = await Promise.all([
                projectsAPI.getAll(),
                projectsAPI.getStats(),
            ]);
            const projectsData = projectsRes.data.data.projects;
            const statsData = statsRes.data.data;
            setProjects(projectsData);
            setStats(statsData);
            // Update cache
            if (cache) {
                setCacheData(projectsData, cache.users, statsData);
            }
        } catch (error) {
            console.error('Failed to refresh analytics:', error);
        }
    };

    const handleLogout = () => {
        clearAuth();
        router.push('/login');
    };

    if (!mounted || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const completionRate = stats?.total
        ? Math.round(((stats?.byStatus?.COMPLETED || 0) / stats.total) * 100)
        : 0;

    return (
        <DashboardLayout
            user={user}
            title="Analytics"
            onLogout={handleLogout}
        >
            <div className="space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats?.total || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats?.byStatus?.WIP || 0}</p>
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
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats?.byStatus?.COMPLETED || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{completionRate}%</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Progress */}
                <MonthlyProgress projects={projects} />
            </div>
        </DashboardLayout>
    );
}
