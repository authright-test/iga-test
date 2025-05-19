// project imports
import Loadable from 'components/Loadable';
import { lazy } from 'react';
import DashboardLayout from '../layout/Dashboard';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';

// ==============================|| MAIN ROUTING ||============================== //
const DashboardPage = Loadable(lazy(() => import('pages/iga/DashboardPage')));

const MainRoutes = [{
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      )
    },
    {
      path: 'dashboard',
      element: (
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      )
    },
  ]
},
  {
    path: '*',
    element: <NotFoundPage />
  },
];

export default MainRoutes;
