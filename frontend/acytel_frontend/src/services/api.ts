import axios from 'axios';
import authState from '../store/auth.store';

const api = axios.create({
    baseURL: 'https://expert-orbit-g4wx56647xp73wpvv-3000.app.github.dev/api',
});

// This is an Axios Request Interceptor. It's a function that runs
// BEFORE every single request is sent by this Axios instance.
api.interceptors.request.use(config => {
    const token = authState.token;
    if (token) {
        // If a token exists in our store, automatically add the
        // Authorization header to the request.
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;