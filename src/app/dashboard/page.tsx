// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Users, Send, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { templatesApi, contactsApi, mailApi } from '@/services/api';
import { MailTemplate, Contact, MailLog } from '@/types';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        templates: 0,
        contacts: 0,
        sentEmails: 0,
        failedEmails: 0,
    });
    const [recentLogs, setRecentLogs] = useState<MailLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [templates, contacts, logs] = await Promise.all([
                    templatesApi.getAll(),
                    contactsApi.getAll(),
                    mailApi.getLogs(),
                ]);

                // Calculate stats
                const sentCount = logs.filter(log => log.status === 'sent').length;
                const failedCount = logs.filter(log => log.status === 'failed').length;

                setStats({
                    templates: templates.length,
                    contacts: contacts.length,
                    sentEmails: sentCount,
                    failedEmails: failedCount,
                });

                // Get recent logs (last 5)
                setRecentLogs(logs.slice(0, 5));
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Email Templates</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.templates}</div>
                        <p className="text-xs text-muted-foreground">
                            Total templates created
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contacts</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.contacts}</div>
                        <p className="text-xs text-muted-foreground">
                            Total contacts in database
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sent Emails</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.sentEmails}</div>
                        <p className="text-xs text-muted-foreground">
                            Successfully delivered emails
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed Emails</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.failedEmails}</div>
                        <p className="text-xs text-muted-foreground">
                            Emails that failed to deliver
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Email Activity</CardTitle>
                        <CardDescription>
                            Latest email sending activity and status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentLogs.length > 0 ? (
                            <div className="space-y-4">
                                {recentLogs.map((log) => (
                                    <div key={log.id} className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            {log.status === 'sent' ? (
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                </div>
                                            ) : (
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium">{log.subject}</p>
                                            <p className="text-xs text-muted-foreground">
                                                To: {log.recipient}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(log.sentAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex h-40 items-center justify-center">
                                <p className="text-sm text-muted-foreground">No recent email activity</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Template</CardTitle>
                        <CardDescription>
                            Design a new email template
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <a
                            href="/dashboard/templates/new"
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary hover:bg-muted rounded-md border border-input"
                        >
                            <Mail className="mr-2 h-4 w-4" />
                            New Template
                        </a>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Add Contacts</CardTitle>
                        <CardDescription>
                            Import or create new contacts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <a
                            href="/dashboard/contacts/new"
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary hover:bg-muted rounded-md border border-input"
                        >
                            <Users className="mr-2 h-4 w-4" />
                            Add Contact
                        </a>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Send Email</CardTitle>
                        <CardDescription>
                            Send emails to your contacts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <a
                            href="/dashboard/send"
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary hover:bg-muted rounded-md border border-input"
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Send Email
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
