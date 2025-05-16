import {
  Alert,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
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
  Progress,
  Table,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FiEdit2, FiMoreVertical, FiTrash2, FiUserMinus, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useRoles } from '../hooks/useRoles';

const RolesPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
  });

  const {
    isOpen: isRoleModalOpen,
    onOpen: onRoleModalOpen,
    onClose: onRoleModalClose
  } = useDisclosure();

  const {
    isOpen: isPermissionsModalOpen,
    onOpen: onPermissionsModalOpen,
    onClose: onPermissionsModalClose
  } = useDisclosure();

  const toast = useToast();
  const { logAuditEvent } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const {
    roles,
    isLoading,
    error,
    createRole,
    updateRole,
    deleteRole,
    assignRole,
    revokeRole,
    getRolePermissions,
    updateRolePermissions,
  } = useRoles();

  const handleCreateRole = async () => {
    try {
      if (!formData.name) {
        toast({
          title: 'Validation Error',
          description: 'Role name is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const newRole = await createRole(formData);

      logAuditEvent(
        'role_created',
        'role',
        newRole.id.toString(),
        { name: formData.name }
      );

      toast({
        title: 'Role created',
        description: `Role "${formData.name}" has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onRoleModalClose();
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

  const handleUpdateRole = async () => {
    try {
      if (!selectedRole) return;

      const updatedRole = await updateRole(selectedRole.id, formData);

      logAuditEvent(
        'role_updated',
        'role',
        selectedRole.id.toString(),
        { name: formData.name }
      );

      toast({
        title: 'Role updated',
        description: `Role "${formData.name}" has been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onRoleModalClose();
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

  const handleDeleteRole = async (role) => {
    try {
      await deleteRole(role.id);

      logAuditEvent(
        'role_deleted',
        'role',
        role.id.toString(),
        { name: role.name }
      );

      toast({
        title: 'Role deleted',
        description: `Role "${role.name}" has been deleted.`,
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

  const handleAssignRole = async (roleId, userId) => {
    try {
      await assignRole(roleId, userId);

      logAuditEvent(
        'role_assigned',
        'role',
        roleId.toString(),
        { userId }
      );

      toast({
        title: 'Role assigned',
        description: 'Role has been assigned to user.',
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

  const handleRevokeRole = async (roleId, userId) => {
    try {
      await revokeRole(roleId, userId);

      logAuditEvent(
        'role_revoked',
        'role',
        roleId.toString(),
        { userId }
      );

      toast({
        title: 'Role revoked',
        description: 'Role has been revoked from user.',
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

  const handleUpdatePermissions = async (roleId, permissions) => {
    try {
      await updateRolePermissions(roleId, permissions);

      logAuditEvent(
        'role_permissions_updated',
        'role',
        roleId.toString(),
        { permissions }
      );

      toast({
        title: 'Permissions updated',
        description: 'Role permissions have been updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onPermissionsModalClose();
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

  const openRoleModal = (role = null) => {
    if (role) {
      setSelectedRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      });
    } else {
      setSelectedRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: [],
      });
    }
    onRoleModalOpen();
  };

  const openPermissionsModal = async (role) => {
    try {
      const permissions = await getRolePermissions(role.id);
      setSelectedRole(role);
      setFormData(prev => ({
        ...prev,
        permissions,
      }));
      onPermissionsModalOpen();
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

  return (
    <Box p={4}>
      <Flex justify='space-between' align='center' mb={4}>
        <Heading size='lg'>Roles</Heading>
        <Button colorScheme='blue' onClick={() => openRoleModal()}>
          Create Role
        </Button>
      </Flex>

      <Box
        bg={bgColor}
        shadow='sm'
        rounded='lg'
        borderWidth='1px'
        borderColor={borderColor}
        overflow='hidden'
      >
        {isLoading && <Progress isIndeterminate colorScheme='blue' size='xs' />}
        {error && (<Alert.Root status='error'>
          <Alert.Indicator />
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>)}
        <Table variant='simple' interactive minHeight='calc(100vh - 280px)'>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Users</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {roles.map((role) => (
              <Tr key={role.id}>
                <Td>{role.name}</Td>
                <Td>{role.description}</Td>
                <Td>
                  <Badge colorScheme='blue'>{role.userCount || 0} users</Badge>
                </Td>
                <Td>{new Date(role.createdAt).toLocaleDateString()}</Td>
                <Td>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      variant='ghost'
                      size='sm'
                    />
                    <MenuList>
                      <MenuItem
                        icon={<FiEdit2 />}
                        onClick={() => openRoleModal(role)}
                      >
                        Edit Role
                      </MenuItem>
                      <MenuItem
                        icon={<FiUserPlus />}
                        onClick={() => handleAssignRole(role.id)}
                      >
                        Assign Users
                      </MenuItem>
                      <MenuItem
                        icon={<FiUserMinus />}
                        onClick={() => handleRevokeRole(role.id)}
                      >
                        Revoke Users
                      </MenuItem>
                      <MenuItem
                        icon={<FiTrash2 />}
                        onClick={() => handleDeleteRole(role)}
                        color='red.500'
                      >
                        Delete Role
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Role Modal */}
      <Modal isOpen={isRoleModalOpen} onClose={onRoleModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedRole ? 'Edit Role' : 'Create Role'}
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
                placeholder='Enter role name'
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='Enter role description'
              />
            </FormControl>
            <Button
              colorScheme='blue'
              mr={3}
              onClick={selectedRole ? handleUpdateRole : handleCreateRole}
            >
              {selectedRole ? 'Update' : 'Create'}
            </Button>
            <Button onClick={onRoleModalClose}>Cancel</Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Permissions Modal */}
      <Modal isOpen={isPermissionsModalOpen} onClose={onPermissionsModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Permissions</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {/* Add your permissions management UI here */}
            <Button
              colorScheme='blue'
              mr={3}
              onClick={() => handleUpdatePermissions(selectedRole.id, formData.permissions)}
            >
              Update Permissions
            </Button>
            <Button onClick={onPermissionsModalClose}>Cancel</Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default RolesPage;
