// src/app/dashboard/contacts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Plus,
    Search,
    Upload,
    Download,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    UserPlus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

import { contactsApi } from '@/services/api';
import { Contact, ImportContactsRequest, ImportContactsResponse } from '@/types';

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [csvContent, setCsvContent] = useState('');
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<ImportContactsResponse | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const data = await contactsApi.getAll();
                setContacts(data);
                setFilteredContacts(data);
            } catch (error) {
                console.error('Failed to fetch contacts:', error);
                toast.error('Failed to load contacts');
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, []);

    // Filter contacts based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredContacts(contacts);
        } else {
            const filtered = contacts.filter(
                (contact) =>
                    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (contact.firstName && contact.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (contact.lastName && contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredContacts(filtered);
        }
    }, [searchTerm, contacts]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleViewContact = (id: string) => {
        router.push(`/dashboard/contacts/${id}`);
    };

    const handleEditContact = (id: string) => {
        router.push(`/dashboard/contacts/${id}/edit`);
    };

    const handleDeleteContact = async (id: string) => {
        try {
            await contactsApi.delete(id);
            setContacts(contacts.filter(contact => contact.id !== id));
            setFilteredContacts(filteredContacts.filter(contact => contact.id !== id));
            toast.success('Contact deleted successfully');
        } catch (error) {
            console.error('Failed to delete contact:', error);
            toast.error('Failed to delete contact');
        }
    };

    const handleImportContacts = async () => {
        if (!csvContent.trim()) {
            toast.error('Please enter CSV content');
            return;
        }

        setImporting(true);
        try {
            const importData: ImportContactsRequest = {
                csvContent,
            };

            const result = await contactsApi.import(importData);
            setImportResult(result);

            if (result.totalImported > 0) {
                toast.success(`Successfully imported ${result.totalImported} contacts`);

                // Refresh contacts list
                const updatedContacts = await contactsApi.getAll();
                setContacts(updatedContacts);
                setFilteredContacts(updatedContacts);
            } else {
                toast.warning('No new contacts were imported');
            }
        } catch (error) {
            console.error('Failed to import contacts:', error);
            toast.error('Failed to import contacts');
        } finally {
            setImporting(false);
        }
    };

    const handleCloseImportDialog = () => {
        setImportDialogOpen(false);
        setImportResult(null);
        setCsvContent('');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const downloadContactsTemplate = () => {
        const header = 'email,firstName,lastName,company,position\n';
        const example = 'john@example.com,John,Doe,Acme Inc,Manager\n';
        const csvData = header + example;

        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'contacts_template.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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
                <h1 className="text-2xl font-bold">Contacts</h1>
                <div className="flex items-center gap-2">
                    <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Upload className="mr-2 h-4 w-4" />
                                Import
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Import Contacts</DialogTitle>
                                <DialogDescription>
                                    Import contacts from a CSV file. The CSV should have headers and include at least an email column.
                                </DialogDescription>
                            </DialogHeader>

                            {!importResult ? (
                                <>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between">
                                                <label htmlFor="csvContent" className="text-sm font-medium">
                                                    CSV Content
                                                </label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 gap-1"
                                                    onClick={downloadContactsTemplate}
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    <span className="text-xs">Download Template</span>
                                                </Button>
                                            </div>
                                            <Textarea
                                                id="csvContent"
                                                placeholder="email,firstName,lastName
john@example.com,John,Doe
jane@example.com,Jane,Smith"
                                                rows={10}
                                                value={csvContent}
                                                onChange={(e) => setCsvContent(e.target.value)}
                                                className="font-mono text-sm"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Make sure the first row contains headers matching contact fields.
                                            </p>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="secondary" onClick={handleCloseImportDialog}>
                                            Cancel
                                        </Button>
                                        <Button type="button" onClick={handleImportContacts} disabled={importing}>
                                            {importing ? (
                                                <>
                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                                                    Importing...
                                                </>
                                            ) : (
                                                'Import Contacts'
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </>
                            ) : (
                                <>
                                    <div className="py-4">
                                        <div className="rounded-md border p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                    <UserPlus className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">Import Results</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {importResult.totalImported} contacts imported successfully
                                                    </p>
                                                </div>
                                            </div>

                                            {importResult.skipped.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="text-sm font-medium">Skipped ({importResult.skipped.length})</h4>
                                                    <div className="mt-2 max-h-40 overflow-y-auto rounded-md border p-2">
                                                        <ul className="space-y-1 text-sm">
                                                            {importResult.skipped.map((message, index) => (
                                                                <li key={index} className="text-muted-foreground">
                                                                    {message}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" onClick={handleCloseImportDialog}>
                                            Done
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>

                    <Link href="/dashboard/contacts/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Contact
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Contacts</CardTitle>
                    <CardDescription>
                        Manage your email contacts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search contacts..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    {filteredContacts.length === 0 ? (
                        <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">No contacts found</p>
                                {searchTerm ? (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Try adjusting your search term
                                    </p>
                                ) : (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Create your first contact or import contacts from a CSV
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Added</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredContacts.map((contact) => (
                                        <TableRow key={contact.id}>
                                            <TableCell className="font-medium">
                                                {contact.firstName && contact.lastName
                                                    ? `${contact.firstName} ${contact.lastName}`
                                                    : contact.firstName || contact.lastName || '-'}
                                            </TableCell>
                                            <TableCell>{contact.email}</TableCell>
                                            <TableCell>
                                                {contact.isActive ? (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{formatDate(contact.createdAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleViewContact(contact.id)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditContact(contact.id)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteContact(contact.id)}
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
                </CardContent>
            </Card>
        </div>
    );
}
