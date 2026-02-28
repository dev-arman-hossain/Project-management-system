'use client';

import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Settings,
    BarChart3,
    FolderKanban,
    ChevronRight,
} from 'lucide-react';
import { User } from '@/types';

interface SidebarProps {
    user: User | null;
    isOpen: boolean;
    onClose?: () => void;
}

interface NavItem {
    label: string;
    icon: React.ReactNode;
    href: string;
    adminOnly?: boolean;
    leaderOnly?: boolean;
}

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
    const router = useRouter();

    const navItems: NavItem[] = [
        {
            label: 'Dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
            href: '/dashboard',
        },
        {
            label: 'Projects',
            icon: <FolderKanban className="w-5 h-5" />,
            href: '/projects',
        },
        {
            label: 'Analytics',
            icon: <BarChart3 className="w-5 h-5" />,
            href: '/analytics',
            leaderOnly: true,
        },
        {
            label: 'Users',
            icon: <Users className="w-5 h-5" />,
            href: '/users',
            adminOnly: true,
        },
        {
            label: 'Settings',
            icon: <Settings className="w-5 h-5" />,
            href: '/settings',
            adminOnly: true,
        },
    ];

    const filteredNavItems = navItems.filter((item) => {
        if (item.adminOnly && user?.role !== 'ADMIN') return false;
        if (item.leaderOnly && !['ADMIN', 'LEADER'].includes(user?.role || ''))
            return false;
        return true;
    });

    const handleNavClick = (href: string) => {
        router.push(href);
        onClose?.();
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:relative left-0 top-0 h-screen w-64 bg-gray-900 dark:bg-gray-950 text-gray-100 transform transition-transform duration-300 ease-in-out z-40 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="px-6 py-6 border-b border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <FolderKanban className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-lg text-white">Projects</p>
                                <p className="text-xs text-gray-400">Management</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {filteredNavItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => handleNavClick(item.href)}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition group"
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <span className="font-medium">{item.label}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                            </button>
                        ))}
                    </nav>

                    {/* User Profile Section */}
                    {user && (
                        <div className="px-6 py-4 border-t border-gray-800">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-gray-800 rounded-full text-center">
                                <p className="text-xs font-medium text-indigo-400 uppercase">
                                    {user.role}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
