import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 errors and only if not already on the login or home page
    if (error.response?.status === 401 && !window.location.pathname.includes('/login') && window.location.pathname !== '/') {
      // Store the current path to redirect back after login
      const currentPath = window.location.pathname + window.location.search;
      
      // Only clear and redirect if we're not already on the home page
      if (currentPath !== '/') {
        // Use a small timeout to ensure any pending state updates complete
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Store the current path to redirect back after login
          sessionStorage.setItem('redirectAfterLogin', currentPath);
          window.location.href = '/login';
        }, 0);
      }
    }
    return Promise.reject(error);
  }
);

// Create a separate axios instance for file uploads
const fileApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add auth token to file upload requests
fileApi.interceptors.request.use(
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

// Auth API
export const authAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  updateProfile: (userData) => {
    console.log('Sending update profile request with data:');
    // Log form data entries
    if (userData instanceof FormData) {
      for (let [key, value] of userData.entries()) {
        console.log(key, value);
      }
    } else {
      console.log(userData);
    }
    
    return fileApi.put('/users/profile', userData)
      .then(response => {
        console.log('Profile update successful:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Profile update failed:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        throw error;
      });
  },
  getProfile: () => api.get('/users/profile')
};

// Expenses API
export const expensesAPI = {
  getAll: (params = {}) => api.get('/expenses', { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (expenseData) => api.post('/expenses/add', expenseData),
  update: (id, expenseData) => api.put(`/expenses/${id}`, expenseData),
  delete: (id) => api.delete(`/expenses/${id}`),
  getSummary: (params = {}) => api.get('/expenses/summary', { params }),
  exportExcel: (params) => api.get('/expenses/export', { params, responseType: 'blob' })
};

// Income API
export const incomeAPI = {
  getAll: (params = {}) => api.get('/income', { params }),
  getById: (id) => api.get(`/income/${id}`),
  create: (incomeData) => api.post('/income/add', incomeData),
  update: (id, incomeData) => api.put(`/income/${id}`, incomeData),
  delete: (id) => api.delete(`/income/${id}`),
  getSummary: (params = {}) => api.get('/income/summary', { params }),
  exportExcel: (params) => api.get('/income/export', { params, responseType: 'blob' })
};

// Combined Export API
export const exportAllExcel = (params) => api.get('/export/all', { params, responseType: 'blob' });

export default api;