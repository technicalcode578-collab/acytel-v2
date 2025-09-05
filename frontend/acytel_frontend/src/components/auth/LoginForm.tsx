import { createSignal } from "solid-js";
import { useNavigate } from '@solidjs/router';
import { login } from "../../services/auth.service";
console.log("LOGIN FORM SUBMITTED!"); // <-- Add this line


export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: Event) => {
  console.log("LOGIN FORM SUBMITTED!");
  e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email: email(), password: password() });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-6">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-300">Email address</label>
        <div class="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            class="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
          />
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-300">Password</label>
        <div class="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            class="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
          />
        </div>
      </div>

      {error() && <p class="text-sm text-red-400">{error()}</p>}

      <div>
        <button
          type="submit"
          disabled={loading()}
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {loading() ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  );
}