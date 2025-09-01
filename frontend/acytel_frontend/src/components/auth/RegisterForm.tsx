import { createSignal } from "solid-js";
import { register } from "../../services/auth.service";

export function RegisterForm({ onRegisterSuccess }: { onRegisterSuccess: () => void }) {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [success, setSuccess] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await register({ email: email(), password: password() });
      setSuccess(true);
      setTimeout(onRegisterSuccess, 1000); // Switch to login form after a delay
    } catch (err: any) {
      setError(err.response?.data?.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-6">
      {/* Email and Password input fields are styled the same as LoginForm */}
      <div>
          <label for="reg-email" class="block text-sm font-medium text-gray-300">Email address</label>
          <input id="reg-email" type="email" required class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white" value={email()} onInput={(e) => setEmail(e.currentTarget.value)} />
      </div>
      <div>
          <label for="reg-password" class="block text-sm font-medium text-gray-300">Password</label>
          <input id="reg-password" type="password" required class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white" value={password()} onInput={(e) => setPassword(e.currentTarget.value)} />
      </div>

      {error() && <p class="text-sm text-red-400">{error()}</p>}
      {success() && <p class="text-sm text-green-400">Registration successful! Please log in.</p>}

      <div>
        <button type="submit" disabled={loading()} class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500">
          {loading() ? "Registering..." : "Register"}
        </button>
      </div>
    </form>
  );
}