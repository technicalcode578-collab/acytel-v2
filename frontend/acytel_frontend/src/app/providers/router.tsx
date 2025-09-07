import { lazy } from 'solid-js';
import { Route, Router } from '@solidjs/router';
import ProtectedRoute from '../../features/auth/ui/ProtectedRoute';
import GuestRoute from '../../features/auth/ui/GuestRoute'; // IMPORT GUEST ROUTE
import MainApplicationPage from '../../pages/MainApplicationPage';

const WelcomePage = lazy(() => import('../../pages/WelcomePage').then(module => ({ default: module.WelcomePage })));
const AuthPage = lazy(() => import('../../pages/AuthPage').then(module => ({ default: module.AuthPage })));

export const AppRouter = () => {
    return (
        <Router>
            {/* Public, Guest-Only Routes */}
            <Route path="/welcome" component={() => <GuestRoute><WelcomePage /></GuestRoute>} />
            <Route path="/login" component={() => <GuestRoute><AuthPage /></GuestRoute>} />

            {/* Protected Application Routes */}
            <Route path="/*" component={() => (
                <ProtectedRoute>
                    <MainApplicationPage />
                </ProtectedRoute>
            )} />
        </Router>
    );
};