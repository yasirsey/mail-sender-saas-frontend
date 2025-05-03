// src/components/layout/DashboardLayout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, loading, router]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will be redirected by the useEffect
    }

    return (
        <div className="flex h-screen bg-muted/30">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4">
                    {children}
                </main>
            </div>
            <Toaster position="top-right" />
        </div>
    );
}
