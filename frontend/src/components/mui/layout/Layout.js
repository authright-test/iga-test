import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import React, { useState } from 'react';
import MobileNav from '../../navigation/MobileNav';
import SidebarContent from '../../navigation/SidebarContent';

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
      }}
    >
      {isMobile ? (
        <MobileNav />
      ) : (
        <Box
          component="nav"
          sx={{
            width: isCollapsed ? 80 : 260,
            flexShrink: 0,
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            zIndex: theme.zIndex.drawer,
            transition: theme.transitions.create(['width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            borderRight: '1px solid',
            borderColor: 'divider',
          }}
        >
          <SidebarContent isCollapsed={isCollapsed} onToggle={toggleSidebar} />
        </Box>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: isMobile ? 0 : isCollapsed ? '80px' : '260px',
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: 2,
            px: { xs: 2, sm: 3 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 