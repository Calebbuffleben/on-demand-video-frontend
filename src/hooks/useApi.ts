'use client';

import { useState, useCallback } from 'react';
import { useClerk } from '@clerk/nextjs';
import api from '../api-connection/service'; // Import the corrected service

export function useApi() {
    const { session } = useClerk();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    // Function to get the token and store it if necessary
    const ensureAuthToken = useCallback(async () => {
        if (!session) return null; // Return null if no session
        try {
            const token = await session.getToken();
            if (token && typeof window !== 'undefined') {
                localStorage.setItem('clerkToken', token);
            }
            return token;
        } catch (error) {
            console.error('Failed to get or set token', error);
            // Handle token retrieval error, maybe trigger unauthorized event
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth:unauthorized'));
            }
            return null;
        }
    }, [session]);
    
    // Specific methods without the internal request function
    const get = useCallback(async <T,>(url: string): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            await ensureAuthToken(); // Ensure token is fresh and stored before request
            const response = await api.get<T>(url);
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(new Error(errorMessage));
            console.error(`API Error (GET ${url}):`, err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [ensureAuthToken]);

    const post = useCallback(async <T,>(url: string, data?: any): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            await ensureAuthToken();
            const response = await api.post<T>(url, data);
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(new Error(errorMessage));
            console.error(`API Error (POST ${url}):`, err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [ensureAuthToken]);

    const put = useCallback(async <T,>(url: string, data?: any): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            await ensureAuthToken();
            const response = await api.put<T>(url, data);
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(new Error(errorMessage));
            console.error(`API Error (PUT ${url}):`, err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [ensureAuthToken]);

    const del = useCallback(async <T,>(url: string): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            await ensureAuthToken();
            const response = await api.delete<T>(url);
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(new Error(errorMessage));
            console.error(`API Error (DELETE ${url}):`, err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [ensureAuthToken]);
    
    return {
        get,
        post,
        put,
        delete: del,
        loading,
        error
    };
}

export default useApi; 