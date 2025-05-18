import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useOrganization } from '../../hooks/useOrganization';
import { usePermissions } from '../../hooks/usePermissions';

const OrganizationPage = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newMember, setNewMember] = useState({
    email: '',
    role: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    location: '',
    email: '',
  });

  const { logAuditEvent, token, organization, updateOrganization } = useAuth();
  const { hasPermission } = usePermissions();

  const {
    members,
    isLoading: orgLoading,
    error: orgError,
    addMember,
    removeMember,
    updateMemberRole,
  } = useOrganization();

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        description: organization.description || '',
        website: organization.website || '',
        location: organization.location || '',
        email: organization.email || '',
      });
      setIsLoading(false);
    }
  }, [organization]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await updateOrganization(formData);
    } catch (err) {
      setError(err.message || 'Failed to update organization');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrganization = () => {
    updateOrganization(organization);
    setIsEditDialogOpen(false);
  };

  const handleAddMember = () => {
    addMember(newMember);
    setIsCreateDialogOpen(false);
    setNewMember({
      email: '',
      role: '',
    });
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      removeMember(memberId);
    }
  };

  const handleUpdateMemberRole = (memberId, newRole) => {
    updateMemberRole(memberId, newRole);
  };

  if (!hasPermission('organization.view')) {
    return (
      <Box p={4}>
        <Typography variant='h4' gutterBottom>Access Denied</Typography>
        <Typography>You do not have permission to view organization details.</Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant='h4' component='h1' gutterBottom>
        Organization Settings
      </Typography>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  src={organization?.avatar}
                  alt={organization?.name}
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                <Typography variant='h6' gutterBottom>
                  {organization?.name}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {organization?.plan || 'Free'} Plan
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                <TextField
                  label='Organization Name'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />

                <TextField
                  label='Description'
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={4}
                />

                <TextField
                  label='Website'
                  name='website'
                  value={formData.website}
                  onChange={handleInputChange}
                  fullWidth
                />

                <TextField
                  label='Location'
                  name='location'
                  value={formData.location}
                  onChange={handleInputChange}
                  fullWidth
                />

                <TextField
                  label='Email'
                  name='email'
                  type='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type='submit'
                    variant='contained'
                    disabled={isLoading}
                    size='large'
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default OrganizationPage;
