import { Component, lazy } from 'solid-js';
import { Routes, Route } from '@solidjs/router';
import ProtectedRoute from '../shared/ui/ProtectedRoute';
import authState from '../features/auth/auth.store';

const WelcomePage = lazy(() => import('../pages/WelcomePage'));
const AuthPage = lazy(() => import('../pages/AuthPage'));
const MainApplicationPage = lazy(() => import('../pages/MainApplicationPage'));

const App: Component = () => (
  <Routes>
    <Route path="/welcome" component={WelcomePage} />
    <Route path="/auth" component={AuthPage} />
    <Route path="/*" component={() =>
      <ProtectedRoute condition={authState.isAuthenticated} redirectTo="/welcome">
        <MainApplicationPage />
      </ProtectedRoute>
    } />
  </Routes>
);
export default App;
