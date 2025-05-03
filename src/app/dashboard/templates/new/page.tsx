// src/app/dashboard/templates/new/page.tsx
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { templatesApi } from '@/services/api';
import { CreateTemplateRequest } from '@/types';

// Form validation schema
const templateSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    subject: z.string().min(2, { message: 'Subject must be at least 2 characters' }),
    htmlContent: z.string().min(10, { message: 'HTML content must be at least 10 characters' }),
    textContent: z.string().optional(),
});

export default function NewTemplatePage() {
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('html');
    const router = useRouter();

    // Initialize form
    const form = useForm<z.infer<typeof templateSchema>>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            name: '',
            subject: '',
            htmlContent: '<div style="font-family: Arial, sans-serif;">\n  <h1>Hello, {{firstName}}!</h1>\n  <p>Welcome to our service.</p>\n</div>',
            textContent: 'Hello, {{firstName}}!\n\nWelcome to our service.',
        },
    });

    const onSubmit = async (data: z.infer<typeof templateSchema>) => {
        setSubmitting(true);
        try {
            await templatesApi.create(data);
            toast.success('Template created successfully');
            router.push('/dashboard/templates');
        } catch (error) {
            console.error('Failed to create template:', error);
            toast.error('Failed to create template');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/dashboard/templates');
    };

    const handlePreview = () => {
        // Open preview in new tab
        const htmlContent = form.getValues('htmlContent');
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
            previewWindow.document.write(htmlContent);
            previewWindow.document.close();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Create Email Template</h1>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Details</CardTitle>
                            <CardDescription>
                                Basic information about your email template
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Template Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Welcome Email" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            A descriptive name for your template
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Subject</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Welcome to our platform" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Subject line that recipients will see
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Template Content</CardTitle>
                            <CardDescription>
                                The content of your email in HTML and plain text formats
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="mb-4">
                                    <TabsTrigger value="html">HTML Content</TabsTrigger>
                                    <TabsTrigger value="text">Plain Text</TabsTrigger>
                                </TabsList>
                                <TabsContent value="html">
                                    <FormField
                                        control={form.control}
                                        name="htmlContent"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="<div>Hello, {{firstName}}!</div>"
                                                        className="font-mono h-80 resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Use {"{{variableName}}"} for dynamic content
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>
                                <TabsContent value="text">
                                    <FormField
                                        control={form.control}
                                        name="textContent"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Hello, {{firstName}}!"
                                                        className="font-mono h-80 resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Plain text version for email clients that don't support HTML
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                        <CardFooter className="justify-between border-t p-4">
                            <Button type="button" variant="outline" onClick={handlePreview}>
                                Preview
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
                                            Save Template
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
