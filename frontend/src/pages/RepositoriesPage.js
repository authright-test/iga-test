import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Avatar,
  Text,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { FiMoreVertical, FiEdit2, FiTrash2, FiUserPlus, FiUserMinus, FiShield, FiGitBranch, FiGitCommit } from 'react-icons/fi';
import { useRepositories } from '../hooks/useRepositories';
import { useAuth } from '../contexts/AuthContext';

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

  const toast = useToast();
  const { logAuditEvent } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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
      if (!formData.name) {
        toast({
          title: 'Validation Error',
          description: 'Repository name is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const newRepo = await createRepository(formData);
      
      logAuditEvent(
        'repository_created',
        'repository',
        newRepo.id.toString(),
        { name: formData.name }
      );
      
      toast({
        title: 'Repository created',
        description: `Repository "${formData.name}" has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onRepoModalClose();
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
      
      toast({
        title: 'Repository updated',
        description: `Repository "${formData.name}" has been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onRepoModalClose();
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

  const handleDeleteRepository = async (repo) => {
    try {
      await deleteRepository(repo.id);
      
      logAuditEvent(
        'repository_deleted',
        'repository',
        repo.id.toString(),
        { name: repo.name }
      );
      
      toast({
        title: 'Repository deleted',
        description: `Repository "${repo.name}" has been deleted.`,
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

  const handleAddTeam = async (repoId, teamId) => {
    try {
      await addTeam(repoId, teamId);
      
      logAuditEvent(
        'team_added',
        'repository',
        repoId.toString(),
        { teamId }
      );
      
      toast({
        title: 'Team added',
        description: 'Team has been added to the repository.',
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

  const handleRemoveTeam = async (repoId, teamId) => {
    try {
      await removeTeam(repoId, teamId);
      
      logAuditEvent(
        'team_removed',
        'repository',
        repoId.toString(),
        { teamId }
      );
      
      toast({
        title: 'Team removed',
        description: 'Team has been removed from the repository.',
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
        <Heading size="lg" mb={4}>Loading repositories...</Heading>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Heading size="lg" mb={4}>Error loading repositories</Heading>
        <Box color="red.500">{error}</Box>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="lg">Repositories</Heading>
        <Button colorScheme="blue" onClick={() => openRepoModal()}>
          Create Repository
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
              <Th>Repository</Th>
              <Th>Visibility</Th>
              <Th>Teams</Th>
              <Th>Branches</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {repositories.map((repo) => (
              <Tr key={repo.id}>
                <Td>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">{repo.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {repo.description}
                    </Text>
                  </VStack>
                </Td>
                <Td>
                  <Badge colorScheme={repo.visibility === 'private' ? 'red' : 'green'}>
                    {repo.visibility}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    {repo.teams?.map((team) => (
                      <Badge key={team.id} colorScheme="purple">
                        {team.name}
                      </Badge>
                    ))}
                  </HStack>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    {repo.branches?.map((branch) => (
                      <Badge key={branch.name} colorScheme="blue">
                        {branch.name}
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
                        onClick={() => openRepoModal(repo)}
                      >
                        Edit Repository
                      </MenuItem>
                      <MenuItem
                        icon={<FiShield />}
                        onClick={() => openTeamsModal(repo)}
                      >
                        Manage Teams
                      </MenuItem>
                      <MenuItem
                        icon={<FiUserPlus />}
                        onClick={() => handleAddTeam(repo.id)}
                      >
                        Add Team
                      </MenuItem>
                      <MenuItem
                        icon={<FiUserMinus />}
                        onClick={() => handleRemoveTeam(repo.id)}
                      >
                        Remove Team
                      </MenuItem>
                      <MenuItem
                        icon={<FiGitBranch />}
                        onClick={() => getRepositoryBranches(repo.id)}
                      >
                        View Branches
                      </MenuItem>
                      <MenuItem
                        icon={<FiGitCommit />}
                        onClick={() => getRepositoryCommits(repo.id)}
                      >
                        View Commits
                      </MenuItem>
                      <MenuItem
                        icon={<FiTrash2 />}
                        onClick={() => handleDeleteRepository(repo)}
                        color="red.500"
                      >
                        Delete Repository
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Repository Modal */}
      <Modal isOpen={isRepoModalOpen} onClose={onRepoModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedRepo ? 'Edit Repository' : 'Create Repository'}
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
                placeholder="Enter repository name"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter repository description"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Visibility</FormLabel>
              <Select
                value={formData.visibility}
                onChange={(e) =>
                  setFormData({ ...formData, visibility: e.target.value })
                }
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </Select>
            </FormControl>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={selectedRepo ? handleUpdateRepository : handleCreateRepository}
            >
              {selectedRepo ? 'Update' : 'Create'}
            </Button>
            <Button onClick={onRepoModalClose}>Cancel</Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Teams Modal */}
      <Modal isOpen={isTeamsModalOpen} onClose={onTeamsModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Repository Teams</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {/* Add your teams management UI here */}
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => handleUpdateRepository(selectedRepo.id, formData)}
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

export default RepositoriesPage; 