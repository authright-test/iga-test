import { Box, Container, IconButton } from '@mui/material';
import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MobileNav from '../navigation/MobileNav';
import SidebarContent from '../navigation/SidebarContent';

const Layout = ({ children }) => {
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
      {/* Mobile Navigation */}
      <MobileNav />

      {/* Sidebar */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: isCollapsed ? 80 : 280,
          zIndex: 1200,
          transition: 'width 0.2s ease-in-out',
        }}
      >
        <SidebarContent isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      </Box>

      {/* Main Content */}
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: isCollapsed ? '80px' : '280px' },
          pt: { xs: '80px', md: 0 },
          minHeight: '100vh',
          bgcolor: 'background.default',
          transition: 'margin-left 0.2s ease-in-out',
        }}
      >
        <Container
          maxWidth='xl'
          sx={{
            py: 3,
            px: { xs: 2, sm: 3 },
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
