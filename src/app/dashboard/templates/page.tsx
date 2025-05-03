// src/app/dashboard/templates/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Edit,
    Copy,
    Trash2,
    Plus,
    Search,
    Eye,
    MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { templatesApi } from '@/services/api';
import { MailTemplate } from '@/types';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<MailTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<MailTemplate[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const data = await templatesApi.getAll();
                setTemplates(data);
                setFilteredTemplates(data);
            } catch (error) {
                console.error('Failed to fetch templates:', error);
                toast.error('Failed to load templates');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    // Filter templates based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredTemplates(templates);
        } else {
            const filtered = templates.filter(
                (template) =>
                    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    template.subject.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredTemplates(filtered);
        }
    }, [searchTerm, templates]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleViewTemplate = (id: string) => {
        router.push(`/dashboard/templates/${id}`);
    };

    const handleEditTemplate = (id: string) => {
        router.push(`/dashboard/templates/${id}/edit`);
    };

    const handleDuplicateTemplate = async (template: MailTemplate) => {
        try {
            const duplicateData = {
                name: `${template.name} (Copy)`,
                subject: template.subject,
                htmlContent: template.htmlContent,
                textContent: template.textContent,
            };

            await templatesApi.create(duplicateData);
            toast.success('Template duplicated successfully');

            // Refresh templates
            const updatedTemplates = await templatesApi.getAll();
            setTemplates(updatedTemplates);
            setFilteredTemplates(updatedTemplates);
        } catch (error) {
            console.error('Failed to duplicate template:', error);
            toast.error('Failed to duplicate template');
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Email Templates</h1>
                <Link href="/dashboard/templates/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Template
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Templates</CardTitle>
                    <CardDescription>
                        Manage your email templates for campaigns and notifications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search templates..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    {filteredTemplates.length === 0 ? (
                        <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">No templates found</p>
                                {searchTerm ? (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Try adjusting your search term
                                    </p>
                                ) : (
                                    <Link href="/dashboard/templates/new">
                                        <Button variant="link" className="mt-2">
                                            Create your first template
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTemplates.map((template) => (
                                        <TableRow key={template.id}>
                                            <TableCell className="font-medium">{template.name}</TableCell>
                                            <TableCell>{template.subject}</TableCell>
                                            <TableCell>{formatDate(template.createdAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleViewTemplate(template.id)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditTemplate(template.id)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Duplicate
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
