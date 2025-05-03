// src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    Mail,
    ClipboardList,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/templates', label: 'Templates', icon: FileText },
    { href: '/dashboard/contacts', label: 'Contacts', icon: Users },
    { href: '/dashboard/smtp', label: 'SMTP Config', icon: Settings },
    { href: '/dashboard/send', label: 'Send Emails', icon: Mail },
    { href: '/dashboard/logs', label: 'Logs', icon: ClipboardList },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className="hidden md:flex md:w-60 flex-col bg-card border-r shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 border-b">
                <Link href="/dashboard" className="flex items-center">
                    <Mail className="h-6 w-6 text-primary mr-2" />
                    <span className="font-bold text-lg">Mail SaaS</span>
                </Link>
            </div>

            <div className="flex flex-col flex-1 py-4">
                <nav className="space-y-1 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                            >
                                <item.icon className="h-5 w-5 mr-2" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="flex-shrink-0 h-9 w-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={logout}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}
