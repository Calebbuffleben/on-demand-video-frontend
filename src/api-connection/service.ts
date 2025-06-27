import axios from "axios";
import { getFreshToken, isTokenExpired } from "../utils/tokenUtils";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://on-demand-video-backend.onrender.com/api',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Add request interceptor to include Clerk token from localStorage
api.interceptors.request.use(
    async (config) => {
        if (typeof window === 'undefined') {
            // We're on the server, so don't attempt to use localStorage
            console.log('API request on server side - skipping auth token');
            return config;
        }
        
        // Get fresh token to avoid expiry issues
        let token = await getFreshToken();
        const clerkOrgId = localStorage.getItem('currentOrganizationId');
        const dbOrgId = localStorage.getItem('dbOrganizationId');
        
        // Log request details for debugging
        console.log(`API ${config.method?.toUpperCase()} request to: ${config.url}`);
        console.log('Token available:', !!token);
        console.log('Token length:', token?.length || 0);
        console.log('Organization IDs - Clerk:', clerkOrgId, 'DB:', dbOrgId);
        
        // Check if token is expired and try to refresh
        if (token && isTokenExpired(token)) {
            console.warn('⚠️ Token is expired, attempting to refresh...');
            token = await getFreshToken();
        }
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
            
            // Add organization context headers if available
            if (clerkOrgId) {
                // Always use Clerk ID for auth context
                config.headers['X-Organization-Id'] = clerkOrgId;
                console.log('Including Clerk organization ID:', clerkOrgId);
            }
            
            // For endpoints that need database ID format
            if (dbOrgId) {
                config.headers['X-DB-Organization-Id'] = dbOrgId;
                console.log('Including database organization ID:', dbOrgId);
            }
            
            // For subscriptions endpoints, prioritize using database ID in URL
            if (config.url && config.url.includes('/api/subscriptions/')) {
                // If URL ends with 'current' or ID is already embedded, don't modify
                if (!config.url.endsWith('/current') && 
                    !config.url.match(/\/api\/subscriptions\/[a-zA-Z0-9_-]+$/)) {
                    
                    // Use database ID if available, otherwise use Clerk ID
                    const orgIdForUrl = dbOrgId || clerkOrgId;
                    if (orgIdForUrl) {
                        config.url = `/api/subscriptions/${orgIdForUrl}`;
                        console.log('Using organization ID in URL:', orgIdForUrl);
                    }
                }
            }
            
            // Log token for debugging (truncated for security)
            if (token.length > 20) {
                console.log('Using token:', token.substring(0, 15) + '...');
            }
        } else {
            console.warn('No authentication token found in localStorage');
            console.warn('Available localStorage keys:', Object.keys(localStorage));
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log(`API response from ${response.config.url}: Status ${response.status}`);
        
        // Only attempt to use localStorage on the client
        if (typeof window !== 'undefined') {
            // Check for organization ID in response and save it
            if (response.data?.organization?.id) {
                // If the ID format suggests a database ID (UUID), save it
                if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(response.data.organization.id)) {
                    console.log('Saving database organization ID from response:', response.data.organization.id);
                    localStorage.setItem('dbOrganizationId', response.data.organization.id);
                }
                
                // If there's a clerkId field, save that too
                if (response.data.organization.clerkId) {
                    console.log('Saving Clerk organization ID from response:', response.data.organization.clerkId);
                    localStorage.setItem('currentOrganizationId', response.data.organization.clerkId);
                }
            }
        }
        
        return response;
    },
    async (error) => {
        console.error('API error:', error?.response?.data || error.message);
        
        // Handle 401 errors by attempting token refresh
        if (error.response?.status === 401 && !error.config._retry) {
            console.log('🔄 401 error detected, attempting token refresh...');
            error.config._retry = true;
            
            try {
                // Get a fresh token
                const freshToken = await getFreshToken();
                if (freshToken) {
                    // Update the failed request with new token
                    error.config.headers['Authorization'] = `Bearer ${freshToken}`;
                    console.log('✅ Token refreshed, retrying request...');
                    
                    // Retry the original request
                    return api(error.config);
                }
            } catch (refreshError) {
                console.error('❌ Failed to refresh token:', refreshError);
            }
        }
        
        // Only attempt to use localStorage and event dispatching on the client
        if (typeof window !== 'undefined') {
            // Get organization context for better error handling
            const clerkOrgId = localStorage.getItem('currentOrganizationId');
            const dbOrgId = localStorage.getItem('dbOrganizationId');
            
            // Handle specific error conditions
            if (error.response?.status === 401) {
                // Unauthorized - token is invalid or missing
                console.error('Authentication error: Your session may have expired');
                window.dispatchEvent(new CustomEvent('auth:unauthorized'));
            } else if (error.response?.status === 400) {
                // Organization access issue
                console.error('Request error:', error.response.data.message);
                
                // Log detailed request info for debugging
                console.error('Request URL:', error.config?.url);
                console.error('Request headers:', JSON.stringify({
                    'Authorization': error.config?.headers?.Authorization ? 'Bearer [REDACTED]' : 'None',
                    'X-Organization-Id': error.config?.headers?.['X-Organization-Id'] || 'None',
                    'X-DB-Organization-Id': error.config?.headers?.['X-DB-Organization-Id'] || 'None'
                }));
                console.log('Request details:', {
                    method: error.config?.method,
                    params: error.config?.params,
                    data: error.config?.data
                });
                
                console.log('Organization IDs:', {
                    clerkId: clerkOrgId,
                    dbId: dbOrgId
                });
                
                // If error is organization related, check auth state
                if (error.response?.data?.message?.includes('organization')) {
                    window.dispatchEvent(new CustomEvent('org:accessdenied', {
                        detail: { message: error.response.data.message }
                    }));
                }
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;