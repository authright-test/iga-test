import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FiEdit2, FiMoreVertical, FiShield, FiTrash2, FiUserMinus, FiUserPlus, FiUsers } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../hooks/useUsers';

const UsersPage = () => {
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

  const toast = useToast();
  const { logAuditEvent } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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

  const handleCreateUser = async () => {
    try {
      if (!formData.username || !formData.email) {
        toast({
          title: 'Validation Error',
          description: 'Username and email are required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const newUser = await createUser(formData);

      logAuditEvent(
        'user_created',
        'user',
        newUser.id.toString(),
        { username: formData.username }
      );

      toast({
        title: 'User created',
        description: `User "${formData.username}" has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onUserModalClose();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (!selectedUser) return;

      const updatedUser = await updateUser(selectedUser.id, formData);

      logAuditEvent(
        'user_updated',
        'user',
        selectedUser.id.toString(),
        { username: formData.username }
      );

      toast({
        title: 'User updated',
        description: `User "${formData.username}" has been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onUserModalClose();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      await deleteUser(user.id);

      logAuditEvent(
        'user_deleted',
        'user',
        user.id.toString(),
        { username: user.username }
      );

      toast({
        title: 'User deleted',
        description: `User "${user.username}" has been deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddTeam = async (userId, teamId) => {
    try {
      await addTeam(userId, teamId);

      logAuditEvent(
        'team_added',
        'user',
        userId.toString(),
        { teamId }
      );

      toast({
        title: 'Team added',
        description: 'Team has been added to the user.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRemoveTeam = async (userId, teamId) => {
    try {
      await removeTeam(userId, teamId);

      logAuditEvent(
        'team_removed',
        'user',
        userId.toString(),
        { teamId }
      );

      toast({
        title: 'Team removed',
        description: 'Team has been removed from the user.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

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
      toast({
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
        <Heading size="lg" mb={4}>Loading users...</Heading>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Heading size="lg" mb={4}>Error loading users</Heading>
        <Box color="red.500">{error}</Box>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="lg">Users</Heading>
        <Button colorScheme="blue" onClick={() => openUserModal()}>
          Create User
        </Button>
      </Flex>

      <Box
        bg={bgColor}
        shadow="sm"
        rounded="lg"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Teams</Th>
              <Th>Repositories</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user.id}>
                <Td>
                  <HStack spacing={3}>
                    <Avatar size="sm" name={user.username} src={user.avatar} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">{user.username}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {user.email}
                      </Text>
                    </VStack>
                  </HStack>
                </Td>
                <Td>
                  <Badge colorScheme={user.role === 'admin' ? 'red' : 'blue'}>
                    {user.role}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    {user.teams?.map((team) => (
                      <Badge key={team.id} colorScheme="purple">
                        {team.name}
                      </Badge>
                    ))}
                  </HStack>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    {user.repositories?.map((repo) => (
                      <Badge key={repo.id} colorScheme="green">
                        {repo.name}
                      </Badge>
                    ))}
                  </HStack>
                </Td>
                <Td>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      size="sm"
                    />
                    <MenuList>
                      <MenuItem
                        icon={<FiEdit2 />}
                        onClick={() => openUserModal(user)}
                      >
                        Edit User
                      </MenuItem>
                      <MenuItem
                        icon={<FiUsers />}
                        onClick={() => openTeamsModal(user)}
                      >
                        Manage Teams
                      </MenuItem>
                      <MenuItem
                        icon={<FiUserPlus />}
                        onClick={() => handleAddTeam(user.id)}
                      >
                        Add Team
                      </MenuItem>
                      <MenuItem
                        icon={<FiUserMinus />}
                        onClick={() => handleRemoveTeam(user.id)}
                      >
                        Remove Team
                      </MenuItem>
                      <MenuItem
                        icon={<FiShield />}
                        onClick={() => getUserPermissions(user.id)}
                      >
                        View Permissions
                      </MenuItem>
                      <MenuItem
                        icon={<FiTrash2 />}
                        onClick={() => handleDeleteUser(user)}
                        color="red.500"
                      >
                        Delete User
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* User Modal */}
      <Modal isOpen={isUserModalOpen} onClose={onUserModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedUser ? 'Edit User' : 'Create User'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4}>
              <FormLabel>Username</FormLabel>
              <Input
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Enter username"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Email</FormLabel>
              <Input
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email"
                type="email"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Role</FormLabel>
              <Select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Select>
            </FormControl>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={selectedUser ? handleUpdateUser : handleCreateUser}
            >
              {selectedUser ? 'Update' : 'Create'}
            </Button>
            <Button onClick={onUserModalClose}>Cancel</Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Teams Modal */}
      <Modal isOpen={isTeamsModalOpen} onClose={onTeamsModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage User Teams</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {/* Add your teams management UI here */}
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => handleUpdateUser(selectedUser.id, formData)}
            >
              Update Teams
            </Button>
            <Button onClick={onTeamsModalClose}>Cancel</Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UsersPage;
