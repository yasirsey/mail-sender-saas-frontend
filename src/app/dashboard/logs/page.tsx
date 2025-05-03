// src/app/dashboard/logs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    CheckCircle,
    AlertTriangle,
    Clock,
    Search,
    Info,
    Filter
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

import { mailApi } from '@/services/api';
import { MailLog } from '@/types';

export default function LogsPage() {
    const [logs, setLogs] = useState<MailLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<MailLog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedLog, setSelectedLog] = useState<MailLog | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailsOpen, setDetailsOpen] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await mailApi.getLogs();
                setLogs(data);
                setFilteredLogs(data);
            } catch (error) {
                console.error('Failed to fetch email logs:', error);
                toast.error('Failed to load email logs');
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    // Filter logs based on search term and status filter
    useEffect(() => {
        let filtered = logs;

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(log => log.status === statusFilter);
        }

        // Apply search filter
        if (searchTerm.trim() !== '') {
            const lowercaseSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(
                log =>
                    log.recipient.toLowerCase().includes(lowercaseSearch) ||
                    log.subject.toLowerCase().includes(lowercaseSearch) ||
                    (log.template?.name?.toLowerCase().includes(lowercaseSearch))
            );
        }

        setFilteredLogs(filtered);
    }, [searchTerm, statusFilter, logs]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
    };

    const handleViewDetails = (log: MailLog) => {
        setSelectedLog(log);
        setDetailsOpen(true);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        });
    };

    const getStatusBadge = (status: 'pending' | 'sent' | 'failed') => {
        switch (status) {
            case 'sent':
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Sent
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Failed
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            default:
                return null;
        }
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
                <h1 className="text-2xl font-bold">Email Logs</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Email Activity</CardTitle>
                    <CardDescription>
                        Track the status of your sent emails
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by recipient or subject..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        <div className="flex w-full sm:w-auto">
                            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {filteredLogs.length === 0 ? (
                        <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">No email logs found</p>
                                {(searchTerm || statusFilter !== 'all') ? (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Try adjusting your search or filter
                                    </p>
                                ) : (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Start sending emails to see activity here
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Recipient</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Template</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{getStatusBadge(log.status)}</TableCell>
                                            <TableCell className="font-medium">{log.recipient}</TableCell>
                                            <TableCell>{log.subject}</TableCell>
                                            <TableCell>{log.template?.name || '-'}</TableCell>
                                            <TableCell>{formatDate(log.sentAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleViewDetails(log)}
                                                >
                                                    <Info className="h-4 w-4" />
                                                    <span className="sr-only">View Details</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Email Details</DialogTitle>
                                <DialogDescription>
                                    Detailed information about this email
                                </DialogDescription>
                            </DialogHeader>
                            {selectedLog && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-[100px_1fr] gap-1">
                                        <div className="text-sm font-medium text-muted-foreground">Status:</div>
                                        <div>{getStatusBadge(selectedLog.status)}</div>

                                        <div className="text-sm font-medium text-muted-foreground">Recipient:</div>
                                        <div className="break-all">{selectedLog.recipient}</div>

                                        <div className="text-sm font-medium text-muted-foreground">Subject:</div>
                                        <div>{selectedLog.subject}</div>

                                        <div className="text-sm font-medium text-muted-foreground">Template:</div>
                                        <div>{selectedLog.template?.name || '-'}</div>

                                        <div className="text-sm font-medium text-muted-foreground">Sent At:</div>
                                        <div>{formatDate(selectedLog.sentAt)}</div>
                                    </div>

                                    {selectedLog.status === 'failed' && selectedLog.errorMessage && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-1">Error Message:</div>
                                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                                                {selectedLog.errorMessage}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    );
}
