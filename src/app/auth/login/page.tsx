// src/app/auth/login/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Toaster } from 'sonner';
import { Mail, Lock } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Form validation schema
const loginSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

export default function LoginPage() {
    const { login, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    // Initialize form
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: z.infer<typeof loginSchema>) => {
        setIsSubmitting(true);
        try {
            await login(data);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
            <div className="mb-8 flex items-center space-x-2">
                <Mail className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Mail SaaS</h1>
            </div>

            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Sign In</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="name@example.com"
                                                type="email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your password"
                                                type="password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex-col space-y-4">
                    <div className="text-sm text-center">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/register" className="text-primary hover:underline">
                            Create one
                        </Link>
                    </div>
                </CardFooter>
            </Card>
            <Toaster position="top-right" />
        </div>
    );
}
