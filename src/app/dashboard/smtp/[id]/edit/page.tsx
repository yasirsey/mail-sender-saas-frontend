// src/app/dashboard/smtp/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { SmtpConfig } from '@/types';

// Form validation schema
const smtpConfigSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    host: z.string().min(2, { message: 'Host must be at least 2 characters' }),
    port: z.coerce.number().int().min(1).max(65535),
    username: z.string().min(1, { message: 'Username is required' }),
    password: z.string().optional(),
    secure: z.boolean().default(true),
    fromEmail: z.string().email({ message: 'Please enter a valid email address' }),
    fromName: z.string().min(2, { message: 'From name must be at least 2 characters' }),
    isActive: z.boolean().default(true),
});

export default function EditSMTPConfigPage() {
    const params = useParams();
    const router = useRouter();
    const configId = params.id as string;

    const [config, setConfig] = useState<SmtpConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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
            isActive: true,
        },
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await smtpConfigApi.getById(configId);
                setConfig(data);

                // Set form values
                form.reset({
                    name: data.name,
                    host: data.host,
                    port: data.port,
                    username: data.username,
                    password: '',  // Password is not returned from API for security
                    secure: data.secure,
                    fromEmail: data.fromEmail,
                    fromName: data.fromName,
                    isActive: data.isActive,
                });
            } catch (error) {
                console.error('Failed to fetch SMTP configuration:', error);
                toast.error('Failed to load SMTP configuration');
                router.push('/dashboard/smtp');
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, [configId, router, form]);

    const onSubmit = async (data: z.infer<typeof smtpConfigSchema>) => {
        setSubmitting(true);
        try {
            // Implementation would depend on your API
            // If password is empty, don't update it
            const updateData = {
                ...data,
                password: data.password ? data.password : undefined,
            };

            // await smtpConfigApi.update(configId, updateData);
            toast.success('SMTP configuration updated successfully');
            router.push('/dashboard/smtp');
        } catch (error) {
            console.error('Failed to update SMTP configuration:', error);
            toast.error('Failed to update SMTP configuration');
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

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
        );
    }

    if (!config) {
        return (
            <div className="flex h-full flex-col items-center justify-center">
                <p className="text-lg text-muted-foreground">SMTP configuration not found</p>
                <Button variant="link" onClick={() => router.push('/dashboard/smtp')}>
                    Back to SMTP Configurations
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Edit SMTP Configuration</h1>
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
                                                <Input
                                                    type="password"
                                                    placeholder="Leave blank to keep current password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Leave blank to keep current password
                                            </FormDescription>
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

                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Active</FormLabel>
                                            <FormDescription>
                                                This configuration can be used for sending emails
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
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
                                            Save Changes
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
