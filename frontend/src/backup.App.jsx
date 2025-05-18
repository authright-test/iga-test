import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import DashboardLayout from './layout/Dashboard';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext.jsx';
import GitHubLogin from './components/auth/GitHubLogin';
import OAuthCallback from './components/auth/OAuthCallback';
import Layout from './components/layout/Layout';
import { useAuth } from './contexts/AuthContext.jsx';
import AuditLogsPage from './pages/mui/AuditLogsPage';
import DashboardPage from './pages/mui/DashboardPage';
import NotFoundPage from './pages/mui/NotFoundPage';
import OrganizationPage from './pages/mui/OrganizationPage';
import PoliciesPage from './pages/mui/PoliciesPage';
import RepositoriesPage from './pages/mui/RepositoriesPage';
import RolesPage from './pages/mui/RolesPage';
import TeamsPage from './pages/mui/TeamsPage';
import UsersPage from './pages/mui/UsersPage';
import { CircularProgress, Box } from '@mui/material';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' />;
  }

  return children;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path='/login' element={<GitHubLogin />} />
          <Route path='/oauth-callback' element={<OAuthCallback />} />

          {/* Protected routes */}
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/roles'
            element={
              <ProtectedRoute>
                <Layout>
                  <RolesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/policies'
            element={
              <ProtectedRoute>
                <Layout>
                  <PoliciesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/audit-logs'
            element={
              <ProtectedRoute>
                <Layout>
                  <AuditLogsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/organization'
            element={
              <ProtectedRoute>
                <Layout>
                  <OrganizationPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/users'
            element={
              <ProtectedRoute>
                <Layout>
                  <UsersPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/repositories'
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <RepositoriesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/teams'
            element={
              <ProtectedRoute>
                <Layout>
                  <TeamsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
