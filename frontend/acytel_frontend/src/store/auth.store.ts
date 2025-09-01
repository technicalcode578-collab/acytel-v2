import { createStore } from "solid-js/store";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

const [authState, setAuthState] = createStore<AuthState>({
  token: localStorage.getItem("acytel_token"),
  isAuthenticated: !!localStorage.getItem("acytel_token"),
});

export function setToken(token: string) {
  localStorage.setItem("acytel_token", token);
  setAuthState({
    token: token,
    isAuthenticated: true,
  });
}

export function logout() {
  localStorage.removeItem("acytel_token");
  setAuthState({
    token: null,
    isAuthenticated: false,
  });
}

export default authState;