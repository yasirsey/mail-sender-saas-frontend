// src/app/dashboard/contacts/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Edit, Trash2, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

import { contactsApi } from '@/services/api';
import { Contact } from '@/types';

export default function ContactPage() {
    const params = useParams();
    const router = useRouter();
    const contactId = params.id as string;

    const [contact, setContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const data = await contactsApi.getById(contactId);
                setContact(data);
            } catch (error) {
                console.error('Failed to fetch contact:', error);
                toast.error('Failed to load contact');
                router.push('/dashboard/contacts');
            } finally {
                setLoading(false);
            }
        };

        fetchContact();
    }, [contactId, router]);

    const handleEdit = () => {
        router.push(`/dashboard/contacts/${contactId}/edit`);
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await contactsApi.delete(contactId);
            toast.success('Contact deleted successfully');
            router.push('/dashboard/contacts');
        } catch (error) {
            console.error('Failed to delete contact:', error);
            toast.error('Failed to delete contact');
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

    if (!contact) {
        return (
            <div className="flex h-full flex-col items-center justify-center">
                <p className="text-lg text-muted-foreground">Contact not found</p>
                <Button variant="link" onClick={() => router.push('/dashboard/contacts')}>
                    Back to Contacts
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/contacts')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">
                        {contact.firstName && contact.lastName
                            ? `${contact.firstName} ${contact.lastName}`
                            : contact.firstName || contact.lastName || contact.email}
                    </h1>
                    {contact.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 ml-2">
                            Active
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 ml-2">
                            Inactive
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/send?recipients=${contact.email}`)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
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
                                <DialogTitle>Delete Contact</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete this contact? This action cannot be undone.
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
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p className="break-all">{contact.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Added On</p>
                                <p>{formatDate(contact.createdAt)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">First Name</p>
                                <p>{contact.firstName || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                                <p>{contact.lastName || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {contact.metadata && Object.keys(contact.metadata).length > 0 ? (
                            <div className="space-y-4">
                                {Object.entries(contact.metadata).map(([key, value]) => (
                                    <div key={key}>
                                        <p className="text-sm font-medium text-muted-foreground capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </p>
                                        <p>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No additional information</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
