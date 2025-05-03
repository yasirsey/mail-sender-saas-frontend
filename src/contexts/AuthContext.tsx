// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const router = useRouter();

    // Check if user is already logged in
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                    setIsAuthenticated(true);

                    // Verify token validity by getting user profile
                    const userProfile = await authApi.getProfile();
                    setUser(userProfile);
                } catch (error) {
                    // Token invalid or expired
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (data: LoginRequest) => {
        setLoading(true);
        setError(null);

        try {
            const response = await authApi.login(data);
            localStorage.setItem('accessToken', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            setUser(response.user);
            setIsAuthenticated(true);
            toast.success('Login successful!');
            router.push('/dashboard');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to login. Please try again.';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: RegisterRequest) => {
        setLoading(true);
        setError(null);

        try {
            const response = await authApi.register(data);
            localStorage.setItem('accessToken', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            setUser(response.user);
            setIsAuthenticated(true);
            toast.success('Registration successful!');
            router.push('/dashboard');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to register. Please try again.';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        router.push('/auth/login');
        toast.success('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}