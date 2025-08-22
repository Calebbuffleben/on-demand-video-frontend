import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Add request interceptor to include Authorization when explicitly needed (mostly cookies are used)
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
        
        // Get optional token from local storage (fallback). Primary auth is cookie httpOnly.
        const token = localStorage.getItem('token');
        const dbOrgId = localStorage.getItem('dbOrganizationId');

        // Log request details for debugging
        console.log(`API ${config.method?.toUpperCase()} request to: ${config.url}`);

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('✅ Token found in localStorage, added to Authorization header');

            // Add organization context headers if available
            // Clerk org header removed

            // For endpoints that need database ID format
            if (dbOrgId) {
                config.headers['X-DB-Organization-Id'] = dbOrgId;
                console.log('Including database organization ID:', dbOrgId);
            }

            // For subscriptions endpoints, use database ID in URL when not present
            if (config.url && config.url.includes('/api/subscriptions/')) {
                // If URL ends with 'current' or ID is already embedded, don't modify
                if (!config.url.endsWith('/current') &&
                    !config.url.match(/\/api\/subscriptions\/[a-zA-Z0-9_-]+$/)) {

                    // Use database ID if available
                    const orgIdForUrl = dbOrgId;
                    if (orgIdForUrl) {
                        config.url = `/api/subscriptions/${orgIdForUrl}`;
                        console.log('Using organization ID in URL:', orgIdForUrl);
                    }
                }
            }

            // Log token for debugging (truncated for security)
            if (token.length > 20) {
                console.log('🔐 Using token:', token.substring(0, 15) + '...');
            }
        } else {
            console.warn('❌ No authentication token found in localStorage');
            console.log('🔍 localStorage contents:', {
                token: localStorage.getItem('token') ? 'present' : 'missing',
                dbOrganizationId: localStorage.getItem('dbOrganizationId') ? 'present' : 'missing'
            });
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
                
                // ClerkId removed
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
            const dbOrgId = localStorage.getItem('dbOrganizationId');
            
            // Handle specific error conditions
            if (error.response?.status === 401) {
                // Unauthorized - token is invalid or expired
                console.error('Authentication error: Your session may have expired');

                // If this is a retry attempt, don't retry again to avoid infinite loops
                if (error.config?._retry) {
                    console.error('Token refresh failed, redirecting to login...');
                    // Could redirect to login page here
                    return Promise.reject(error);
                }
                
                // Mark this request as retried
                error.config._retry = true;
                
                // Keep minimal: don't auto-refresh here; let context handle it
                // If desired later, re-enable refresh flow here
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
                
                console.log('Organization IDs:', { dbId: dbOrgId });
                
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