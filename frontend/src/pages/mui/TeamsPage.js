import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  GitHub as GitHubIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useRepositories } from '../../hooks/useRepositories';
import { useTeams } from '../../hooks/useTeams';
import { useUsers } from '../../hooks/useUsers';

const TeamsPage = () => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
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
        console.error('Team name is required');
        return;
      }

      const newTeam = await createTeam(formData);
      logAuditEvent(
        'team_created',
        'team',
        newTeam.id.toString(),
        { name: formData.name }
      );
      setIsTeamModalOpen(false);
    } catch (err) {
      console.error('Error creating team:', err);
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
      setIsTeamModalOpen(false);
    } catch (err) {
      console.error('Error updating team:', err);
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
      } catch (err) {
        console.error('Error deleting team:', err);
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
    } catch (err) {
      console.error('Error adding member:', err);
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
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  const handleSearchUsers = async (query) => {
    try {
      await searchUsers(query);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  const handleManagePermissions = async (team) => {
    try {
      const permissions = await getTeamPermissions(team.id);
      setPermissionRules(permissions);
      setSelectedTeam(team);
    } catch (err) {
      console.error('Error loading permissions:', err);
    }
  };

  const handleManageRepoAccess = async (team) => {
    try {
      const teamRepos = await getTeamRepositories(team.id);
      setSelectedRepositories(teamRepos.map(repo => repo.id));
      setSelectedTeam(team);
    } catch (err) {
      console.error('Error loading repositories:', err);
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
    } catch (err) {
      console.error('Error updating permissions:', err);
    }
  };

  const handleSaveRepoAccess = async () => {
    try {
      if (!selectedTeam) return;
      const currentRepos = await getTeamRepositories(selectedTeam.id);
      const currentRepoIds = currentRepos.map(repo => repo.id);

      for (const repoId of selectedRepositories) {
        if (!currentRepoIds.includes(repoId)) {
          await addRepository(selectedTeam.id, repoId);
        }
      }

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
    } catch (err) {
      console.error('Error updating repositories:', err);
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
    } catch (err) {
      console.error('Error syncing with GitHub:', err);
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
    setIsTeamModalOpen(true);
  };

  const openMembersModal = async (team) => {
    try {
      const members = await getTeamMembers(team.id);
      setSelectedTeam(team);
      setFormData(prev => ({
        ...prev,
        members,
      }));
      setIsMembersModalOpen(true);
    } catch (err) {
      console.error('Error loading members:', err);
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
        <Typography variant="h4" gutterBottom>Loading teams...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography variant="h4" gutterBottom>Error loading teams</Typography>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Teams</Typography>
        {hasPermission('teams.create') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openTeamModal()}
          >
            Create Team
          </Button>
        )}
      </Stack>

      <Grid container spacing={3}>
        {teams.map((team) => (
          <Grid item xs={12} md={6} lg={4} key={team.id}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar>{team.name[0]}</Avatar>
                    <Box flex={1}>
                      <Typography variant="h6">{team.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {team.description}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      {hasPermission('teams.edit') && (
                        <IconButton
                          size="small"
                          onClick={() => openTeamModal(team)}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => openMembersModal(team)}
                      >
                        <PeopleIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleManagePermissions(team)}
                      >
                        <ShieldIcon />
                      </IconButton>
                      {hasPermission('teams.delete') && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteTeam(team)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Stack>
                  </Stack>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Type
                    </Typography>
                    <Chip
                      label={team.type}
                      color={team.type === 'admin' ? 'primary' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Members
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {team.members?.map((member) => (
                        <Chip
                          key={member.id}
                          avatar={<Avatar src={member.avatarUrl}>{member.username[0]}</Avatar>}
                          label={member.username}
                          size="small"
                        />
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Team Modal */}
      <Dialog
        open={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedTeam ? 'Edit Team' : 'Create Team'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Team Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                label="Type"
              >
                <MenuItem value="regular">Regular</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="maintainer">Maintainer</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Parent Team</InputLabel>
              <Select
                name="parentTeamId"
                value={formData.parentTeamId}
                onChange={handleInputChange}
                label="Parent Team"
              >
                <MenuItem value="">None</MenuItem>
                {teams.map(team => (
                  <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsTeamModalOpen(false)}>Cancel</Button>
          <Button
            onClick={selectedTeam ? handleUpdateTeam : handleCreateTeam}
            variant="contained"
          >
            {selectedTeam ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Members Modal */}
      <Dialog
        open={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manage Team Members</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Add your members management UI here */}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsMembersModalOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleUpdateMembers(selectedTeam?.id, formData.members)}
            variant="contained"
          >
            Update Members
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamsPage; 