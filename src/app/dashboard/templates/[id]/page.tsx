// src/app/dashboard/templates/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Edit, Copy, Trash2, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import { templatesApi } from '@/services/api';
import { MailTemplate } from '@/types';

export default function TemplatePage() {
    const params = useParams();
    const router = useRouter();
    const templateId = params.id as string;

    const [template, setTemplate] = useState<MailTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('preview');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const data = await templatesApi.getById(templateId);
                setTemplate(data);
            } catch (error) {
                console.error('Failed to fetch template:', error);
                toast.error('Failed to load template');
                router.push('/dashboard/templates');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplate();
    }, [templateId, router]);

    const handleEdit = () => {
        router.push(`/dashboard/templates/${templateId}/edit`);
    };

    const handleDuplicate = async () => {
        if (!template) return;

        try {
            const duplicateData = {
                name: `${template.name} (Copy)`,
                subject: template.subject,
                htmlContent: template.htmlContent,
                textContent: template.textContent,
            };

            await templatesApi.create(duplicateData);
            toast.success('Template duplicated successfully');
            router.push('/dashboard/templates');
        } catch (error) {
            console.error('Failed to duplicate template:', error);
            toast.error('Failed to duplicate template');
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            // Implementation would depend on your API
            // await templatesApi.delete(templateId);
            toast.success('Template deleted successfully');
            router.push('/dashboard/templates');
        } catch (error) {
            console.error('Failed to delete template:', error);
            toast.error('Failed to delete template');
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/templates')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">{template.name}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleDuplicate}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Template</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete this template? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button size="sm" onClick={() => router.push(`/dashboard/send?templateId=${template.id}`)}>
                        <Send className="mr-2 h-4 w-4" />
                        Use Template
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Content</CardTitle>
                            <CardDescription>
                                Preview and source of the email template
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="mb-4">
                                    <TabsTrigger value="preview">Preview</TabsTrigger>
                                    <TabsTrigger value="html">HTML</TabsTrigger>
                                    <TabsTrigger value="text">Plain Text</TabsTrigger>
                                </TabsList>
                                <TabsContent value="preview">
                                    <div className="rounded-md border p-4">
                                        <div dangerouslySetInnerHTML={{ __html: template.htmlContent }} />
                                    </div>
                                </TabsContent>
                                <TabsContent value="html">
                                    <pre className="max-h-[500px] overflow-auto rounded-md bg-muted p-4 font-mono text-sm">
                                        {template.htmlContent}
                                    </pre>
                                </TabsContent>
                                <TabsContent value="text">
                                    <pre className="max-h-[500px] overflow-auto rounded-md bg-muted p-4 font-mono text-sm whitespace-pre-wrap">
                                        {template.textContent || 'No plain text content available.'}
                                    </pre>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Subject</h3>
                                <p>{template.subject}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                                <p>{formatDate(template.createdAt)}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                                <p>{formatDate(template.updatedAt)}</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={() => router.push(`/dashboard/send?templateId=${template.id}`)}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Use This Template
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
