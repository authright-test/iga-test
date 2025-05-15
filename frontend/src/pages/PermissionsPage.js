import {
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
  Tab,
  Table,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
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
import { FiEdit2, FiGitBranch, FiMoreVertical, FiShield, FiTrash2, FiUsers } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useAccessPermissions } from '../hooks/useAccessPermissions';

const PermissionsPage = () => {
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'repository',
    level: 'read',
  });

  const {
    isOpen: isPermissionModalOpen,
    onOpen: onPermissionModalOpen,
    onClose: onPermissionModalClose
  } = useDisclosure();

  const {
    isOpen: isAssignModalOpen,
    onOpen: onAssignModalOpen,
    onClose: onAssignModalClose
  } = useDisclosure();

  const toast = useToast();
  const { logAuditEvent } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const {
    permissions,
    isLoading,
    error,
    createPermission,
    updatePermission,
    deletePermission,
    getPermissionUsers,
    getPermissionRoles,
    getPermissionGroups,
    getPermissionResources,
    getPermissionHistory,
  } = useAccessPermissions();

  const handleCreatePermission = async () => {
    try {
      if (!formData.name) {
        toast({
          title: 'Validation Error',
          description: 'Permission name is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const newPermission = await createPermission(formData);

      logAuditEvent(
        'permission_created',
        'permission',
        newPermission.id.toString(),
        { name: formData.name }
      );

      toast({
        title: 'Permission created',
        description: `Permission "${formData.name}" has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onPermissionModalClose();
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

  const handleUpdatePermission = async () => {
    try {
      if (!selectedPermission) return;

      const updatedPermission = await updatePermission(selectedPermission.id, formData);

      logAuditEvent(
        'permission_updated',
        'permission',
        selectedPermission.id.toString(),
        { name: formData.name }
      );

      toast({
        title: 'Permission updated',
        description: `Permission "${formData.name}" has been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onPermissionModalClose();
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

  const handleDeletePermission = async (permission) => {
    try {
      await deletePermission(permission.id);

      logAuditEvent(
        'permission_deleted',
        'permission',
        permission.id.toString(),
        { name: permission.name }
      );

      toast({
        title: 'Permission deleted',
        description: `Permission "${permission.name}" has been deleted.`,
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

  const handleAddTeam = async (permissionId, teamId) => {
    try {
      await addTeam(permissionId, teamId);

      logAuditEvent(
        'team_added',
        'permission',
        permissionId.toString(),
        { teamId }
      );

      toast({
        title: 'Team added',
        description: 'Team has been added to the permission.',
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

  const handleRemoveTeam = async (permissionId, teamId) => {
    try {
      await removeTeam(permissionId, teamId);

      logAuditEvent(
        'team_removed',
        'permission',
        permissionId.toString(),
        { teamId }
      );

      toast({
        title: 'Team removed',
        description: 'Team has been removed from the permission.',
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

  const openPermissionModal = (permission = null) => {
    if (permission) {
      setSelectedPermission(permission);
      setFormData({
        name: permission.name,
        description: permission.description,
        type: permission.type,
        level: permission.level,
      });
    } else {
      setSelectedPermission(null);
      setFormData({
        name: '',
        description: '',
        type: 'repository',
        level: 'read',
      });
    }
    onPermissionModalOpen();
  };

  const openAssignModal = async (permission) => {
    try {
      const teams = await getPermissionTeams(permission.id);
      const users = await getPermissionUsers(permission.id);
      const repositories = await getPermissionRepositories(permission.id);

      setSelectedPermission(permission);
      setFormData(prev => ({
        ...prev,
        teams,
        users,
        repositories,
      }));
      onAssignModalOpen();
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
        <Heading size="lg" mb={4}>Loading permissions...</Heading>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Heading size="lg" mb={4}>Error loading permissions</Heading>
        <Box color="red.500">{error}</Box>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="lg">Permissions</Heading>
        <Button colorScheme="blue" onClick={() => openPermissionModal()}>
          Create Permission
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
              <Th>Permission</Th>
              <Th>Type</Th>
              <Th>Level</Th>
              <Th>Teams</Th>
              <Th>Users</Th>
              <Th>Repositories</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {permissions.map((permission) => (
              <Tr key={permission.id}>
                <Td>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">{permission.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {permission.description}
                    </Text>
                  </VStack>
                </Td>
                <Td>
                  <Badge colorScheme="purple">{permission.type}</Badge>
                </Td>
                <Td>
                  <Badge colorScheme="blue">{permission.level}</Badge>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    {permission.teams?.map((team) => (
                      <Badge key={team.id} colorScheme="purple">
                        {team.name}
                      </Badge>
                    ))}
                  </HStack>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    {permission.users?.map((user) => (
                      <Badge key={user.id} colorScheme="green">
                        {user.username}
                      </Badge>
                    ))}
                  </HStack>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    {permission.repositories?.map((repo) => (
                      <Badge key={repo.id} colorScheme="orange">
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
                        onClick={() => openPermissionModal(permission)}
                      >
                        Edit Permission
                      </MenuItem>
                      <MenuItem
                        icon={<FiShield />}
                        onClick={() => openAssignModal(permission)}
                      >
                        Manage Assignments
                      </MenuItem>
                      <MenuItem
                        icon={<FiUsers />}
                        onClick={() => handleAddTeam(permission.id)}
                      >
                        Add Team
                      </MenuItem>
                      <MenuItem
                        icon={<FiGitBranch />}
                        onClick={() => handleRemoveTeam(permission.id)}
                      >
                        Remove Team
                      </MenuItem>
                      <MenuItem
                        icon={<FiTrash2 />}
                        onClick={() => handleDeletePermission(permission)}
                        color="red.500"
                      >
                        Delete Permission
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Permission Modal */}
      <Modal isOpen={isPermissionModalOpen} onClose={onPermissionModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedPermission ? 'Edit Permission' : 'Create Permission'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4}>
              <FormLabel>Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter permission name"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter permission description"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Type</FormLabel>
              <Select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="repository">Repository</option>
                <option value="team">Team</option>
                <option value="user">User</option>
              </Select>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Level</FormLabel>
              <Select
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
              >
                <option value="read">Read</option>
                <option value="write">Write</option>
                <option value="admin">Admin</option>
              </Select>
            </FormControl>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={selectedPermission ? handleUpdatePermission : handleCreatePermission}
            >
              {selectedPermission ? 'Update' : 'Create'}
            </Button>
            <Button onClick={onPermissionModalClose}>Cancel</Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={onAssignModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Permission Assignments</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Tabs>
              <TabList>
                <Tab>Teams</Tab>
                <Tab>Users</Tab>
                <Tab>Repositories</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  {/* Teams management UI */}
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={() => handleUpdatePermission(selectedPermission.id, formData)}
                  >
                    Update Teams
                  </Button>
                </TabPanel>
                <TabPanel>
                  {/* Users management UI */}
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={() => handleUpdatePermission(selectedPermission.id, formData)}
                  >
                    Update Users
                  </Button>
                </TabPanel>
                <TabPanel>
                  {/* Repositories management UI */}
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={() => handleUpdatePermission(selectedPermission.id, formData)}
                  >
                    Update Repositories
                  </Button>
                </TabPanel>
              </TabPanels>
            </Tabs>
            <Button onClick={onAssignModalClose}>Cancel</Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PermissionsPage;
