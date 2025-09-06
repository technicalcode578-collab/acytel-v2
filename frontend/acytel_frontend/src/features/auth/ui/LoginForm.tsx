// File: src/features/auth/ui/LoginForm.tsx
import { createSignal, Component } from "solid-js";
import { useNavigate } from '@solidjs/router';
import { Motion } from "solid-motion";
import { login } from "../api/auth.service";
import authStyles from './Auth.module.css';

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
    <div class="flex flex-col items-center justify-center min-h-screen">
      <div class={`w-full max-w-md ${authStyles.formWrapper}`}>
        <div class={authStyles.formContent}>
          <h2 class="text-center text-2xl font-bold text-gray-100 mb-8">Sign In to Acytel</h2>
          <form onSubmit={handleSubmit} class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-400">Email</label>
              <input id="email" type="email" required value={email()} onInput={(e) => setEmail(e.currentTarget.value)}
                class="mt-1 appearance-none block w-full px-4 py-3 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 sm:text-sm bg-gray-800 text-white transition"
              />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-400">Password</label>
              <input id="password" type="password" required value={password()} onInput={(e) => setPassword(e.currentTarget.value)}
                class="mt-1 appearance-none block w-full px-4 py-3 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 sm:text-sm bg-gray-800 text-white transition"
              />
            </div>
            <Motion component="div" initial={{ opacity: 0 }} animate={{ opacity: error() ? 1 : 0 }} transition={{ duration: 0.3 }}>
              {error() && <p class="text-sm text-red-400 text-center">{error()}</p>}
            </Motion>
            <div>
              <Motion component="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading()} class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed">
                {loading() ? "Signing in..." : "Sign In"}
              </Motion>
            </div>
          </form>
          <p class="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <button type="button" onClick={props.onSwitchToRegister} class="font-medium text-indigo-400 hover:text-indigo-300 transition">
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}