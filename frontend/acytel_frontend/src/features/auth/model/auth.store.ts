import { createStore } from "solid-js/store";
import api from '../../../shared/api';

interface User {
  id: string;
  email: string;
  displayName?: string;
  profilePicture?: string;
  authProvider: 'local' | 'google';
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const [authState, setAuthState] = createStore<AuthState>({
  token: localStorage.getItem("acytel_token"),
  user: localStorage.getItem("acytel_user") 
    ? JSON.parse(localStorage.getItem("acytel_user")!) 
    : null,
  isAuthenticated: !!localStorage.getItem("acytel_token"),
});

export function setToken(token: string) {
  localStorage.setItem("acytel_token", token);
  setAuthState("token", token);
  setAuthState("isAuthenticated", true);
}

export function setUser(user: User) {
  localStorage.setItem("acytel_user", JSON.stringify(user));
  setAuthState("user", user);
}

export function logout() {
  localStorage.removeItem("acytel_token");
  localStorage.removeItem("acytel_user");
  setAuthState({
    token: null,
    user: null,
    isAuthenticated: false,
  });
}

export async function performLogout() {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout API call failed:', error);
    // Continue with client-side logout even if API fails
  } finally {
    logout(); // Clear local storage and state
  }
}

export default authState;