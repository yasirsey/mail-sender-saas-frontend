// src/app/dashboard/contacts/[id]/edit/page.tsx
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { contactsApi } from '@/services/api';
import { Contact, CreateContactRequest } from '@/types';

// Form validation schema
const contactSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    metadata: z.string().optional(),
    isActive: z.boolean().default(true),
});

export default function EditContactPage() {
    const params = useParams();
    const router = useRouter();
    const contactId = params.id as string;

    const [contact, setContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Initialize form
    const form = useForm<z.infer<typeof contactSchema>>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            email: '',
            firstName: '',
            lastName: '',
            metadata: '',
            isActive: true,
        },
    });

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const data = await contactsApi.getById(contactId);
                setContact(data);

                // Set form values
                form.reset({
                    email: data.email,
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    metadata: data.metadata ? JSON.stringify(data.metadata, null, 2) : '',
                    isActive: data.isActive,
                });
            } catch (error) {
                console.error('Failed to fetch contact:', error);
                toast.error('Failed to load contact');
                router.push('/dashboard/contacts');
            } finally {
                setLoading(false);
            }
        };

        fetchContact();
    }, [contactId, router, form]);

    const onSubmit = async (data: z.infer<typeof contactSchema>) => {
        setSubmitting(true);
        try {
            // Parse metadata JSON if provided
            let metadataObj = {};
            if (data.metadata) {
                try {
                    metadataObj = JSON.parse(data.metadata);
                } catch (e) {
                    toast.error('Invalid metadata JSON format');
                    setSubmitting(false);
                    return;
                }
            }

            const contactData: CreateContactRequest & { isActive?: boolean } = {
                email: data.email,
                firstName: data.firstName || undefined,
                lastName: data.lastName || undefined,
                metadata: Object.keys(metadataObj).length > 0 ? metadataObj : undefined,
                isActive: data.isActive,
            };

            await contactsApi.update(contactId, contactData);
            toast.success('Contact updated successfully');
            router.push(`/dashboard/contacts/${contactId}`);
        } catch (error) {
            console.error('Failed to update contact:', error);
            toast.error('Failed to update contact');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push(`/dashboard/contacts/${contactId}`);
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
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Edit Contact</h1>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Details</CardTitle>
                            <CardDescription>
                                Update contact information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="contact@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="metadata"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Additional Information (JSON)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='{"company": "Acme Inc", "role": "Manager"}'
                                                className="h-32 font-mono text-sm"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Add custom fields in JSON format (optional)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                                Active contacts will receive emails. Inactive contacts won't.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="justify-between border-t p-4">
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
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
