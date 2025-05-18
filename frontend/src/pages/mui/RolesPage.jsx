import React, { useState } from 'react';
import {
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
  MoreVert as MoreVertIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { usePermissions } from '../../hooks/usePermissions';
import { useRoles } from '../../hooks/useRoles';

const RolesPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
  });

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
      setIsRoleModalOpen(false);
    } catch (err) {
      console.error('Error creating role:', err);
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
      setIsRoleModalOpen(false);
    } catch (err) {
      console.error('Error updating role:', err);
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
      } catch (err) {
        console.error('Error deleting role:', err);
      }
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
      setIsPermissionsModalOpen(false);
    } catch (err) {
      console.error('Error updating permissions:', err);
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
    setIsRoleModalOpen(true);
  };

  const openPermissionsModal = async (role) => {
    try {
      const permissions = await getRolePermissions(role.id);
      setSelectedRole(role);
      setFormData(prev => ({
        ...prev,
        permissions,
      }));
      setIsPermissionsModalOpen(true);
    } catch (err) {
      console.error('Error loading permissions:', err);
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
        <Typography variant='h4' gutterBottom>Loading roles...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography variant='h4' gutterBottom>Error loading roles</Typography>
        <Typography color='error'>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Stack direction='row' justifyContent='space-between' alignItems='center' mb={4}>
        <Typography variant='h4'>Roles</Typography>
        {hasPermission('roles.create') && (
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => openRoleModal()}
          >
            Create Role
          </Button>
        )}
      </Stack>

      <Grid container spacing={3}>
        {roles?.map((role) => (
          <Grid item xs={12} md={6} lg={4} key={role.id}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction='row' justifyContent='space-between' alignItems='center'>
                    <Typography variant='h6'>{role.name}</Typography>
                    <Stack direction='row' spacing={1}>
                      {hasPermission('roles.edit') && (
                        <IconButton
                          size='small'
                          onClick={() => openRoleModal(role)}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size='small'
                        onClick={() => openPermissionsModal(role)}
                      >
                        <ShieldIcon />
                      </IconButton>
                      {hasPermission('roles.delete') && (
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleDeleteRole(role)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Stack>
                  </Stack>

                  <Typography variant='body2' color='text.secondary'>
                    {role.description}
                  </Typography>

                  <Box>
                    <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                      Permissions
                    </Typography>
                    <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                      {role?.permissions?.map((permission) => (
                        <Chip
                          key={permission.id}
                          label={permission.name}
                          size='small'
                          color='primary'
                          variant='outlined'
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

      {/* Role Modal */}
      <Dialog
        open={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          {selectedRole ? 'Edit Role' : 'Create Role'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label='Role Name'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label='Description'
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRoleModalOpen(false)}>Cancel</Button>
          <Button
            onClick={selectedRole ? handleUpdateRole : handleCreateRole}
            variant='contained'
          >
            {selectedRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Modal */}
      <Dialog
        open={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Manage Permissions</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Add your permissions management UI here */}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPermissionsModalOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleUpdatePermissions(selectedRole?.id, formData.permissions)}
            variant='contained'
          >
            Update Permissions
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RolesPage;
