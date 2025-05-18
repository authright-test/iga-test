// assets
import {
  AiOutlineApartment,
  AiOutlineAudit,
  AiOutlineFork,
  AiOutlineGithub,
  AiOutlineTrademark,
  AiOutlineUser,
  AiOutlineUsergroupAdd
} from 'react-icons/ai';

// icons

// ==============================|| MENU ITEMS - EXTRA PAGES ||============================== //

const pages = {
  id: 'iga',
  title: 'IGA',
  type: 'group',
  children: [
    {
      id: 'organization',
      title: 'Organization',
      type: 'item',
      url: '/organization',
      icon: AiOutlineApartment,
      breadcrumbs: true
    },
    {
      id: 'repository',
      title: 'Repositories',
      type: 'item',
      url: '/repositories',
      icon: AiOutlineGithub,
      breadcrumbs: true
    },
    {
      id: 'users',
      title: 'Users',
      type: 'item',
      url: '/users',
      icon: AiOutlineUser,
      breadcrumbs: true
    },
    {
      id: 'roles',
      title: 'Roles',
      type: 'item',
      url: '/roles',
      icon: AiOutlineTrademark,
      breadcrumbs: true
    },
    {
      id: 'teams',
      title: 'Teams',
      type: 'item',
      url: '/teams',
      icon: AiOutlineUsergroupAdd,
      breadcrumbs: true
    },
    {
      id: 'policies',
      title: 'Policies',
      type: 'item',
      url: '/policies',
      icon: AiOutlineFork,
      breadcrumbs: true
    },
    {
      id: 'auditLogs',
      title: 'Audit Logs',
      type: 'item',
      url: '/audit-logs',
      icon: AiOutlineAudit,
      breadcrumbs: true
    },
  ]
};

export default pages;
