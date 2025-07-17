// src/app/dashboard/send/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Send, Mail, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { templatesApi, smtpConfigApi, contactsApi, mailApi } from '@/services/api';
import { MailTemplate, SmtpConfig, Contact, SendMailRequest } from '@/types';

// Form validation schema
const sendEmailSchema = z.object({
    templateId: z.string().min(1, { message: 'Please select a template' }),
    smtpConfigId: z.string().min(1, { message: 'Please select an SMTP configuration' }),
    recipients: z.string().min(1, { message: 'Please enter at least one recipient' }),
    templateData: z.string().optional(),
});

export default function SendEmailPage() {
    const [templates, setTemplates] = useState<MailTemplate[]>([]);
    const [smtpConfigs, setSmtpConfigs] = useState<SmtpConfig[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<MailTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [recipientType, setRecipientType] = useState('manual');
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize form
    const form = useForm<z.infer<typeof sendEmailSchema>>({
        resolver: zodResolver(sendEmailSchema),
        defaultValues: {
            templateId: '',
            smtpConfigId: '',
            recipients: '',
            templateData: '{}',
        },
    });

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [templatesData, smtpConfigsData, contactsData] = await Promise.all([
                    templatesApi.getAll(),
                    smtpConfigApi.getAll(),
                    contactsApi.getAll(),
                ]);

                setTemplates(templatesData);
                setSmtpConfigs(smtpConfigsData.filter(config => config.isActive));
                setContacts(contactsData.filter(contact => contact.isActive));

                // Check for URL parameters
                const templateId = searchParams.get('templateId');
                const recipients = searchParams.get('recipients');

                if (templateId) {
                    form.setValue('templateId', templateId);
                    // Fetch template details
                    const template = templatesData.find(t => t.id === templateId);
                    if (template) {
                        setSelectedTemplate(template);
                    } else {
                        try {
                            const templateData = await templatesApi.getById(templateId);
                            setSelectedTemplate(templateData);
                        } catch (error) {
                            console.error('Failed to fetch template details:', error);
                        }
                    }
                }

                if (recipients) {
                    form.setValue('recipients', recipients);
                    setRecipientType('manual');
                }

                // Set default SMTP config if available
                if (smtpConfigsData.length > 0) {
                    form.setValue('smtpConfigId', smtpConfigsData[0].id);
                }

            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Failed to load required data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams, form]);

    // Watch template ID changes to fetch template preview
    const watchTemplateId = form.watch('templateId');

    useEffect(() => {
        const fetchTemplateDetails = async () => {
            if (!watchTemplateId) {
                setSelectedTemplate(null);
                return;
            }

            try {
                // Check if we already have this template in our list
                const template = templates.find(t => t.id === watchTemplateId);
                if (template) {
                    setSelectedTemplate(template);
                } else {
                    const templateData = await templatesApi.getById(watchTemplateId);
                    setSelectedTemplate(templateData);
                }
            } catch (error) {
                console.error('Failed to fetch template details:', error);
                toast.error('Failed to load template preview');
            }
        };

        fetchTemplateDetails();
    }, [watchTemplateId, templates]);

    const handleRecipientTypeChange = (type: string) => {
        setRecipientType(type);

        // Clear recipients field when switching types
        form.setValue('recipients', '');
    };

    const handleSelectAllContacts = () => {
        const allEmails = contacts.map(contact => contact.email).join(',');
        form.setValue('recipients', allEmails);
    };

    const onSubmit = async (data: z.infer<typeof sendEmailSchema>) => {
        setSending(true);
        try {
            // Parse template data if provided
            let templateDataObj = {};
            if (data.templateData && data.templateData.trim() !== '') {
                try {
                    templateDataObj = JSON.parse(data.templateData);
                } catch {
                    toast.error('Invalid template data JSON format');
                    setSending(false);
                    return;
                }
            }

            // Split recipients by comma and newline
            const recipientsList = data.recipients
                .split(/[,\n]/)
                .map(email => email.trim())
                .filter(email => email !== '');

            if (recipientsList.length === 0) {
                toast.error('Please enter at least one valid recipient');
                setSending(false);
                return;
            }

            console.log('📧 Recipients array:', recipientsList);
            console.log('📧 Recipients count:', recipientsList.length);

            const sendData: SendMailRequest = {
                templateId: data.templateId,
                smtpConfigId: data.smtpConfigId,
                recipients: recipientsList,
                templateData: Object.keys(templateDataObj).length > 0 ? templateDataObj : undefined,
            };

            console.log('📧 Send data:', sendData);

            const result = await mailApi.send(sendData);

            // Show detailed validation results
            const { validationResults } = result;
            let message = `Email queued successfully! `;
            message += `${validationResults.valid} valid emails will be sent.`;
            
            if (validationResults.invalid > 0) {
                message += ` ${validationResults.invalid} invalid emails were skipped.`;
            }
            
            if (validationResults.disposable > 0) {
                message += ` ${validationResults.disposable} disposable emails were blocked.`;
            }
            
            if (validationResults.noMxRecord > 0) {
                message += ` ${validationResults.noMxRecord} emails had no MX record.`;
            }

            toast.success(message);
            
            // Store batch ID for tracking
            sessionStorage.setItem('lastBatchId', result.batchId);
            
            // Redirect to logs page
            router.push('/dashboard/logs');
        } catch (error) {
            console.error('Failed to send email:', error);
            toast.error('Failed to send email');
        } finally {
            setSending(false);
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
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Send Email</h1>
            </div>

            {templates.length === 0 || smtpConfigs.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center space-y-4 py-8">
                            <Mail className="h-12 w-12 text-muted-foreground" />
                            {templates.length === 0 ? (
                                <div className="text-center">
                                    <h3 className="text-lg font-medium">No Email Templates</h3>
                                    <p className="text-muted-foreground mt-1">
                                        You need to create at least one email template before sending emails.
                                    </p>
                                    <Button
                                        className="mt-4"
                                        onClick={() => router.push('/dashboard/templates/new')}
                                    >
                                        Create Template
                                    </Button>
                                </div>
                            ) : smtpConfigs.length === 0 ? (
                                <div className="text-center">
                                    <h3 className="text-lg font-medium">No SMTP Configurations</h3>
                                    <p className="text-muted-foreground mt-1">
                                        You need to set up at least one SMTP server configuration before sending emails.
                                    </p>
                                    <Button
                                        className="mt-4"
                                        onClick={() => router.push('/dashboard/smtp/new')}
                                    >
                                        Add SMTP Config
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
                            <div className="md:col-span-3 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Email Details</CardTitle>
                                        <CardDescription>
                                            Choose a template and SMTP configuration for your email
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="templateId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Template</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a template" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {templates.map((template) => (
                                                                <SelectItem key={template.id} value={template.id}>
                                                                    {template.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="smtpConfigId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>SMTP Configuration</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select an SMTP config" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {smtpConfigs.map((config) => (
                                                                <SelectItem key={config.id} value={config.id}>
                                                                    {config.name} ({config.fromEmail})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recipients</CardTitle>
                                        <CardDescription>
                                            Select who will receive this email
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex space-x-4 mb-4">
                                            <Button
                                                type="button"
                                                variant={recipientType === 'manual' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleRecipientTypeChange('manual')}
                                            >
                                                Manual Entry
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={recipientType === 'contacts' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleRecipientTypeChange('contacts')}
                                                disabled={contacts.length === 0}
                                            >
                                                From Contacts
                                            </Button>
                                        </div>

                                        {recipientType === 'contacts' && contacts.length > 0 && (
                                            <div className="flex justify-end mb-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleSelectAllContacts}
                                                >
                                                    Select All ({contacts.length})
                                                </Button>
                                            </div>
                                        )}

                                        <FormField
                                            control={form.control}
                                            name="recipients"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Recipients</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={
                                                                recipientType === 'manual'
                                                                    ? 'Enter email addresses separated by commas'
                                                                    : 'Select contacts from the list or enter email addresses'
                                                            }
                                                            className="min-h-[100px]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Enter multiple email addresses separated by commas
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {recipientType === 'contacts' && contacts.length > 0 && (
                                            <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                                                    {contacts.map((contact) => (
                                                        <div
                                                            key={contact.id}
                                                            className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-muted"
                                                            onClick={() => {
                                                                const currentEmails = form.getValues('recipients')
                                                                    .split(',')
                                                                    .map(email => email.trim())
                                                                    .filter(email => email !== '');

                                                                // Add if not already in list
                                                                if (!currentEmails.includes(contact.email)) {
                                                                    const newRecipients = [...currentEmails, contact.email].join(', ');
                                                                    form.setValue('recipients', newRecipients);
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                                                                {contact.firstName?.[0] || ''}
                                                                {contact.lastName?.[0] || ''}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-medium truncate">
                                                                    {contact.firstName} {contact.lastName}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    {contact.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Template Data</CardTitle>
                                        <CardDescription>
                                            (Optional) Provide data for template variables
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <FormField
                                            control={form.control}
                                            name="templateData"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder='{"firstName": "John", "company": "Acme Inc"}'
                                                            className="min-h-[100px] font-mono text-sm"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Enter JSON data to replace {"{{variables}}"} in your template
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="md:col-span-2 space-y-6">
                                <Card className="sticky top-20">
                                    <CardHeader>
                                        <CardTitle>Email Preview</CardTitle>
                                        <CardDescription>
                                            Preview how your email will look
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedTemplate ? (
                                            <div className="space-y-4">
                                                <div className="rounded-md border p-4">
                                                    <h3 className="font-medium mb-2">Subject:</h3>
                                                    <p className="text-sm">{selectedTemplate.subject}</p>
                                                </div>

                                                <Tabs defaultValue="html">
                                                    <TabsList className="mb-4">
                                                        <TabsTrigger value="html">HTML</TabsTrigger>
                                                        <TabsTrigger value="text">Plain Text</TabsTrigger>
                                                    </TabsList>
                                                    <TabsContent value="html">
                                                        <div className="rounded-md border p-4 max-h-[400px] overflow-auto">
                                                            <div dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlContent }} />
                                                        </div>
                                                    </TabsContent>
                                                    <TabsContent value="text">
                                                        <div className="rounded-md border p-4 max-h-[400px] overflow-auto font-mono text-sm whitespace-pre-wrap">
                                                            {selectedTemplate.textContent || 'No plain text version available.'}
                                                        </div>
                                                    </TabsContent>
                                                </Tabs>
                                            </div>
                                        ) : (
                                            <div className="flex h-40 flex-col items-center justify-center text-center">
                                                <Mail className="h-8 w-8 text-muted-foreground mb-2" />
                                                <p className="text-sm text-muted-foreground">
                                                    Select a template to preview
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="border-t">
                                        <Button type="submit" className="w-full" disabled={sending}>
                                            {sending ? (
                                                <>
                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Send Email
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    );
}
