// src/types/index.ts

// User related types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

// Email template related types
export interface MailTemplate {
    id: string;
    name: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTemplateRequest {
    name: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
}

// SMTP configuration related types
export interface SmtpConfig {
    id: string;
    name: string;
    host: string;
    port: number;
    username: string;
    password?: string; // Optional as it's not always returned from API
    secure: boolean;
    fromEmail: string;
    fromName: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSmtpConfigRequest {
    name: string;
    host: string;
    port: number;
    username: string;
    password: string;
    secure: boolean;
    fromEmail: string;
    fromName: string;
}

// Contact related types
export interface Contact {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateContactRequest {
    email: string;
    firstName?: string;
    lastName?: string;
    metadata?: Record<string, any>;
}

export interface ImportContactsRequest {
    csvContent: string;
}

export interface ImportContactsResponse {
    totalImported: number;
    skipped: string[];
}

// Email sending related types
export interface SendMailRequest {
    recipients: string[];
    templateId: string;
    smtpConfigId: string;
    templateData?: Record<string, any>;
}

export interface SendMailResponse {
    success: boolean;
    logs: MailLog[];
}

// Mail log related types
export interface MailLog {
    id: string;
    recipient: string;
    subject: string;
    templateId: string;
    status: 'pending' | 'sent' | 'failed';
    errorMessage?: string;
    sentAt: string;
    template?: MailTemplate;
}

// API response types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    status: number;
}