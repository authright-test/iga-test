import { createBrowserRouter } from 'react-router-dom';

// project imports
import AuthRoutes from './AuthRoutes';
import IgaRoutes from './IgaRoutes';
import MainRoutes from './MainRoutes';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([...MainRoutes, ...AuthRoutes, IgaRoutes], { basename: import.meta.env.VITE_APP_BASE_NAME });

export default router;
