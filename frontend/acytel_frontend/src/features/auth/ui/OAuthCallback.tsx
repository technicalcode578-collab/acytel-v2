import { Component, onMount } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { setToken, setUser } from "../model/auth.store";

export const OAuthCallback: Component = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  onMount(() => {
    const token = searchParams.token;
    const userString = searchParams.user;
    const error = searchParams.error;

    if (error) {
      console.error('OAuth error:', error);
      navigate('/welcome?error=' + error, { replace: true });
      return;
    }

    if (token && userString) {
      try {
        const user = JSON.parse(decodeURIComponent(userString));
        setToken(token);
        setUser(user);
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Failed to parse user data:', err);
        navigate('/welcome?error=invalid_data', { replace: true });
      }
    } else {
      navigate('/welcome?error=missing_data', { replace: true });
    }
  });

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-900">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p class="text-gray-300">Completing sign in...</p>
      </div>
    </div>
  );
};