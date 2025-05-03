// src/services/api.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    User,
    MailTemplate,
    CreateTemplateRequest,
    SmtpConfig,
    CreateSmtpConfigRequest,
    Contact,
    CreateContactRequest,
    ImportContactsRequest,
    ImportContactsResponse,
    SendMailRequest,
    SendMailResponse,
    MailLog
} from '@/types';

// Create axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Handle token expiration
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

// Authentication API
export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    getProfile: async (): Promise<User> => {
        const response = await api.get<User>('/auth/profile');
        return response.data;
    },
};

// Mail Templates API
export const templatesApi = {
    getAll: async (): Promise<MailTemplate[]> => {
        const response = await api.get<MailTemplate[]>('/mail/templates');
        return response.data;
    },

    getById: async (id: string): Promise<MailTemplate> => {
        const response = await api.get<MailTemplate>(`/mail/templates/${id}`);
        return response.data;
    },

    create: async (data: CreateTemplateRequest): Promise<MailTemplate> => {
        const response = await api.post<MailTemplate>('/mail/templates', data);
        return response.data;
    },
};

// SMTP Configuration API
export const smtpConfigApi = {
    getAll: async (): Promise<SmtpConfig[]> => {
        const response = await api.get<SmtpConfig[]>('/mail/smtp-configs');
        return response.data;
    },

    getById: async (id: string): Promise<SmtpConfig> => {
        const response = await api.get<SmtpConfig>(`/mail/smtp-configs/${id}`);
        return response.data;
    },

    create: async (data: CreateSmtpConfigRequest): Promise<SmtpConfig> => {
        const response = await api.post<SmtpConfig>('/mail/smtp-configs', data);
        return response.data;
    },
};

// Contacts API
export const contactsApi = {
    getAll: async (): Promise<Contact[]> => {
        const response = await api.get<Contact[]>('/contacts');
        return response.data;
    },

    getById: async (id: string): Promise<Contact> => {
        const response = await api.get<Contact>(`/contacts/${id}`);
        return response.data;
    },

    create: async (data: CreateContactRequest): Promise<Contact> => {
        const response = await api.post<Contact>('/contacts', data);
        return response.data;
    },

    update: async (id: string, data: CreateContactRequest): Promise<Contact> => {
        const response = await api.patch<Contact>(`/contacts/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/contacts/${id}`);
    },

    import: async (data: ImportContactsRequest): Promise<ImportContactsResponse> => {
        const response = await api.post<ImportContactsResponse>('/contacts/import', data);
        return response.data;
    },
};

// Email Sending API
export const mailApi = {
    send: async (data: SendMailRequest): Promise<SendMailResponse> => {
        const response = await api.post<SendMailResponse>('/mail/send', data);
        return response.data;
    },

    getLogs: async (): Promise<MailLog[]> => {
        const response = await api.get<MailLog[]>('/mail/logs');
        return response.data;
    },
};

export default api;