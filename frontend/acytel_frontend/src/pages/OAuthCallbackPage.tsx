///workspaces/acytel-v2/frontend/acytel_frontend/src/pages/OAuthCallbackPage.tsx
import { onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
// Import the store and the setter function with correct names
import authState, { setToken, setUser } from "../features/auth/model/auth.store";

const OAuthCallbackPage = () => {
  const navigate = useNavigate();

  onMount(() => {
    // Get the token from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');

    if (token && userStr) {
      // Use the setToken function which handles both localStorage and state updates
      setToken(token);
      try {
        const user = JSON.parse(userStr);
        setUser(user);
      } catch (error) {
        console.error("Failed to parse user data from URL", error);
        navigate('/login?error=auth_failed', { replace: true });
        return;
      }
      
      // Redirect to the main application page
      navigate('/', { replace: true });
    } else {
      // If no token, redirect to the login page with an error
      navigate('/login?error=auth_failed', { replace: true });
    }
  });

  return (
    <div>Loading...</div>
  );
};

export default OAuthCallbackPage;