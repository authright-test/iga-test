import { toaster } from '@/components/ui/toaster';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Menu,
  MenuItem,
  MenuItemGroup,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';
import { FiEdit2, FiMoreVertical, FiShield, FiTrash2, FiUserPlus, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/common/DataTable';
import { UserForm } from '../components/users/UserForm';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useUsers } from '../hooks/useUsers';

const UsersPage = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
  });

  const {
    isOpen: isUserModalOpen,
    onOpen: onUserModalOpen,
    onClose: onUserModalClose
  } = useDisclosure();

  const {
    isOpen: isTeamsModalOpen,
    onOpen: onTeamsModalOpen,
    onClose: onTeamsModalClose
  } = useDisclosure();

  const { logAuditEvent } = useAuth();
  const { hasPermission } = usePermissions();

  const {
    users,
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    getUserTeams,
    addTeam,
    removeTeam,
    getUserRepositories,
    addRepository,
    removeRepository,
    getUserPermissions,
    updateUserPermissions,
  } = useUsers();

  const handleCreateUser = useCallback(async (userData) => {
    try {
      await createUser(userData);
      toaster.create({
        title: 'User created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onUserModalClose();
    } catch (error) {
      toaster.create({
        title: 'Error creating user',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [createUser, toast, onUserModalClose]);

  const handleUpdateUser = useCallback(async (userData) => {
    try {
      await updateUser(userData);
      toaster.create({
        title: 'User updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onUserModalClose();
    } catch (error) {
      toaster.create({
        title: 'Error updating user',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [updateUser, toast, onUserModalClose]);

  const handleDeleteUser = useCallback(async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        toaster.create({
          title: 'User deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toaster.create({
          title: 'Error deleting user',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  }, [deleteUser, toast]);

  const handleEditUser = useCallback((user) => {
    setSelectedUser(user);
    onUserModalOpen();
  }, [onUserModalOpen]);

  const handleFormClose = useCallback(() => {
    setSelectedUser(null);
    onUserModalClose();
  }, [onUserModalClose]);

  const columns = [
    {
      header: 'User',
      accessor: 'username',
      cell: (row) => (
        <Stack gap={3}>
          <Avatar size='sm' name={row.username} />
          <Box>
            <Text fontWeight='medium'>{row.username}</Text>
            <Text fontSize='sm'>
              {row.email}
            </Text>
          </Box>
        </Stack>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      cell: (row) => (
        <Badge colorScheme={row.role === 'admin' ? 'purple' : 'blue'}>
          {row.role}
        </Badge>
      ),
    },
    {
      header: 'Teams',
      accessor: 'teams',
      cell: (row) => (
        <Stack gap={2}>
          {row.teams?.map((team) => (
            <Badge key={team.id} colorScheme='green'>
              {team.name}
            </Badge>
          ))}
        </Stack>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <Stack gap={2}>
          {hasPermission('users.edit') && (
            <IconButton
              aria-label='Edit user'
              icon={<FiEdit2 />}
              size='sm'
              onClick={(e) => {
                e.stopPropagation();
                handleEditUser(row);
              }}
            />
          )}
          <Menu>
            <MenuItem
              as={IconButton}
              aria-label='More options'
              icon={<FiMoreVertical />}
              size='sm'
            />
            <MenuItemGroup>
              <MenuItem icon={<FiShield />} onClick={() => openPermissionsModal(row)}>
                Manage Permissions
              </MenuItem>
              <MenuItem icon={<FiUsers />} onClick={() => openTeamsModal(row)}>
                Manage Teams
              </MenuItem>
              {hasPermission('users.delete') && (
                <MenuItem icon={<FiTrash2 />} color='red.500' onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteUser(row.id);
                }}>
                  Delete User
                </MenuItem>
              )}
            </MenuItemGroup>
          </Menu>
        </Stack>
      ),
    },
  ];

  const openUserModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: '',
        email: '',
        role: 'user',
      });
    }
    onUserModalOpen();
  };

  const openTeamsModal = async (user) => {
    try {
      const teams = await getUserTeams(user.id);
      setSelectedUser(user);
      setFormData(prev => ({
        ...prev,
        teams,
      }));
      onTeamsModalOpen();
    } catch (err) {
      toaster.create({
        title: 'Error',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Box p={4}>
        <Heading size='lg' mb={4}>Loading users...</Heading>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Heading size='lg' mb={4}>Error loading users</Heading>
        <Box color='red.500'>{error}</Box>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex justify='space-between' align='center' mb={6}>
        <Heading size='lg'>Users</Heading>
        {hasPermission('users.create') && (
          <Button
            leftIcon={<FiUserPlus />}
            colorScheme='blue'
            onClick={() => openUserModal()}
          >
            Add User
          </Button>
        )}
      </Flex>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        onRowClick={(user) => navigate(`/users/${user.id}`)}
      />

      <UserForm
        open={isUserModalOpen}
        onClose={handleFormClose}
        onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
        initialData={selectedUser}
      />

      {/* Teams Modal */}
      <Dialog.Root open={isTeamsModalOpen} onClose={onTeamsModalClose}>
        <Dialog.Backdrop />
        <Dialog.Content>
          <Dialog.Header>Manage User Teams</Dialog.Header>
          <Dialog.CloseTrigger />
          <Dialog.Body pb={6}>
            {/* Add your teams management UI here */}
            <Button
              colorScheme='blue'
              mr={3}
              onClick={() => handleUpdateUser(selectedUser.id, formData)}
            >
              Update Teams
            </Button>
            <Button onClick={onTeamsModalClose}>Cancel</Button>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
};

export default UsersPage;
