import { Show, JSX } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import authState from '../model/auth.store';

export default function ProtectedRoute(props: { children: JSX.Element }) {
  const navigate = useNavigate();
  
  if (!authState.isAuthenticated) {
    navigate('/welcome', { replace: true }); // CORRECTED REDIRECT
    return null;
  }

  return <Show when={authState.isAuthenticated}>{props.children}</Show>;
}