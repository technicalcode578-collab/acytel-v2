import api from './api';
import { setToken } from '../store/auth.store';

interface AuthCredentials {
    email: string;
    password: string;
}

export async function login(credentials: AuthCredentials) {
    try {
        const response = await api.post('/auth/login', credentials);
        const token = response.data.token;
        if (token) {
            setToken(token);
            console.log('Login successful, token stored.');
        }
        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

// Add this new register function
export async function register(credentials: AuthCredentials) {
    try {
        const response = await api.post('/auth/register', credentials);
        return response.data;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
}