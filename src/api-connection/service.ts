import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Add request interceptor to include Clerk token from localStorage
api.interceptors.request.use(
    async (config) => {
        // BYPASS COMPLETELY for embed API routes
        if (config.url?.includes('/embed/') || 
            config.url?.startsWith('/api/embed/') ||
            config.url?.includes('/videos/embed/') ||
            config.url?.includes('/embed-codes') ||
            config.url?.includes('/embed-codes/')) {
            console.log('🎯 AXIOS INTERCEPTOR: Bypassing embed route:', config.url);
            return config;
        }
        
        if (typeof window === 'undefined') {
            // We're on the server, so don't attempt to use localStorage
            console.log('API request on server side - skipping auth token');
            return config;
        }
        
        // Get token from local storage
        const token = localStorage.getItem('token') || localStorage.getItem('clerkToken');
        const clerkOrgId = localStorage.getItem('currentOrganizationId');
        const dbOrgId = localStorage.getItem('dbOrganizationId');
        
        // Log request details for debugging
        console.log(`API ${config.method?.toUpperCase()} request to: ${config.url}`);
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            
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
            console.warn('No authentication token found');
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
    (response) => {
        // BYPASS logging for embed routes to reduce noise
        if (!response.config.url?.includes('/embed/') && 
            !response.config.url?.includes('/videos/embed/') &&
            !response.config.url?.includes('/embed-codes')) {
            console.log(`API response from ${response.config.url}: Status ${response.status}`);
        }
        
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
        // BYPASS error handling for embed routes
        if (error.config?.url?.includes('/embed/') ||
            error.config?.url?.includes('/videos/embed/') ||
            error.config?.url?.includes('/embed-codes')) {
            return Promise.reject(error);
        }
        
        console.error('API error:', error?.response?.data || error.message);
        
        // Only attempt to use localStorage and event dispatching on the client
        if (typeof window !== 'undefined') {
            // Get organization context for better error handling
            const clerkOrgId = localStorage.getItem('currentOrganizationId');
            const dbOrgId = localStorage.getItem('dbOrganizationId');
            
            // Handle specific error conditions
            if (error.response?.status === 401) {
                // Unauthorized - token is invalid or expired
                console.error('Authentication error: Your session may have expired');
                
                // Trigger token refresh by dispatching the unauthorized event
                // This will be caught by the useClerkToken hook
                window.dispatchEvent(new CustomEvent('auth:unauthorized'));
                
                // If this is a retry attempt, don't retry again to avoid infinite loops
                if (error.config?._retry) {
                    console.error('Token refresh failed, redirecting to login...');
                    // Could redirect to login page here
                    return Promise.reject(error);
                }
                
                // Mark this request as retried
                error.config._retry = true;
                
                // Try to get a fresh token from Clerk
                try {
                    console.log('Attempting to get fresh token from Clerk...');
                    
                    // Dispatch event to trigger token refresh
                    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
                    
                    // Wait a bit for the token to be refreshed
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Get the fresh token
                    const freshToken = localStorage.getItem('token');
                    if (freshToken && freshToken !== error.config.headers['Authorization']?.split(' ')[1]) {
                        console.log('Fresh token obtained, retrying request...');
                        error.config.headers['Authorization'] = `Bearer ${freshToken}`;
                        return api(error.config);
                    }
                } catch (refreshError) {
                    console.error('Failed to refresh token:', refreshError);
                }
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