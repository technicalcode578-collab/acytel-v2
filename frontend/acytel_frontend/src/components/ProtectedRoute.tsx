import { Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import authState from '../store/auth.store';

export default function ProtectedRoute(props: { children: any }) {
  const navigate = useNavigate();
  if (!authState.isAuthenticated) {
    navigate('/login');
    return null;
  }
  return <Show when={authState.isAuthenticated}>{props.children}</Show>;
}
