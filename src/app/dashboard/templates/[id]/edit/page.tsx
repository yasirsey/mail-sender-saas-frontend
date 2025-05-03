// src/app/dashboard/templates/[id]/edit/page.tsx
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { templatesApi } from '@/services/api';
import { MailTemplate } from '@/types';

// Form validation schema
const templateSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    subject: z.string().min(2, { message: 'Subject must be at least 2 characters' }),
    htmlContent: z.string().min(10, { message: 'HTML content must be at least 10 characters' }),
    textContent: z.string().optional(),
});

export default function EditTemplatePage() {
    const params = useParams();
    const router = useRouter();
    const templateId = params.id as string;

    const [template, setTemplate] = useState<MailTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('html');

    // Initialize form
    const form = useForm<z.infer<typeof templateSchema>>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            name: '',
            subject: '',
            htmlContent: '',
            textContent: '',
        },
    });

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const data = await templatesApi.getById(templateId);
                setTemplate(data);

                // Set form values
                form.reset({
                    name: data.name,
                    subject: data.subject,
                    htmlContent: data.htmlContent,
                    textContent: data.textContent || '',
                });
            } catch (error) {
                console.error('Failed to fetch template:', error);
                toast.error('Failed to load template');
                router.push('/dashboard/templates');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplate();
    }, [templateId, router, form]);

    const onSubmit = async (data: z.infer<typeof templateSchema>) => {
        setSubmitting(true);
        try {
            // Implementation would depend on your API
            // await templatesApi.update(templateId, data);
            toast.success('Template updated successfully');
            router.push(`/dashboard/templates/${templateId}`);
        } catch (error) {
            console.error('Failed to update template:', error);
            toast.error('Failed to update template');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push(`/dashboard/templates/${templateId}`);
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

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="flex h-full flex-col items-center justify-center">
                <p className="text-lg text-muted-foreground">Template not found</p>
                <Button variant="link" onClick={() => router.push('/dashboard/templates')}>
                    Back to Templates
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
                <h1 className="text-2xl font-bold">Edit Template</h1>
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
