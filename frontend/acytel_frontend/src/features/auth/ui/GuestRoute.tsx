import { JSX } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import authState from '../model/auth.store';

export default function GuestRoute(props: { children: JSX.Element }) {
  const navigate = useNavigate();
  
  if (authState.isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  return props.children;
}