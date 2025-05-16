import { Box } from '@chakra-ui/react';
import React from 'react';
import MobileNav from './navigation/MobileNav';
import SidebarContent from './navigation/SidebarContent';

const Layout = ({ children }) => {

  return (
    <Box minH='100vh'>
      <SidebarContent
        onClose={() => {
        }}
        display={{ base: 'none', md: 'block' }}
      />
      <Box ml={{ base: 0, md: 60 }} p='4'>
        <MobileNav />
        <Box p='4'>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
