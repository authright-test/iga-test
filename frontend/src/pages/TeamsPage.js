import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  IconButton,
  useToast,
  Spinner,
  Text,
  HStack,
  VStack,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Alert,
  AlertIcon,
  InputGroup,
  InputLeftElement,
  Select,
  Divider,
  useColorModeValue,
  Avatar,
  AvatarGroup,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  Switch,
  Checkbox,
  Textarea,
} from '@chakra-ui/react';
import { 
  FiEdit, 
  FiUsers, 
  FiSearch, 
  FiMoreVertical, 
  FiPlus,
  FiExternalLink,
  FiUserPlus,
  FiTrash2,
  FiShield,
  FiGitBranch,
  FiUserMinus,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useTeams } from '../hooks/useTeams';
import { useUsers } from '../hooks/useUsers';
import { useRepositories } from '../hooks/useRepositories';

const TeamsPage = () => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'regular',
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

  const toast = useToast();
  const { organization, logAuditEvent } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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
        toast({
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
      
      toast({
        title: 'Team created',
        description: `Team "${formData.name}" has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onTeamModalClose();
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
      
      toast({
        title: 'Team updated',
        description: `Team "${formData.name}" has been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onTeamModalClose();
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

  const handleDeleteTeam = async (team) => {
    try {
      await deleteTeam(team.id);
      
      logAuditEvent(
        'team_deleted',
        'team',
        team.id.toString(),
        { name: team.name }
      );
      
      toast({
        title: 'Team deleted',
        description: `Team "${team.name}" has been deleted.`,
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

  const handleAddMember = async (teamId, userId) => {
    try {
      await addMember(teamId, userId);
      
      logAuditEvent(
        'member_added',
        'team',
        teamId.toString(),
        { userId }
      );
      
      toast({
        title: 'Member added',
        description: 'Member has been added to the team.',
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

  const handleRemoveMember = async (teamId, userId) => {
    try {
      await removeMember(teamId, userId);
      
      logAuditEvent(
        'member_removed',
        'team',
        teamId.toString(),
        { userId }
      );
      
      toast({
        title: 'Member removed',
        description: 'Member has been removed from the team.',
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

  const handleSearchUsers = async (query) => {
    try {
      await searchUsers(query);
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

  const handleManagePermissions = async (team) => {
    try {
      const permissions = await getTeamPermissions(team.id);
      setPermissionRules(permissions);
      setSelectedTeam(team);
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

  const handleManageRepoAccess = async (team) => {
    try {
      const teamRepos = await getTeamRepositories(team.id);
      setSelectedRepositories(teamRepos.map(repo => repo.id));
      setSelectedTeam(team);
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
      
      toast({
        title: 'Permissions updated',
        description: 'Team permissions have been updated.',
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
      
      toast({
        title: 'Repository access updated',
        description: 'Team repository access has been updated.',
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
      
      toast({
        title: 'Teams synced',
        description: 'Teams have been synchronized with GitHub.',
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
      });
    } else {
      setSelectedTeam(null);
      setFormData({
        name: '',
        description: '',
        type: 'regular',
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
        <Heading size="lg" mb={4}>Loading teams...</Heading>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Heading size="lg" mb={4}>Error loading teams</Heading>
        <Box color="red.500">{error}</Box>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="lg">Teams</Heading>
        <Button colorScheme="blue" onClick={() => openTeamModal()}>
          Create Team
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
              <Th>Team</Th>
              <Th>Type</Th>
              <Th>Members</Th>
              <Th>Repositories</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {teams.map((team) => (
              <Tr key={team.id}>
                <Td>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">{team.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {team.description}
                    </Text>
                  </VStack>
                </Td>
                <Td>
                  <Badge colorScheme="blue">{team.type}</Badge>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    {team.members?.map((member) => (
                      <Avatar
                        key={member.id}
                        size="xs"
                        name={member.name}
                        src={member.avatar}
                      />
                    ))}
                  </HStack>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    {team.repositories?.map((repo) => (
                      <Badge key={repo.id} colorScheme="purple">
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
                        icon={<FiEdit />}
                        onClick={() => openTeamModal(team)}
                      >
                        Edit Team
                      </MenuItem>
                      <MenuItem
                        icon={<FiUsers />}
                        onClick={() => openMembersModal(team)}
                      >
                        Manage Members
                      </MenuItem>
                      <MenuItem
                        icon={<FiUserPlus />}
                        onClick={() => handleAddMember(team.id)}
                      >
                        Add Member
                      </MenuItem>
                      <MenuItem
                        icon={<FiUserMinus />}
                        onClick={() => handleRemoveMember(team.id)}
                      >
                        Remove Member
                      </MenuItem>
                      <MenuItem
                        icon={<FiShield />}
                        onClick={() => handleManagePermissions(team)}
                      >
                        Update Permissions
                      </MenuItem>
                      <MenuItem
                        icon={<FiGitBranch />}
                        onClick={() => handleManageRepoAccess(team)}
                      >
                        Repository Access
                      </MenuItem>
                      <MenuItem
                        icon={<FiTrash2 />}
                        onClick={() => handleDeleteTeam(team)}
                        color="red.500"
                      >
                        Delete Team
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Team Modal */}
      <Modal isOpen={isTeamModalOpen} onClose={onTeamModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedTeam ? 'Edit Team' : 'Create Team'}
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
                placeholder="Enter team name"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter team description"
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
                <option value="regular">Regular</option>
                <option value="admin">Admin</option>
                <option value="maintainer">Maintainer</option>
              </Select>
            </FormControl>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={selectedTeam ? handleUpdateTeam : handleCreateTeam}
            >
              {selectedTeam ? 'Update' : 'Create'}
            </Button>
            <Button onClick={onTeamModalClose}>Cancel</Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Members Modal */}
      <Modal isOpen={isMembersModalOpen} onClose={onMembersModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Team Members</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {/* Add your members management UI here */}
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => handleUpdateTeam(selectedTeam.id, formData)}
            >
              Update Members
            </Button>
            <Button onClick={onMembersModalClose}>Cancel</Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TeamsPage;
