// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import React, { lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';

// render - page
const OrganizationPage = Loadable(lazy(() => import('pages/iga/OrganizationPage')));
const PermissionsPage = Loadable(lazy(() => import('pages/iga/PermissionsPage')));
const PoliciesPage = Loadable(lazy(() => import('pages/iga/PoliciesPage')));
const RolesPage = Loadable(lazy(() => import('pages/iga/RolesPage')));
const RepositoriesPage = Loadable(lazy(() => import('pages/iga/RepositoriesPage')));
const TeamsPage = Loadable(lazy(() => import('pages/iga/TeamsPage')));
const UsersPage = Loadable(lazy(() => import('pages/iga/UsersPage')));
const AuditLogsPage = Loadable(lazy(() => import('pages/iga/AuditLogsPage')));
const ComplianceReportsPage = Loadable(lazy(() => import('pages/iga/ComplianceReportsPage')));
const AutomationPoliciesPage = Loadable(lazy(() => import('pages/iga/AutomationPoliciesPage')));

// ==============================|| ROUTING ||============================== //
const MainRoutes = {
  path: '/iga',
  element: (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      path: 'organization',
      element: <OrganizationPage />
    },
    {
      path: 'repositories',
      element: <RepositoriesPage />
    },
    {
      path: 'users',
      element: <UsersPage />
    },
    {
      path: 'roles',
      element: <RolesPage />
    },
    {
      path: 'permissions',
      element: <PermissionsPage />
    },
    {
      path: 'teams',
      element: <TeamsPage />
    },
    {
      path: 'policies',
      element: <PoliciesPage />
    },
    {
      path: 'auto-policies',
      element: <AutomationPoliciesPage />
    },
    {
      path: 'audit-logs',
      element: <AuditLogsPage />
    },
    {
      path: 'compliance-report',
      element: <ComplianceReportsPage />
    }
  ]
};

export default MainRoutes;
