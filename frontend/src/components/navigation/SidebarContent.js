import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import {
  FiActivity,
  FiCpu,
  FiGitBranch,
  FiHome,
  FiList,
  FiServer,
  FiShield,
  FiUsers,
  FiLogOut,
  FiUser,
  FiSettings,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SidebarContent = ({ onClose, isCollapsed = false, onToggle }) => {
  const location = useLocation();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const LinkItems = [
    { name: 'Dashboard', icon: FiHome, path: '/' },
    { name: 'Users', icon: FiUsers, path: '/users' },
    { name: 'Teams', icon: FiUsers, path: '/teams' },
    { name: 'Roles', icon: FiShield, path: '/roles' },
    { name: 'Repositories', icon: FiGitBranch, path: '/repositories' },
    { name: 'Policies', icon: FiList, path: '/policies' },
    { name: 'Audit Logs', icon: FiActivity, path: '/audit-logs' },
    { name: 'Organization', icon: FiServer, path: '/organization' },
    { name: 'Settings', icon: FiCpu, path: '/settings' },
  ];

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: isCollapsed ? 2 : 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {!isCollapsed && (
          <Typography
            variant="h6"
            component="div"
            sx={{
              color: 'primary.main',
              fontWeight: 500,
            }}
          >
            GitHub Access Control
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={onToggle}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'rgba(33, 150, 243, 0.04)',
              },
            }}
          >
            {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </IconButton>
          <IconButton
            sx={{
              display: { xs: 'flex', md: 'none' },
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'rgba(33, 150, 243, 0.04)',
              },
            }}
            onClick={onClose}
          >
            <FiX />
          </IconButton>
        </Box>
      </Box>

      <List sx={{ flex: 1, overflow: 'auto', px: isCollapsed ? 1 : 2, py: 1 }}>
        {LinkItems.map((link) => (
          <ListItem key={link.name} disablePadding>
            <Tooltip
              title={isCollapsed ? link.name : ''}
              placement="right"
              arrow
            >
              <ListItemButton
                component={RouterLink}
                to={link.path}
                selected={location.pathname === link.path}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  minHeight: 44,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  px: isCollapsed ? 2.5 : 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(33, 150, 243, 0.04)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isCollapsed ? 'auto' : 3,
                    justifyContent: 'center',
                    color: location.pathname === link.path ? 'inherit' : 'text.secondary',
                  }}
                >
                  <link.icon size={20} />
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText
                    primary={link.name}
                    primaryTypographyProps={{
                      fontWeight: location.pathname === link.path ? 500 : 400,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Divider />

      <Box sx={{ p: isCollapsed ? 1 : 2 }}>
        <Tooltip
          title={isCollapsed ? `${user?.username}\n${user?.email}` : ''}
          placement="right"
          arrow
        >
          <Box
            onClick={handleMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              borderRadius: 1,
              cursor: 'pointer',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              '&:hover': {
                bgcolor: 'rgba(33, 150, 243, 0.04)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                mr: isCollapsed ? 0 : 2,
                bgcolor: 'primary.main',
              }}
              src={user?.avatar}
            >
              {user?.username?.[0] || user?.email?.[0]}
            </Avatar>
            {!isCollapsed && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  noWrap
                  sx={{ fontWeight: 500 }}
                >
                  {user?.username}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                >
                  {user?.email}
                </Typography>
              </Box>
            )}
          </Box>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              minWidth: 180,
              borderRadius: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            },
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <FiUser size={20} />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <FiSettings size={20} />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              handleMenuClose();
              logout();
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <FiLogOut size={20} />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default SidebarContent;
