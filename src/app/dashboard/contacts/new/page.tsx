// src/app/dashboard/contacts/new/page.tsx
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

import { contactsApi } from '@/services/api';
import { CreateContactRequest } from '@/types';

// Form validation schema
const contactSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    metadata: z.string().optional(),
});

export default function NewContactPage() {
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    // Initialize form
    const form = useForm<z.infer<typeof contactSchema>>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            email: '',
            firstName: '',
            lastName: '',
            metadata: '',
        },
    });

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

            const contactData: CreateContactRequest = {
                email: data.email,
                firstName: data.firstName || undefined,
                lastName: data.lastName || undefined,
                metadata: Object.keys(metadataObj).length > 0 ? metadataObj : undefined,
            };

            await contactsApi.create(contactData);
            toast.success('Contact created successfully');
            router.push('/dashboard/contacts');
        } catch (error) {
            console.error('Failed to create contact:', error);
            toast.error('Failed to create contact');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/dashboard/contacts');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Add New Contact</h1>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Details</CardTitle>
                            <CardDescription>
                                Add a new contact to your mailing list
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
                                        Save Contact
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
