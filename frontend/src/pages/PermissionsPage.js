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
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FiEdit2, FiMoreVertical, FiShield, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useAccessPermissions } from '../hooks/useAccessPermissions';
import { usePermissions } from '../hooks/usePermissions';

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

  const { logAuditEvent } = useAuth();
  const { hasPermission } = usePermissions();

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
      const newPermission = await createPermission(formData);
      logAuditEvent(
        'permission_created',
        'permission',
        newPermission.id.toString(),
        { name: formData.name }
      );
      toaster.create({
        title: 'Permission created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onPermissionModalClose();
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
      toaster.create({
        title: 'Permission updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onPermissionModalClose();
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

  const handleDeletePermission = async (permission) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      try {
        await deletePermission(permission.id);
        logAuditEvent(
          'permission_deleted',
          'permission',
          permission.id.toString(),
          { name: permission.name }
        );
        toaster.create({
          title: 'Permission deleted',
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
        <Heading size='lg' mb={4}>Loading permissions...</Heading>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Heading size='lg' mb={4}>Error loading permissions</Heading>
        <Box color='red.500'>{error}</Box>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex justify='space-between' align='center' mb={6}>
        <Heading size='lg'>Permissions</Heading>
        {hasPermission('permissions.create') && (
          <Button
            leftIcon={<FiShield />}
            colorScheme='blue'
            onClick={() => openPermissionModal()}
          >
            Create Permission
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
              <Table.Cell>Permission</Table.Cell>
              <Table.Cell>Type</Table.Cell>
              <Table.Cell>Level</Table.Cell>
              <Table.Cell>Teams</Table.Cell>
              <Table.Cell>Users</Table.Cell>
              <Table.Cell>Repositories</Table.Cell>
              <Table.Cell>Actions</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {permissions.map((permission) => (
              <Table.Row key={permission.id}>
                <Table.Cell>
                  <Stack direction="column" align='start' spacing={0}>
                    <Text fontWeight='medium'>{permission.name}</Text>
                    <Text fontSize='sm' color='gray.500'>
                      {permission.description}
                    </Text>
                  </Stack>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorScheme='purple'>{permission.type}</Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorScheme='blue'>{permission.level}</Badge>
                </Table.Cell>
                <Table.Cell>
                  <Stack gap={1}>
                    {permission.teams?.map((team) => (
                      <Badge key={team.id} colorScheme='purple'>
                        {team.name}
                      </Badge>
                    ))}
                  </Stack>
                </Table.Cell>
                <Table.Cell>
                  <Stack gap={1}>
                    {permission.users?.map((user) => (
                      <Badge key={user.id} colorScheme='green'>
                        {user.username}
                      </Badge>
                    ))}
                  </Stack>
                </Table.Cell>
                <Table.Cell>
                  <Stack gap={1}>
                    {permission.repositories?.map((repo) => (
                      <Badge key={repo.id} colorScheme='orange'>
                        {repo.name}
                      </Badge>
                    ))}
                  </Stack>
                </Table.Cell>
                <Table.Cell>
                  <Stack gap={2}>
                    {hasPermission('permissions.edit') && (
                      <IconButton
                        aria-label='Edit permission'
                        icon={<FiEdit2 />}
                        size='sm'
                        onClick={() => openPermissionModal(permission)}
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
                          onClick={() => openAssignModal(permission)}
                        >
                          Manage Assignments
                        </MenuItem>
                        {hasPermission('permissions.delete') && (
                          <MenuItem
                            icon={<FiTrash2 />}
                            color='red.500'
                            onClick={() => handleDeletePermission(permission)}
                          >
                            Delete Permission
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

      {/* Permission Modal */}
      <Dialog.Root open={isPermissionModalOpen} onClose={onPermissionModalClose}>
        <Dialog.Backdrop />
        <Dialog.Content>
          <Dialog.Header>
            {selectedPermission ? 'Edit Permission' : 'Create Permission'}
          </Dialog.Header>
          <Dialog.CloseTrigger />
          <Dialog.Body pb={6}>
            <Field.Root mb={4}>
              <Field.Label>Permission Name</Field.Label>
              <Input
                name='name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder='Enter permission name'
              />
            </Field.Root>
            <Field.Root mb={4}>
              <Field.Label>Description</Field.Label>
              <Textarea
                name='description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='Enter permission description'
              />
            </Field.Root>
            <Field.Root mb={4}>
              <Field.Label>Resource Type</Field.Label>
              <Select
                name='resourceType'
                value={formData.resourceType}
                onChange={(e) =>
                  setFormData({ ...formData, resourceType: e.target.value })
                }
              >
                <option value='repository'>Repository</option>
                <option value='organization'>Organization</option>
                <option value='team'>Team</option>
              </Select>
            </Field.Root>
            <Field.Root mb={4}>
              <Field.Label>Action</Field.Label>
              <Select
                name='action'
                value={formData.action}
                onChange={(e) =>
                  setFormData({ ...formData, action: e.target.value })
                }
              >
                <option value='read'>Read</option>
                <option value='write'>Write</option>
                <option value='admin'>Admin</option>
              </Select>
            </Field.Root>
            <Button
              colorScheme='blue'
              mr={3}
              onClick={selectedPermission ? handleUpdatePermission : handleCreatePermission}
            >
              {selectedPermission ? 'Update' : 'Create'}
            </Button>
            <Button onClick={onPermissionModalClose}>Cancel</Button>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>

      {/* Assign Modal */}
      <Dialog.Root open={isAssignModalOpen} onClose={onAssignModalClose} size='xl'>
        <Dialog.Backdrop />
        <Dialog.Content>
          <Dialog.Header>Manage Permission Assignments</Dialog.Header>
          <Dialog.CloseTrigger />
          <Dialog.Body pb={6}>
            <Tabs>
              <Tabs.List>
                <Tabs.Trigger>Teams</Tabs.Trigger>
                <Tabs.Trigger>Users</Tabs.Trigger>
                <Tabs.Trigger>Repositories</Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content>
                {/* Teams management UI */}
                <Button
                  colorScheme='blue'
                  mr={3}
                  onClick={() => handleUpdatePermission(selectedPermission.id, formData)}
                >
                  Update Teams
                </Button>
              </Tabs.Content>
              <Tabs.Content>
                {/* Users management UI */}
                <Button
                  colorScheme='blue'
                  mr={3}
                  onClick={() => handleUpdatePermission(selectedPermission.id, formData)}
                >
                  Update Users
                </Button>
              </Tabs.Content>
              <Tabs.Content>
                {/* Repositories management UI */}
                <Button
                  colorScheme='blue'
                  mr={3}
                  onClick={() => handleUpdatePermission(selectedPermission.id, formData)}
                >
                  Update Repositories
                </Button>
              </Tabs.Content>

            </Tabs>
            <Button onClick={onAssignModalClose}>Cancel</Button>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
};

export default PermissionsPage;
