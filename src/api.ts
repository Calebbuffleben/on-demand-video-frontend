import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', 
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true 
});

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('accessToken');
  if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error: Error) => {
  return  Promise.reject(error);
})

api.interceptors.response.use((response: Response) => {
  return response;
}, async (error) => {
  const originalRequest = error.config;

  if(error.response.status === 401 && !originalRequest._retry) {
      try {
          const response = await api.post('/refresh-token');
          const newAccessToken = response.data.accessToken;

          sessionStorage.setItem('accessToken', newAccessToken);
          
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
      } catch (refreshError) {
          console.error('Refresh token failed', refreshError);
          sessionStorage.removeItem('accessToken');
      }
  }

  return Promise.reject(error);
});

export default api;