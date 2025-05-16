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
  Text,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FiEdit2, FiGitBranch, FiMoreVertical, FiShield, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useRepositories } from '../hooks/useRepositories';

const RepositoriesPage = () => {
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'private',
  });

  const {
    isOpen: isRepoModalOpen,
    onOpen: onRepoModalOpen,
    onClose: onRepoModalClose
  } = useDisclosure();

  const {
    isOpen: isTeamsModalOpen,
    onOpen: onTeamsModalOpen,
    onClose: onTeamsModalClose
  } = useDisclosure();

  const { logAuditEvent } = useAuth();
  const { hasPermission } = usePermissions();

  const {
    repositories,
    isLoading,
    error,
    createRepository,
    updateRepository,
    deleteRepository,
    getRepositoryTeams,
    addTeam,
    removeTeam,
    getRepositoryUsers,
    addUser,
    removeUser,
    getRepositoryPermissions,
    updateRepositoryPermissions,
    getRepositoryBranches,
    getRepositoryCommits,
  } = useRepositories();

  const handleCreateRepository = async () => {
    try {
      const newRepo = await createRepository(formData);
      logAuditEvent(
        'repository_created',
        'repository',
        newRepo.id.toString(),
        { name: formData.name }
      );
      toaster.create({
        title: 'Repository created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onRepoModalClose();
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

  const handleUpdateRepository = async () => {
    try {
      if (!selectedRepo) return;
      const updatedRepo = await updateRepository(selectedRepo.id, formData);
      logAuditEvent(
        'repository_updated',
        'repository',
        selectedRepo.id.toString(),
        { name: formData.name }
      );
      toaster.create({
        title: 'Repository updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onRepoModalClose();
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

  const handleDeleteRepository = async (repo) => {
    if (window.confirm('Are you sure you want to delete this repository?')) {
      try {
        await deleteRepository(repo.id);
        logAuditEvent(
          'repository_deleted',
          'repository',
          repo.id.toString(),
          { name: repo.name }
        );
        toaster.create({
          title: 'Repository deleted',
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

  const handleAddTeam = async (repoId, teamId) => {
    try {
      await addTeam(repoId, teamId);

      logAuditEvent(
        'team_added',
        'repository',
        repoId.toString(),
        { teamId }
      );

      toaster.create({
        title: 'Team added',
        description: 'Team has been added to the repository.',
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

  const handleRemoveTeam = async (repoId, teamId) => {
    try {
      await removeTeam(repoId, teamId);

      logAuditEvent(
        'team_removed',
        'repository',
        repoId.toString(),
        { teamId }
      );

      toaster.create({
        title: 'Team removed',
        description: 'Team has been removed from the repository.',
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

  const openRepoModal = (repo = null) => {
    if (repo) {
      setSelectedRepo(repo);
      setFormData({
        name: repo.name,
        description: repo.description,
        visibility: repo.visibility,
      });
    } else {
      setSelectedRepo(null);
      setFormData({
        name: '',
        description: '',
        visibility: 'private',
      });
    }
    onRepoModalOpen();
  };

  const openTeamsModal = async (repo) => {
    try {
      const teams = await getRepositoryTeams(repo.id);
      setSelectedRepo(repo);
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
        <Heading size='lg' mb={4}>Loading repositories...</Heading>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Heading size='lg' mb={4}>Error loading repositories</Heading>
        <Box color='red.500'>{error}</Box>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex justify='space-between' align='center' mb={6}>
        <Heading size='lg'>Repositories</Heading>
        {hasPermission('repositories.create') && (
          <Button
            leftIcon={<FiGitBranch />}
            colorScheme='blue'
            onClick={() => openRepoModal()}
          >
            Create Repository
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
              <Table.Cell>Visibility</Table.Cell>
              <Table.Cell>Teams</Table.Cell>
              <Table.Cell>Actions</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {repositories.map((repo) => (
              <Table.Row key={repo.id}>
                <Table.Cell>
                  <Stack gap={3}>
                    <Text fontWeight='medium'>{repo.name}</Text>
                  </Stack>
                </Table.Cell>
                <Table.Cell>{repo.description}</Table.Cell>
                <Table.Cell>
                  <Badge colorScheme={repo.visibility === 'public' ? 'green' : 'blue'}>
                    {repo.visibility}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Stack gap={2}>
                    {repo.teams?.map((team) => (
                      <Badge key={team.id} colorScheme='purple'>
                        {team.name}
                      </Badge>
                    ))}
                  </Stack>
                </Table.Cell>
                <Table.Cell>
                  <Stack gap={2}>
                    {hasPermission('repositories.edit') && (
                      <IconButton
                        aria-label='Edit repository'
                        icon={<FiEdit2 />}
                        size='sm'
                        onClick={() => openRepoModal(repo)}
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
                          icon={<FiGitBranch />}
                          onClick={() => openTeamsModal(repo)}
                        >
                          Manage Teams
                        </MenuItem>
                        <MenuItem
                          icon={<FiShield />}
                          onClick={() => openPermissionsModal(repo)}
                        >
                          Manage Permissions
                        </MenuItem>
                        {hasPermission('repositories.delete') && (
                          <MenuItem
                            icon={<FiTrash2 />}
                            color='red.500'
                            onClick={() => handleDeleteRepository(repo)}
                          >
                            Delete Repository
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

      {/* Repository Modal */}
      <Dialog.Root open={isRepoModalOpen} onClose={onRepoModalClose}>
        <Dialog.Backdrop />
        <Dialog.Content>
          <Dialog.Header>
            {selectedRepo ? 'Edit Repository' : 'Create Repository'}
          </Dialog.Header>
          <Dialog.CloseTrigger />
          <Dialog.Body pb={6}>
            <Field.Root mb={4}>
              <Field.Label>Repository Name</Field.Label>
              <Input
                name='name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder='Enter repository name'
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
                placeholder='Enter repository description'
              />
            </Field.Root>
            <Field.Root mb={4}>
              <Field.Label>Visibility</Field.Label>
              <Select
                name='visibility'
                value={formData.visibility}
                onChange={(e) =>
                  setFormData({ ...formData, visibility: e.target.value })
                }
              >
                <option value='public'>Public</option>
                <option value='private'>Private</option>
                <option value='internal'>Internal</option>
              </Select>
            </Field.Root>
            <Button
              colorScheme='blue'
              mr={3}
              onClick={selectedRepo ? handleUpdateRepository : handleCreateRepository}
            >
              {selectedRepo ? 'Update' : 'Create'}
            </Button>
            <Button onClick={onRepoModalClose}>Cancel</Button>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>

      {/* Teams Modal */}
      <Dialog.Root open={isTeamsModalOpen} onClose={onTeamsModalClose}>
        <Dialog.Backdrop />
        <Dialog.Content>
          <Dialog.Header>Manage Repository Teams</Dialog.Header>
          <Dialog.CloseTrigger />
          <Dialog.Body pb={6}>
            {/* Add your teams management UI here */}
            <Button
              colorScheme='blue'
              mr={3}
              onClick={() => handleUpdateTeams(selectedRepo.id, formData.teams)}
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

export default RepositoriesPage;
