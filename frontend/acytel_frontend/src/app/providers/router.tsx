// File: src/app/providers/router.tsx (Corrected)
import { lazy } from 'solid-js';
import { Route, Router } from '@solidjs/router';
import ProtectedRoute from '../../features/auth/ui/ProtectedRoute';
import GuestRoute from '../../features/auth/ui/GuestRoute';
import MainApplicationPage from '../../pages/MainApplicationPage';
import OAuthCallbackPage from '../../pages/OAuthCallbackPage';
// Import the HomePage to be used in the route definition.
import HomePage from '../../pages/HomePage'; 
import AddTrackPage from '../../pages/AddTrackPage';

const WelcomePage = lazy(() => import('../../pages/WelcomePage').then(module => ({ default: module.WelcomePage })));
const AuthPage = lazy(() => import('../../pages/AuthPage').then(module => ({ default: module.AuthPage })));

export const AppRouter = () => {
    return (
        <Router>
            {/* Public, Guest-Only Routes */}
            <Route path="/welcome" component={props => <GuestRoute>{props.children}</GuestRoute>}>
                <Route path="" component={WelcomePage} />
            </Route>
            <Route path="/login" component={props => <GuestRoute>{props.children}</GuestRoute>}>
                <Route path="" component={AuthPage} />
            </Route>
            <Route path="/auth/callback" component={OAuthCallbackPage} />
            
            {/* Protected Application Routes */}
            {/* MainApplicationPage now acts as a layout for all nested routes. */}
            <Route path="/" component={props => <ProtectedRoute>{<MainApplicationPage>{props.children}</MainApplicationPage>}</ProtectedRoute>}>
                {/* The root path "/" will now render HomePage inside MainApplicationPage. */}
                <Route path="" component={HomePage} />
                
                {/* Placeholder routes for other pages, to be implemented later. */}
                <Route path="/search" component={() => <div>Search Page</div>} />
                <Route path="/create" component={AddTrackPage} />
                <Route path="/library" component={() => <div>Library Page</div>} />
                <Route path="/settings" component={() => <div>Settings Page</div>} />
            </Route>
        </Router>
    );
};
