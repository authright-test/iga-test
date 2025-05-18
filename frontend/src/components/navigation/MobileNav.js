import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import React, { useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import SidebarContent from './SidebarContent';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          display: { xs: 'flex', md: 'none' },
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, color: 'text.primary' }}
          >
            <FiMenu />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              color: 'primary.main',
              fontWeight: 'bold',
            }}
          >
            GitHub Access Control
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={isOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        <SidebarContent onClose={handleDrawerToggle} />
      </Drawer>
    </>
  );
};

export default MobileNav;
