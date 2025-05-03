// src/app/auth/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    // Redirect to dashboard if already authenticated
    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            {children}
            <Toaster position="top-right" />
        </>
    );
}
