import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDisclosure } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RolesPage from './pages/RolesPage';
import PoliciesPage from './pages/PoliciesPage';
import AuditLogsPage from './pages/AuditLogsPage';
import OrganizationPage from './pages/OrganizationPage';
import UsersPage from './pages/UsersPage';
import RepositoriesPage from './pages/RepositoriesPage';
import TeamsPage from './pages/TeamsPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected route component - redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const drawerDisclosure = useDisclosure();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} 
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout drawerDisclosure={drawerDisclosure}>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles"
        element={
          <ProtectedRoute>
            <Layout drawerDisclosure={drawerDisclosure}>
              <RolesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/policies"
        element={
          <ProtectedRoute>
            <Layout drawerDisclosure={drawerDisclosure}>
              <PoliciesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute>
            <Layout drawerDisclosure={drawerDisclosure}>
              <AuditLogsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/organization"
        element={
          <ProtectedRoute>
            <Layout drawerDisclosure={drawerDisclosure}>
              <OrganizationPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout drawerDisclosure={drawerDisclosure}>
              <UsersPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/repositories"
        element={
          <ProtectedRoute>
            <Layout drawerDisclosure={drawerDisclosure}>
              <RepositoriesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams"
        element={
          <ProtectedRoute>
            <Layout drawerDisclosure={drawerDisclosure}>
              <TeamsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <Layout drawerDisclosure={drawerDisclosure}>
            <NotFoundPage />
          </Layout>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App; 