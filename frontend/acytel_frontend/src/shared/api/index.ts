// File: src/shared/api/index.ts
import axios from 'axios';
import authState from '../../features/auth/model/auth.store';

const api = axios.create({
    // Using an environment variable for the base URL is a best practice.
    // Ensure VITE_API_BASE_URL is set in your .env file.
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://automatic-halibut-9746qww7jwx4fpwpq-3000.app.github.dev/api',
});

// Axios Request Interceptor: This function runs BEFORE every request.
api.interceptors.request.use(config => {
    const token = authState.token;
    if (token) {
        // If a token exists, automatically add the Authorization header.
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;