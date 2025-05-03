// src/app/dashboard/smtp/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, MoreHorizontal, Check, Edit, Trash2, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

import { smtpConfigApi } from '@/services/api';
import { SmtpConfig } from '@/types';

export default function SMTPConfigPage() {
    const [configs, setConfigs] = useState<SmtpConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<SmtpConfig | null>(null);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const data = await smtpConfigApi.getAll();
                setConfigs(data);
            } catch (error) {
                console.error('Failed to fetch SMTP configurations:', error);
                toast.error('Failed to load SMTP configurations');
            } finally {
                setLoading(false);
            }
        };

        fetchConfigs();
    }, []);

    const handleEditConfig = (id: string) => {
        router.push(`/dashboard/smtp/${id}/edit`);
    };

    const handleSetDefault = async (config: SmtpConfig) => {
        // This would need to be implemented in the API
        // For now, just simulate the behavior by updating the UI
        toast.success(`${config.name} set as default SMTP configuration`);
    };

    const handleDeleteClick = (config: SmtpConfig) => {
        setSelectedConfig(config);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfig = async () => {
        if (!selectedConfig) return;

        setDeleting(true);
        try {
            // Implementation would depend on your API
            // await smtpConfigApi.delete(selectedConfig.id);

            // Update local state
            setConfigs(configs.filter(config => config.id !== selectedConfig.id));
            toast.success('SMTP configuration deleted successfully');
        } catch (error) {
            console.error('Failed to delete SMTP configuration:', error);
            toast.error('Failed to delete SMTP configuration');
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
            setSelectedConfig(null);
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
                <h1 className="text-2xl font-bold">SMTP Configurations</h1>
                <Link href="/dashboard/smtp/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add SMTP Config
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Configurations</CardTitle>
                    <CardDescription>
                        Manage your SMTP server configurations for sending emails
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {configs.length === 0 ? (
                        <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">No SMTP configurations found</p>
                                <Link href="/dashboard/smtp/new">
                                    <Button variant="link" className="mt-2">
                                        Add your first SMTP configuration
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Host</TableHead>
                                        <TableHead>From Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {configs.map((config) => (
                                        <TableRow key={config.id}>
                                            <TableCell className="font-medium">{config.name}</TableCell>
                                            <TableCell>{config.host}:{config.port}</TableCell>
                                            <TableCell>{config.fromEmail}</TableCell>
                                            <TableCell>
                                                {config.isActive ? (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleSetDefault(config)}>
                                                            <Check className="mr-2 h-4 w-4" />
                                                            Set as Default
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditConfig(config.id)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteClick(config)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
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

                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete SMTP Configuration</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete "{selectedConfig?.name}"? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleDeleteConfig} disabled={deleting}>
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    );
}
