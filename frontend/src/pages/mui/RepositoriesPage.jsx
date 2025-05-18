import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { usePermissions } from '../../hooks/usePermissions';
import { useRepositories } from '../../hooks/useRepositories';

const RepositoriesPage = () => {
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [isRepositoryModalOpen, setIsRepositoryModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'private',
    defaultBranch: 'main',
    teams: [],
    users: [],
  });

  const { logAuditEvent } = useAuth();
  const { hasPermission } = usePermissions();
  const {
    getRepositories,
    createRepository,
    updateRepository,
    deleteRepository,
    getRepositoryTeams,
    getRepositoryUsers,
    addTeamToRepository,
    removeTeamFromRepository,
    addUserToRepository,
    removeUserFromRepository,
  } = useRepositories();

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      setIsLoading(true);
      const data = await getRepositories();
      setRepositories(data);
      setError(null);
    } catch (err) {
      setError('Failed to load repositories');
      console.error('Error loading repositories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRepository = async () => {
    try {
      const newRepository = await createRepository(formData);
      logAuditEvent(
        'repository_created',
        'repository',
        newRepository.id.toString(),
        { name: formData.name }
      );
      setIsRepositoryModalOpen(false);
      fetchRepositories();
    } catch (err) {
      console.error('Error creating repository:', err);
    }
  };

  const handleUpdateRepository = async () => {
    try {
      if (!selectedRepository) return;
      const updatedRepository = await updateRepository(selectedRepository.id, formData);
      logAuditEvent(
        'repository_updated',
        'repository',
        selectedRepository.id.toString(),
        { name: formData.name }
      );
      setIsRepositoryModalOpen(false);
      fetchRepositories();
    } catch (err) {
      console.error('Error updating repository:', err);
    }
  };

  const handleDeleteRepository = async (repository) => {
    if (window.confirm('Are you sure you want to delete this repository?')) {
      try {
        await deleteRepository(repository.id);
        logAuditEvent(
          'repository_deleted',
          'repository',
          repository.id.toString(),
          { name: repository.name }
        );
        fetchRepositories();
      } catch (err) {
        console.error('Error deleting repository:', err);
      }
    }
  };

  const openRepositoryModal = (repository = null) => {
    if (repository) {
      setSelectedRepository(repository);
      setFormData({
        name: repository.name,
        description: repository.description,
        visibility: repository.visibility,
        defaultBranch: repository.defaultBranch,
        teams: repository.teams || [],
        users: repository.users || [],
      });
    } else {
      setSelectedRepository(null);
      setFormData({
        name: '',
        description: '',
        visibility: 'private',
        defaultBranch: 'main',
        teams: [],
        users: [],
      });
    }
    setIsRepositoryModalOpen(true);
  };

  const openTeamModal = async (repository) => {
    try {
      const teams = await getRepositoryTeams(repository.id);
      setSelectedRepository(repository);
      setFormData(prev => ({
        ...prev,
        teams,
      }));
      setIsTeamModalOpen(true);
    } catch (err) {
      console.error('Error loading repository teams:', err);
    }
  };

  const openUserModal = async (repository) => {
    try {
      const users = await getRepositoryUsers(repository.id);
      setSelectedRepository(repository);
      setFormData(prev => ({
        ...prev,
        users,
      }));
      setIsUserModalOpen(true);
    } catch (err) {
      console.error('Error loading repository users:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction='row' justifyContent='space-between' alignItems='center' mb={3}>
        <Typography variant='h4' component='h1'>
          Repositories
        </Typography>
        {hasPermission('repositories.create') && (
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => openRepositoryModal()}
          >
            Create Repository
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Visibility</TableCell>
              <TableCell>Default Branch</TableCell>
              <TableCell>Teams</TableCell>
              <TableCell>Users</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {repositories?.map((repository) => (
              <TableRow key={repository.id}>
                <TableCell>{repository.name}</TableCell>
                <TableCell>{repository.description}</TableCell>
                <TableCell>
                  <Chip
                    label={repository.visibility}
                    color={repository.visibility === 'public' ? 'success' : 'default'}
                    size='small'
                  />
                </TableCell>
                <TableCell>{repository.defaultBranch}</TableCell>
                <TableCell>
                  <AvatarGroup max={3}>
                    {repository?.teams?.map((team) => (
                      <Avatar key={team.id} sx={{ width: 24, height: 24 }}>
                        <GroupIcon fontSize='small' />
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </TableCell>
                <TableCell>
                  <AvatarGroup max={3}>
                    {repository?.users?.map((user) => (
                      <Avatar key={user.id} sx={{ width: 24, height: 24 }}>
                        <PersonIcon fontSize='small' />
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </TableCell>
                <TableCell align='right'>
                  <Stack direction='row' spacing={1} justifyContent='flex-end'>
                    {hasPermission('repositories.edit') && (
                      <IconButton
                        size='small'
                        onClick={() => openRepositoryModal(repository)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    {hasPermission('repositories.delete') && (
                      <IconButton
                        size='small'
                        color='error'
                        onClick={() => handleDeleteRepository(repository)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size='small'
                      onClick={() => openTeamModal(repository)}
                    >
                      <GroupIcon />
                    </IconButton>
                    <IconButton
                      size='small'
                      onClick={() => openUserModal(repository)}
                    >
                      <PersonIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Repository Modal */}
      <Dialog
        open={isRepositoryModalOpen}
        onClose={() => setIsRepositoryModalOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          {selectedRepository ? 'Edit Repository' : 'Create Repository'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label='Name'
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label='Description'
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>Visibility</InputLabel>
              <Select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                label='Visibility'
              >
                <MenuItem value='private'>Private</MenuItem>
                <MenuItem value='public'>Public</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label='Default Branch'
              value={formData.defaultBranch}
              onChange={(e) => setFormData({ ...formData, defaultBranch: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRepositoryModalOpen(false)}>Cancel</Button>
          <Button
            onClick={selectedRepository ? handleUpdateRepository : handleCreateRepository}
            variant='contained'
          >
            {selectedRepository ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Team Modal */}
      <Dialog
        open={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Manage Teams</DialogTitle>
        <DialogContent>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label='Current Teams' />
            <Tab label='Add Teams' />
          </Tabs>
          {/* Add team management content here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsTeamModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* User Modal */}
      <Dialog
        open={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Manage Users</DialogTitle>
        <DialogContent>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label='Current Users' />
            <Tab label='Add Users' />
          </Tabs>
          {/* Add user management content here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUserModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RepositoriesPage;
