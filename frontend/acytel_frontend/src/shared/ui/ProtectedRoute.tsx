// File: src/shared/ui/ProtectedRoute.tsx
import { Show, JSX } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import authState from '../../features/auth/model/auth.store';

export default function ProtectedRoute(props: { children: JSX.Element }) {
  const navigate = useNavigate();
  if (!authState.isAuthenticated) {
    navigate('/login', { replace: true });
    return null;
  }
  return <Show when={authState.isAuthenticated}>{props.children}</Show>;
}