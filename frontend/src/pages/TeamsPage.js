import { toaster } from '@/components/ui/toaster';
import {
  Avatar,
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
import { FiEdit, FiGitBranch, FiMoreVertical, FiShield, FiTrash2, FiUsers, } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useRepositories } from '../hooks/useRepositories';
import { useTeams } from '../hooks/useTeams';
import { useUsers } from '../hooks/useUsers';

const TeamsPage = () => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'regular',
    parentTeamId: '',
  });
  const [newMember, setNewMember] = useState({
    username: '',
    role: 'member',
  });
  const [selectedRepositories, setSelectedRepositories] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [permissionRules, setPermissionRules] = useState({
    branchProtection: false,
    requireReviews: false,
    requireStatusChecks: false,
    requireLinearHistory: false,
    allowForcePush: false,
    allowDeletions: false,
  });

  const {
    isOpen: isTeamModalOpen,
    onOpen: onTeamModalOpen,
    onClose: onTeamModalClose
  } = useDisclosure();

  const {
    isOpen: isMembersModalOpen,
    onOpen: onMembersModalOpen,
    onClose: onMembersModalClose
  } = useDisclosure();

  const { organization, logAuditEvent } = useAuth();
  const { hasPermission } = usePermissions();

  const {
    teams,
    isLoading,
    error,
    createTeam,
    updateTeam,
    deleteTeam,
    getTeamMembers,
    addMember,
    removeMember,
    getTeamRepositories,
    addRepository,
    removeRepository,
    getTeamPermissions,
    updateTeamPermissions,
    syncWithGitHub,
  } = useTeams();

  const {
    users,
    searchUsers,
  } = useUsers();

  const {
    repositories,
    getRepositories,
  } = useRepositories();

  const handleCreateTeam = async () => {
    try {
      if (!formData.name) {
        toaster.create({
          title: 'Validation Error',
          description: 'Team name is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const newTeam = await createTeam(formData);

      logAuditEvent(
        'team_created',
        'team',
        newTeam.id.toString(),
        { name: formData.name }
      );

      toaster.create({
        title: 'Team created',
        description: `Team "${formData.name}" has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onTeamModalClose();
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

  const handleUpdateTeam = async () => {
    try {
      if (!selectedTeam) return;

      const updatedTeam = await updateTeam(selectedTeam.id, formData);

      logAuditEvent(
        'team_updated',
        'team',
        selectedTeam.id.toString(),
        { name: formData.name }
      );

      toaster.create({
        title: 'Team updated',
        description: `Team "${formData.name}" has been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onTeamModalClose();
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

  const handleDeleteTeam = async (team) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await deleteTeam(team.id);

        logAuditEvent(
          'team_deleted',
          'team',
          team.id.toString(),
          { name: team.name }
        );

        toaster.create({
          title: 'Team deleted',
          description: `Team "${team.name}" has been deleted.`,
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

  const handleAddMember = async (teamId, userId) => {
    try {
      await addMember(teamId, userId);

      logAuditEvent(
        'member_added',
        'team',
        teamId.toString(),
        { userId }
      );

      toaster.create({
        title: 'Member added',
        description: 'Member has been added to the team.',
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

  const handleRemoveMember = async (teamId, userId) => {
    try {
      await removeMember(teamId, userId);

      logAuditEvent(
        'member_removed',
        'team',
        teamId.toString(),
        { userId }
      );

      toaster.create({
        title: 'Member removed',
        description: 'Member has been removed from the team.',
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

  const handleSearchUsers = async (query) => {
    try {
      await searchUsers(query);
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

  const handleManagePermissions = async (team) => {
    try {
      const permissions = await getTeamPermissions(team.id);
      setPermissionRules(permissions);
      setSelectedTeam(team);
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

  const handleManageRepoAccess = async (team) => {
    try {
      const teamRepos = await getTeamRepositories(team.id);
      setSelectedRepositories(teamRepos.map(repo => repo.id));
      setSelectedTeam(team);
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

  const handleSavePermissions = async () => {
    try {
      if (!selectedTeam) return;

      await updateTeamPermissions(selectedTeam.id, permissionRules);

      logAuditEvent(
        'team_permissions_updated',
        'team',
        selectedTeam.id.toString(),
        { name: selectedTeam.name }
      );

      toaster.create({
        title: 'Permissions updated',
        description: 'Team permissions have been updated.',
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

  const handleSaveRepoAccess = async () => {
    try {
      if (!selectedTeam) return;

      const currentRepos = await getTeamRepositories(selectedTeam.id);
      const currentRepoIds = currentRepos.map(repo => repo.id);

      // Add new repositories
      for (const repoId of selectedRepositories) {
        if (!currentRepoIds.includes(repoId)) {
          await addRepository(selectedTeam.id, repoId);
        }
      }

      // Remove repositories that are no longer selected
      for (const repoId of currentRepoIds) {
        if (!selectedRepositories.includes(repoId)) {
          await removeRepository(selectedTeam.id, repoId);
        }
      }

      logAuditEvent(
        'team_repositories_updated',
        'team',
        selectedTeam.id.toString(),
        { name: selectedTeam.name }
      );

      toaster.create({
        title: 'Repository access updated',
        description: 'Team repository access has been updated.',
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

  const handleSyncWithGitHub = async () => {
    try {
      setIsSyncing(true);
      await syncWithGitHub();

      logAuditEvent(
        'teams_synced',
        'team',
        'all',
        { organization: organization.name }
      );

      toaster.create({
        title: 'Teams synced',
        description: 'Teams have been synchronized with GitHub.',
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
    } finally {
      setIsSyncing(false);
    }
  };

  const openTeamModal = (team = null) => {
    if (team) {
      setSelectedTeam(team);
      setFormData({
        name: team.name,
        description: team.description,
        type: team.type,
        parentTeamId: team.parentTeamId,
      });
    } else {
      setSelectedTeam(null);
      setFormData({
        name: '',
        description: '',
        type: 'regular',
        parentTeamId: '',
      });
    }
    onTeamModalOpen();
  };

  const openMembersModal = async (team) => {
    try {
      const members = await getTeamMembers(team.id);
      setSelectedTeam(team);
      setFormData(prev => ({
        ...prev,
        members,
      }));
      onMembersModalOpen();
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
        <Heading size='lg' mb={4}>Loading teams...</Heading>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Heading size='lg' mb={4}>Error loading teams</Heading>
        <Box color='red.500'>{error}</Box>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex justify='space-between' align='center' mb={6}>
        <Heading size='lg'>Teams</Heading>
        {hasPermission('teams.create') && (
          <Button
            leftIcon={<FiUsers />}
            colorScheme='blue'
            onClick={() => openTeamModal()}
          >
            Create Team
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
              <Table.Cell>Type</Table.Cell>
              <Table.Cell>Members</Table.Cell>
              <Table.Cell>Actions</Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {teams.map((team) => (
              <Table.Row key={team.id}>
                <Table.Cell>
                  <Stack gap={3}>
                    <Avatar size='sm' name={team.name} />
                    <Text fontWeight='medium'>{team.name}</Text>
                  </Stack>
                </Table.Cell>
                <Table.Cell>{team.description}</Table.Cell>
                <Table.Cell>
                  <Badge colorScheme={team.type === 'admin' ? 'purple' : 'blue'}>
                    {team.type}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Stack gap={2}>
                    {team.members?.map((member) => (
                      <Avatar
                        key={member.id}
                        size='xs'
                        name={member.username}
                        src={member.avatarUrl}
                      />
                    ))}
                  </Stack>
                </Table.Cell>
                <Table.Cell>
                  <Stack gap={2}>
                    {hasPermission('teams.edit') && (
                      <IconButton
                        aria-label='Edit team'
                        icon={<FiEdit />}
                        size='sm'
                        onClick={() => openTeamModal(team)}
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
                          icon={<FiUsers />}
                          onClick={() => openMembersModal(team)}
                        >
                          Manage Members
                        </MenuItem>
                        <MenuItem
                          icon={<FiGitBranch />}
                          onClick={() => openRepositoriesModal(team)}
                        >
                          Manage Repositories
                        </MenuItem>
                        <MenuItem
                          icon={<FiShield />}
                          onClick={() => openPermissionsModal(team)}
                        >
                          Manage Permissions
                        </MenuItem>
                        {hasPermission('teams.delete') && (
                          <MenuItem
                            icon={<FiTrash2 />}
                            color='red.500'
                            onClick={() => handleDeleteTeam(team)}
                          >
                            Delete Team
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

      {/* Team Modal */}
      <Dialog.Root open={isTeamModalOpen} onClose={onTeamModalClose}>
        <Dialog.Backdrop />
        <Dialog.Content>
          <Dialog.Header>
            {selectedTeam ? 'Edit Team' : 'Create Team'}
          </Dialog.Header>
          <Dialog.CloseTrigger />
          <Dialog.Body pb={6}>
            <Field.Root mb={4}>
              <Field.Label>Team Name</Field.Label>
              <Input
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                placeholder='Enter team name'
              />
            </Field.Root>
            <Field.Root mb={4}>
              <Field.Label>Description</Field.Label>
              <Textarea
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                placeholder='Enter team description'
              />
            </Field.Root>
            <Field.Root mb={4}>
              <Field.Label>Type</Field.Label>
              <Select
                name='type'
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value='regular'>Regular</option>
                <option value='admin'>Admin</option>
                <option value='maintainer'>Maintainer</option>
              </Select>
            </Field.Root>
            <Field.Root mb={4}>
              <Field.Label>Parent Team</Field.Label>
              <Select
                name='parentTeamId'
                value={formData.parentTeamId}
                onChange={handleInputChange}
              >
                <option value=''>None</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </Select>
            </Field.Root>
            <Button
              colorScheme='blue'
              mr={3}
              onClick={selectedTeam ? handleUpdateTeam : handleCreateTeam}
            >
              {selectedTeam ? 'Update' : 'Create'}
            </Button>
            <Button onClick={onTeamModalClose}>Cancel</Button>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>

      {/* Members Modal */}
      <Dialog.Root open={isMembersModalOpen} onClose={onMembersModalClose}>
        <Dialog.Backdrop />
        <Dialog.Content>
          <Dialog.Header>Manage Team Members</Dialog.Header>
          <Dialog.CloseTrigger />
          <Dialog.Body pb={6}>
            {/* Add your members management UI here */}
            <Button
              colorScheme='blue'
              mr={3}
              onClick={() => handleUpdateMembers(selectedTeam.id, formData.members)}
            >
              Update Members
            </Button>
            <Button onClick={onMembersModalClose}>Cancel</Button>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
};

export default TeamsPage;
