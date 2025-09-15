// frontend/acytel_frontend/src/features/auth/ui/LoginForm.tsx (FINAL)
import { createSignal, Component } from "solid-js";
import { useNavigate } from '@solidjs/router';
import { Motion } from "solid-motion";
import { login } from "../api/auth.service";
import authStyles from './Auth.module.css';
import { GoogleSignInButton } from './GoogleSignInButton';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: Component<LoginFormProps> = (props) => {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email: email(), password: password() });
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class={authStyles.formWrapper}>
      <div class={authStyles.formContent}>
        <h2 class={authStyles.title}>Sign In to Acytel</h2>
        <form onSubmit={handleSubmit} class={authStyles.form}>
          <div>
            <label for="email" class={authStyles.label}>Email</label>
            <input
              id="email"
              type="email"
              required
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              class={authStyles.input}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label for="password" class={authStyles.label}>Password</label>
            <input
              id="password"
              type="password"
              required
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              class={authStyles.input}
              placeholder="••••••••"
            />
          </div>
          <Motion component="div" initial={{ opacity: 0 }} animate={{ opacity: error() ? 1 : 0 }} transition={{ duration: 0.3 }}>
            {error() && <p class={authStyles.errorText}>{error()}</p>}
          </Motion>
          <div>
            <Motion
              component="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading()}
              class={authStyles.submitButton}
            >
              {loading() ? "Signing in..." : "Sign In"}
            </Motion>
          </div>
        </form>
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-600" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-gray-900 text-gray-400">Or continue with</span>
            </div>
          </div>
          <div class="mt-6">
            <GoogleSignInButton />
          </div>
        </div>
        <p class={authStyles.switchText}>
          Don't have an account?{' '}
          <button type="button" onClick={props.onSwitchToRegister} class={authStyles.switchButton}>
            Register
          </button>
        </p>
      </div>
    </div>
  );
}