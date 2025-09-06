// File: src/features/auth/ui/RegisterForm.tsx
import { createSignal, Component } from "solid-js";
import { Motion } from "solid-motion";
import { register } from "../api/auth.service";
import authStyles from './Auth.module.css';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: Component<RegisterFormProps> = (props) => {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [emailError, setEmailError] = createSignal<string | null>(null);
  const [passwordError, setPasswordError] = createSignal<string | null>(null);
  const [apiError, setApiError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [success, setSuccess] = createSignal(false);

  const validateEmail = () => {
    const emailValue = email();
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = () => {
    const passwordValue = password();
    if (!passwordValue || passwordValue.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setApiError(null);

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    if (!isEmailValid || !isPasswordValid) return;

    setLoading(true);
    try {
      await register({ email: email(), password: password() });
      setSuccess(true);
      setTimeout(() => {
        props.onSwitchToLogin();
      }, 2000);
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="flex flex-col items-center justify-center min-h-screen">
      <div class={`w-full max-w-md ${authStyles.formWrapper}`}>
        <div class={authStyles.formContent}>
          <h2 class="text-center text-2xl font-bold text-gray-100 mb-8">Create your Account</h2>
          <form onSubmit={handleSubmit} class="space-y-4">
            <div>
              <label for="reg-email" class="block text-sm font-medium text-gray-400">Email</label>
              <input id="reg-email" type="email" required value={email()} onInput={(e) => setEmail(e.currentTarget.value)} onBlur={validateEmail}
                class={`mt-1 appearance-none block w-full px-4 py-3 border rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 sm:text-sm bg-gray-800 text-white transition ${emailError() ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-indigo-500'}`}
              />
                <Motion component="div" initial={{ opacity: 0 }} animate={{ opacity: emailError() ? 1 : 0 }} transition={{ duration: 0.3 }}>
                  {emailError() && <p class="text-xs text-red-400 mt-1">{emailError()}</p>}
                </Motion>
            </div>
            <div>
              <label for="reg-password" class="block text-sm font-medium text-gray-400">Password</label>
              <input id="reg-password" type="password" required value={password()} onInput={(e) => setPassword(e.currentTarget.value)} onBlur={validatePassword}
                class={`mt-1 appearance-none block w-full px-4 py-3 border rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 sm:text-sm bg-gray-800 text-white transition ${passwordError() ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-indigo-500'}`}
              />
                <Motion component="div" initial={{ opacity: 0 }} animate={{ opacity: passwordError() ? 1 : 0 }} transition={{ duration: 0.3 }}>
                 {passwordError() && <p class="text-xs text-red-400 mt-1">{passwordError()}</p>}
                </Motion>
            </div>
            <Motion component="div" initial={{ opacity: 0 }} animate={{ opacity: apiError() || success() ? 1 : 0 }} transition={{ duration: 0.3 }}>
              {apiError() && <p class="text-sm text-red-400 text-center pt-2">{apiError()}</p>}
              {success() && <p class="text-sm text-green-400 text-center pt-2">Registration successful! Please log in.</p>}
            </Motion>
            <div class="pt-2">
              <Motion component="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading() || success()} class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed">
                {loading() ? "Creating Account..." : "Create Account"}
              </Motion>
            </div>
          </form>
          <p class="mt-8 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <button type="button" onClick={props.onSwitchToLogin} class="font-medium text-indigo-400 hover:text-indigo-300 transition">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};