// src/app/dashboard/smtp/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { smtpConfigApi } from '@/services/api';
import { CreateSmtpConfigRequest } from '@/types';

// Form validation schema
const smtpConfigSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    host: z.string().min(2, { message: 'Host must be at least 2 characters' }),
    port: z.coerce.number().int().min(1).max(65535),
    username: z.string().min(1, { message: 'Username is required' }),
    password: z.string().min(1, { message: 'Password is required' }),
    secure: z.boolean().default(true),
    fromEmail: z.string().email({ message: 'Please enter a valid email address' }),
    fromName: z.string().min(2, { message: 'From name must be at least 2 characters' }),
});

export default function NewSMTPConfigPage() {
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    // Initialize form
    const form = useForm<z.infer<typeof smtpConfigSchema>>({
        resolver: zodResolver(smtpConfigSchema),
        defaultValues: {
            name: '',
            host: '',
            port: 587,
            username: '',
            password: '',
            secure: true,
            fromEmail: '',
            fromName: '',
        },
    });

    const onSubmit = async (data: z.infer<typeof smtpConfigSchema>) => {
        setSubmitting(true);
        try {
            await smtpConfigApi.create(data);
            toast.success('SMTP configuration created successfully');
            router.push('/dashboard/smtp');
        } catch (error) {
            console.error('Failed to create SMTP configuration:', error);
            toast.error('Failed to create SMTP configuration');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/dashboard/smtp');
    };

    const handleTestConnection = () => {
        // This would be better implemented in the API
        // For now, just show a toast
        toast.info('Test connection feature coming soon');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Add SMTP Configuration</h1>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>SMTP Server Details</CardTitle>
                            <CardDescription>
                                Configure your SMTP server for sending emails
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Configuration Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Work Email" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            A descriptive name for this SMTP configuration
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="host"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SMTP Host</FormLabel>
                                            <FormControl>
                                                <Input placeholder="smtp.gmail.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="port"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SMTP Port</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="587"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 587)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SMTP Username</FormLabel>
                                            <FormControl>
                                                <Input placeholder="user@gmail.com" {...field} />
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
                                            <FormLabel>SMTP Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="secure"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Use SSL/TLS</FormLabel>
                                            <FormDescription>
                                                Enable secure connection (SSL/TLS)
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="fromEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>From Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="noreply@example.com" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Default sender email address
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="fromName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>From Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Company Name" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Default sender name
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between border-t p-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleTestConnection}
                                disabled={submitting}
                            >
                                Test Connection
                            </Button>
                            <div className="flex space-x-2">
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Configuration
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
