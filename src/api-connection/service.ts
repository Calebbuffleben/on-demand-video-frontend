import axios from "axios";

const api = axios.create({
    baseURL: process.env.BACKEND_URL || 'http://localhost:4000', 
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Add request interceptor to include Clerk token from localStorage
api.interceptors.request.use(
    async (config) => {
        if (typeof window === 'undefined') return config;
        
        // Get token from local storage
        const token = localStorage.getItem('token');
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            
            // If needed, you can log the token for debugging (but remove in production!)
            console.log('Using token:', token.substring(0, 15) + '...');
        } else {
            console.warn('No authentication token found');
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API error:', error?.response?.data || error.message);
        
        // Handle specific error conditions
        if (error.response?.status === 401) {
            // Unauthorized - token is invalid or missing
            console.error('Authentication error: Your session may have expired');
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth:unauthorized'));
            }
        } else if (error.response?.status === 400 && 
                  error.response?.data?.message?.includes('organization')) {
            // Organization access issue
            console.error('Organization access error: You do not have access to this organization');
            
            // Log additional details for debugging
            if (typeof window !== 'undefined') {
                console.log('Current user & organization details:');
                // You could add code here to log relevant user & org info
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;