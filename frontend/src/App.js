import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import GitHubLogin from './components/auth/GitHubLogin';
import OAuthCallback from './components/auth/OAuthCallback';
import Layout from './components/Layout';
import { useAuth } from './contexts/AuthContext';
import AuditLogsPage from './pages/AuditLogsPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import OrganizationPage from './pages/OrganizationPage';
import PoliciesPage from './pages/PoliciesPage';
import RepositoriesPage from './pages/RepositoriesPage';
import RolesPage from './pages/RolesPage';
import TeamsPage from './pages/TeamsPage';
import UsersPage from './pages/UsersPage';
import { system } from './theme';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' />;
  }

  return children;
};

function App() {
  return (
    <ChakraProvider value={system}>
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
              <Layout>
                <RepositoriesPage />
              </Layout>
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
    </ChakraProvider>
  );
}

export default App;
