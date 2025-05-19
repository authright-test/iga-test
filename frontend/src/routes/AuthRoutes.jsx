import GitHubLoginPage from '../pages/auth/GitHubLoginPage';
import OAuthCallback from '../pages/auth/OAuthCallback';

// ==============================|| IGA AUTH ROUTING ||============================== //

const AuthRoutes = [
  {
    path: '/login',
    element: <GitHubLoginPage />
  },
  {
    path: '/oauth-callback',
    element: <OAuthCallback />
  }
];

export default AuthRoutes;
