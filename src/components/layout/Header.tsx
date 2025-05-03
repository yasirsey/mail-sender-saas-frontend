// src/components/layout/Header.tsx
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import Sidebar from './Sidebar';

export default function Header() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    // Generate title based on current path
    const getTitle = () => {
        if (pathname === '/dashboard') return 'Dashboard';
        if (pathname === '/dashboard/templates') return 'Email Templates';
        if (pathname.startsWith('/dashboard/templates/')) return 'Template Details';
        if (pathname === '/dashboard/contacts') return 'Contacts';
        if (pathname.startsWith('/dashboard/contacts/')) return 'Contact Details';
        if (pathname === '/dashboard/smtp') return 'SMTP Configurations';
        if (pathname.startsWith('/dashboard/smtp/')) return 'SMTP Details';
        if (pathname === '/dashboard/send') return 'Send Emails';
        if (pathname === '/dashboard/logs') return 'Email Logs';
        return 'Dashboard';
    };

    return (
        <header className="h-16 bg-card z-10 border-b flex items-center justify-between px-4">
            <div className="flex items-center">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0">
                        <Sidebar />
                    </SheetContent>
                </Sheet>
                <h1 className="text-xl font-semibold ml-2">{getTitle()}</h1>
            </div>

            <div className="flex items-center space-x-3">
                <div className="relative max-w-xs hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full bg-background pl-8 py-2 text-sm"
                    />
                </div>
                <ThemeToggle />
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
