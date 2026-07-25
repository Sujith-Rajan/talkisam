import axios from 'axios';

const baseURL = '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.get(`${baseURL}/auth/refresh`, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, you'd typically redirect to login or clear state
        console.error('Refresh token failed', refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
