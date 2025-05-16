import { toaster } from '@/components/ui/toaster';
import {
  Badge,
  Box,
  Button,
  Dialog,
  Field,
  Flex,
  Heading,
  IconButton,
  Input,
  Menu,
  MenuItem,
  MenuItemGroup,
  Stack,
  Table,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FiEdit2, FiMoreVertical, FiTrash2, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
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

  const { logAuditEvent } = useAuth();
  const { hasPermission } = usePermissions();

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
      const newRole = await createRole(formData);
      logAuditEvent(
        'role_created',
        'role',
        newRole.id.toString(),
        { name: formData.name }
      );
      toaster.create({
        title: 'Role created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onRoleModalClose();
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
      toaster.create({
        title: 'Role updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onRoleModalClose();
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

  const handleDeleteRole = async (role) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(role.id);
        logAuditEvent(
          'role_deleted',
          'role',
          role.id.toString(),
          { name: role.name }
        );
        toaster.create({
          title: 'Role deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (err) {
        toaster.create({
          title: 'Error',
          description: err.response?.data?.error || err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
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

      toaster.create({
        title: 'Role assigned',
        description: 'Role has been assigned to user.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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

  const handleRevokeRole = async (roleId, userId) => {
    try {
      await revokeRole(roleId, userId);

      logAuditEvent(
        'role_revoked',
        'role',
        roleId.toString(),
        { userId }
      );

      toaster.create({
        title: 'Role revoked',
        description: 'Role has been revoked from user.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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

  const handleUpdatePermissions = async (roleId, permissions) => {
    try {
      await updateRolePermissions(roleId, permissions);

      logAuditEvent(
        'role_permissions_updated',
        'role',
        roleId.toString(),
        { permissions }
      );

      toaster.create({
        title: 'Permissions updated',
        description: 'Role permissions have been updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onPermissionsModalClose();
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

  const openRoleModal = (role = null) => {
    if (role) {
      setSelectedRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions || [],
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
      toaster.create({
        title: 'Error',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) {
    return (
      <Box p={4}>
        <Heading size='lg' mb={4}>Loading roles...</Heading>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Heading size='lg' mb={4}>Error loading roles</Heading>
        <Box color='red.500'>{error}</Box>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex justify='space-between' align='center' mb={6}>
        <Heading size='lg'>Roles</Heading>
        {hasPermission('roles.create') && (
          <Button
            leftIcon={<FiUserPlus />}
            colorScheme='blue'
            onClick={() => openRoleModal()}
          >
            Create Role
          </Button>
        )}
      </Flex>

      <Box

        borderWidth='1px'

        borderRadius='md'
        overflowX='auto'
      >
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Cell>Name</Table.Cell>
              <Table.Cell>Description</Table.Cell>
              <Table.Cell>Permissions</Table.Cell>
              <Table.Cell>Actions</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {roles.map((role) => (
              <Table.Row key={role.id}>
                <Table.Cell>
                  <Text fontWeight='medium'>{role.name}</Text>
                </Table.Cell>
                <Table.Cell>{role.description}</Table.Cell>
                <Table.Cell>
                  <Flex wrap='wrap' gap={2}>
                    {role.permissions?.map((permission) => (
                      <Badge key={permission.id} colorScheme='purple'>
                        {permission.name}
                      </Badge>
                    ))}
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Stack gap={2}>
                    {hasPermission('roles.edit') && (
                      <IconButton
                        aria-label='Edit role'
                        icon={<FiEdit2 />}
                        size='sm'
                        onClick={() => openRoleModal(role)}
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
                        <MenuItem
                          icon={<FiShield />}
                          onClick={() => openPermissionsModal(role)}
                        >
                          Manage Permissions
                        </MenuItem>
                        {hasPermission('roles.delete') && (
                          <MenuItem
                            icon={<FiTrash2 />}
                            color='red.500'
                            onClick={() => handleDeleteRole(role)}
                          >
                            Delete Role
                          </MenuItem>
                        )}
                      </MenuItemGroup>
                    </Menu>
                  </Stack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Role Modal */}
      <Dialog.Root open={isRoleModalOpen} onClose={onRoleModalClose}>
        <Dialog.Backdrop />
        <Dialog.Content>
          <Dialog.Header>
            {selectedRole ? 'Edit Role' : 'Create Role'}
          </Dialog.Header>
          <Dialog.CloseTrigger />
          <Dialog.Body pb={6}>
            <Field.Root mb={4}>
              <Field.Label>Role Name</Field.Label>
              <Input
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                placeholder='Enter role name'
              />
            </Field.Root>
            <Field.Root mb={4}>
              <Field.Label>Description</Field.Label>
              <Textarea
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                placeholder='Enter role description'
              />
            </Field.Root>
            <Button
              colorScheme='blue'
              mr={3}
              onClick={selectedRole ? handleUpdateRole : handleCreateRole}
            >
              {selectedRole ? 'Update' : 'Create'}
            </Button>
            <Button onClick={onRoleModalClose}>Cancel</Button>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>

      {/* Permissions Modal */}
      <Dialog.Root open={isPermissionsModalOpen} onClose={onPermissionsModalClose}>
        <Dialog.Backdrop />
        <Dialog.Content>
          <Dialog.Header>Manage Permissions</Dialog.Header>
          <Dialog.CloseTrigger />
          <Dialog.Body pb={6}>
            {/* Add your permissions management UI here */}
            <Button
              colorScheme='blue'
              mr={3}
              onClick={() => handleUpdatePermissions(selectedRole.id, formData.permissions)}
            >
              Update Permissions
            </Button>
            <Button onClick={onPermissionsModalClose}>Cancel</Button>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
};

export default RolesPage;
