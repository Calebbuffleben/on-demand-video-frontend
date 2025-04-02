import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', 
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Important for cookies if you use them
});

// Add request interceptor to include Clerk token from localStorage
api.interceptors.request.use(
    async (config) => {
        // Get token from local storage
        const token = typeof window !== 'undefined' ? localStorage.getItem('clerkToken') : null;
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
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
        console.error('API error:', error);
        
        if (error.response?.status === 401) {
            // Handle unauthorized error - dispatch event for UI handling
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth:unauthorized'));
            }
        }
        return Promise.reject(error);
    }
);

export default api;