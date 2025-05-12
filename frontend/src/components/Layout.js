import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Icon,
  Text,
  HStack,
  VStack,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
  IconButton,
  CloseButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  Heading,
  Link,
} from '@chakra-ui/react';
import {
  FiMenu,
  FiHome,
  FiUsers,
  FiShield,
  FiList,
  FiActivity,
  FiServer,
  FiCpu,
  FiGitBranch,
  FiLogOut,
  FiUser,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const SidebarContent = ({ onClose, ...rest }) => {
  const location = useLocation();
  const bg = useColorModeValue('white', 'gray.900');
  const activeItemBg = useColorModeValue('brand.50', 'brand.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Navigation items
  const NAV_ITEMS = [
    { name: 'Dashboard', icon: FiHome, path: '/' },
    { name: 'Organization', icon: FiServer, path: '/organization' },
    { name: 'Users', icon: FiUsers, path: '/users' },
    { name: 'Teams', icon: FiCpu, path: '/teams' },
    { name: 'Repositories', icon: FiGitBranch, path: '/repositories' },
    { name: 'Roles', icon: FiShield, path: '/roles' },
    { name: 'Policies', icon: FiList, path: '/policies' },
    { name: 'Audit Logs', icon: FiActivity, path: '/audit-logs' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Box
      bg={bg}
      borderRight="1px"
      borderRightColor={borderColor}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Heading as="h1" fontSize="xl" fontWeight="bold">
          GitHub Access
        </Heading>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      <VStack spacing="1" align="stretch" mt="4">
        {NAV_ITEMS.map((item) => (
          <Link
            as={RouterLink}
            to={item.path}
            key={item.name}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
          >
            <Flex
              align="center"
              p="4"
              mx="4"
              borderRadius="lg"
              role="group"
              cursor="pointer"
              bg={isActive(item.path) ? activeItemBg : 'transparent'}
              color={isActive(item.path) ? 'brand.600' : ''}
              fontWeight={isActive(item.path) ? 'semibold' : 'normal'}
              _hover={{
                bg: activeItemBg,
                color: 'brand.600',
              }}
              onClick={onClose}
            >
              <Icon
                mr="4"
                fontSize="16"
                as={item.icon}
              />
              {item.name}
            </Flex>
          </Link>
        ))}
      </VStack>
    </Box>
  );
};

const MobileNav = ({ onOpen, ...rest }) => {
  const { user, logout } = useAuth();
  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={bg}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Heading display={{ base: 'flex', md: 'none' }} fontSize="xl">
        GitHub Access
      </Heading>

      <HStack spacing={{ base: '0', md: '6' }}>
        <Flex alignItems={'center'}>
          <Menu>
            <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
              <HStack>
                <Avatar size={'sm'} src={user?.avatarUrl} />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm">{user?.username}</Text>
                  <Text fontSize="xs" color="gray.600">
                    {user?.email || 'GitHub User'}
                  </Text>
                </VStack>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiUser />}>Profile</MenuItem>
              <MenuDivider />
              <MenuItem icon={<FiLogOut />} onClick={logout}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};

const Layout = ({ children, drawerDisclosure }) => {
  const { isOpen, onOpen, onClose } = drawerDisclosure || useDisclosure();

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.800')}>
      <SidebarContent onClose={onClose} display={{ base: 'none', md: 'block' }} />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
};

export default Layout;