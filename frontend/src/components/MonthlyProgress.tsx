'use client';

import { useMemo } from 'react';
import { Project } from '@/types';
import { BarChart3 } from 'lucide-react';

interface MonthlyProgressProps {
    projects: Project[];
}

export default function MonthlyProgress({ projects }: MonthlyProgressProps) {
    const monthlyData = useMemo(() => {
        const currentDate = new Date();
        const months: {
            month: string;
            completed: number;
            inProgress: number;
            totalValue: number;
        }[] = [];

        // Get last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthStr = date.toLocaleString('default', { month: 'short', year: '2-digit' });

            const monthProjects = projects.filter((p) => {
                const createdDate = new Date(p.createdAt);
                return (
                    createdDate.getFullYear() === date.getFullYear() &&
                    createdDate.getMonth() === date.getMonth()
                );
            });

            const completed = monthProjects.filter((p) => p.status === 'COMPLETED').length;
            const inProgress = monthProjects.filter((p) => p.status === 'WIP').length;
            const totalValue = monthProjects.reduce((sum, p) => sum + (p.value || 0), 0);

            months.push({
                month: monthStr,
                completed,
                inProgress,
                totalValue,
            });
        }

        return months;
    }, [projects]);

    const maxCount = Math.max(
        ...monthlyData.map((m) => m.completed + m.inProgress),
        1
    );

    const totalCompletedValue = monthlyData.reduce((sum, m) => sum + m.totalValue, 0);
    const totalProjects = monthlyData.reduce((sum, m) => sum + m.completed + m.inProgress, 0);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Progress</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            ₹{totalCompletedValue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Value</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Chart */}
                <div className="space-y-6">
                    {monthlyData.map((data) => {
                        const total = data.completed + data.inProgress;
                        const completedPercentage = total > 0 ? (data.completed / total) * 100 : 0;

                        return (
                            <div key={data.month} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {data.month}
                                    </span>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {data.completed}/{total}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            ₹{data.totalValue.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                    {total > 0 && (
                                        <>
                                            <div
                                                className="h-full bg-linear-to-r from-green-500 to-emerald-600 rounded-full"
                                                style={{
                                                    width: `${completedPercentage}%`,
                                                }}
                                            />
                                            <div
                                                className="h-full bg-linear-to-r from-blue-400 to-blue-600"
                                                style={{
                                                    width: `${100 - completedPercentage}%`,
                                                }}
                                            />
                                        </>
                                    )}
                                </div>

                                {/* Legend */}
                                <div className="flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        <span className="text-gray-600 dark:text-gray-400">Completed</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                        <span className="text-gray-600 dark:text-gray-400">In Progress</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {monthlyData.reduce((sum, m) => sum + m.completed, 0)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Completed</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {totalProjects}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Projects</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {totalProjects > 0
                                ? Math.round((monthlyData.reduce((sum, m) => sum + m.completed, 0) / totalProjects) * 100)
                                : 0}
                            %
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Success Rate</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
