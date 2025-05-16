import { Box, CloseButton, Flex, Heading, Icon, Link, Stack, } from '@chakra-ui/react';
import React from 'react';
import { FiActivity, FiCpu, FiGitBranch, FiHome, FiList, FiServer, FiShield, FiUsers, } from 'react-icons/fi';
import { Link as RouterLink, useLocation } from 'react-router-dom';

export const SidebarContent = ({ onClose, ...rest }) => {
  const location = useLocation();

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
      borderRight='1px'
      w={{ base: 'full', md: 60 }}
      pos='fixed'
      h='full'
      {...rest}
    >
      <Flex h='20' alignItems='center' mx='8' justifyContent='space-between'>
        <Heading size='md' fontFamily='monospace'>
          GitHub Access Control
        </Heading>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      <Stack direction='column' gap={1} align='stretch' px={4}>
        {LinkItems.map((link) => (
          <NavItem
            key={link.name}
            icon={link.icon}
            path={link.path}
            isActive={location.pathname === link.path}
          >
            {link.name}
          </NavItem>
        ))}
      </Stack>
    </Box>
  );
};

const NavItem = ({ icon, children, path, isActive, ...rest }) => {

  return (
    <Link
      as={RouterLink}
      to={path}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Flex
        align='center'
        p='4'
        mx='4'
        borderRadius='lg'
        role='group'
        cursor='pointer'
        {...rest}
      >
        {icon && (
          <Icon
            mr='4'
            fontSize='16'
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  );
};

export default SidebarContent;
