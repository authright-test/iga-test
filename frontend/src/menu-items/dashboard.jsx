// assets
import { AiOutlineDashboard } from 'react-icons/ai';

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: AiOutlineDashboard,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
