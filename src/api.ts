import axios, { AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: process.env.BACKEND_URL || 'http://localhost:4000/api', 
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true 
});

api.interceptors.request.use(config => {
  // First try to get token from Clerk (localStorage)
  const clerkToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  // Fallback to sessionStorage for custom auth flow
  const sessionToken = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
  
  const token = clerkToken || sessionToken;
  
  if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error: Error) => {
  return Promise.reject(error);
})

api.interceptors.response.use((response: AxiosResponse) => {
  return response;
}, async (error) => {
  const originalRequest = error.config;

  // Only attempt token refresh if:
  // 1. Response is 401 Unauthorized
  // 2. We haven't tried to refresh already
  // 3. We're not using Clerk auth (which handles its own token refresh)
  // 4. We're in a browser environment
  if (error.response && 
      error.response.status === 401 && 
      !originalRequest._retry && 
      typeof window !== 'undefined' && 
      !localStorage.getItem('token')) {
      
      originalRequest._retry = true;
      
      try {
          // Only attempt to refresh if the endpoint is available
          console.log('Attempting to refresh expired token...');
          const response = await axios.post('/api/auth/refresh-token');
          
          if (response.data && response.data.accessToken) {
              const newAccessToken = response.data.accessToken;
              sessionStorage.setItem('accessToken', newAccessToken);
              api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              return api(originalRequest);
          }
      } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          sessionStorage.removeItem('accessToken');
          // Could redirect to login page here if needed
      }
  }

  return Promise.reject(error);
});

export default api;