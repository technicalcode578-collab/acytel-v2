import { createSignal } from 'solid-js';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export default function AuthForms() {
  const [showLogin, setShowLogin] = createSignal(true);

  return (
    <div class="max-w-md mx-auto bg-gray-800 p-8 rounded shadow">
      {showLogin() ? <LoginForm /> : <RegisterForm onRegisterSuccess={() => setShowLogin(true)} />}
      <div class="mt-4 text-center">
        {showLogin() ? (
          <button
            class="text-blue-400 hover:underline"
            onClick={() => setShowLogin(false)}
          >
            Don't have an account? Register
          </button>
        ) : (
          <button
            class="text-blue-400 hover:underline"
            onClick={() => setShowLogin(true)}
          >
            Already have an account? Login
          </button>
        )}
      </div>
    </div>
  );
}
