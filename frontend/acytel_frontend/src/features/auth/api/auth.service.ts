// File: src/features/auth/api/auth.service.ts
import api from '../../../shared/api';
import { setToken } from '../model/auth.store';

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

export async function register(credentials: AuthCredentials) {
    try {
        const response = await api.post('/auth/register', credentials);
        return response.data;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
}