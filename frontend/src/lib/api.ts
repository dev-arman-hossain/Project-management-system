import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data: { email: string; name: string; password: string; role?: string }) =>
        apiClient.post('/auth/register', data),

    login: (data: { email: string; password: string }) =>
        apiClient.post('/auth/login', data),

    logout: () => apiClient.post('/auth/logout'),

    getCurrentUser: () => apiClient.get('/auth/me'),

    refreshToken: () => apiClient.post('/auth/refresh'),
};

// Users API
export const usersAPI = {
    getAll: () => apiClient.get('/users'),

    getById: (id: string) => apiClient.get(`/users/${id}`),

    getStats: (id: string) => apiClient.get(`/users/${id}/stats`),

    update: (id: string, data: any) => apiClient.patch(`/users/${id}`, data),

    delete: (id: string) => apiClient.delete(`/users/${id}`),
};

// Projects API
export const projectsAPI = {
    getAll: () => apiClient.get('/projects'),

    getStats: () => apiClient.get('/projects/stats'),

    getById: (id: string) => apiClient.get(`/projects/${id}`),

    create: (data: { title: string; description?: string; assignedToId?: string }) =>
        apiClient.post('/projects', data),

    update: (id: string, data: any) => apiClient.patch(`/projects/${id}`, data),

    delete: (id: string) => apiClient.delete(`/projects/${id}`),
};

export default apiClient;
