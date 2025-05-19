import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import React, { useState } from 'react';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useAccessPermissions } from '../../hooks/useAccessPermissions';
import { usePermissions } from '../../hooks/usePermissions';

const PermissionsPage = () => {
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'repository',
    level: 'read',
  });

  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

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
      setIsPermissionModalOpen(false);
    } catch (err) {
      console.error('Error creating permission:', err);
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
      setIsPermissionModalOpen(false);
    } catch (err) {
      console.error('Error updating permission:', err);
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
      } catch (err) {
        console.error('Error deleting permission:', err);
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
    setIsPermissionModalOpen(true);
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
      setIsAssignModalOpen(true);
    } catch (err) {
      console.error('Error loading permission assignments:', err);
    }
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
          Permissions
        </Typography>
        {hasPermission('permissions.create') && (
          <Button
            variant='contained'
            startIcon={<ShieldIcon />}
            onClick={() => openPermissionModal()}
          >
            Create Permission
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity='error'>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Level</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permissions?.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell>{permission.name}</TableCell>
                <TableCell>{permission.description}</TableCell>
                <TableCell>
                  <Chip
                    label={permission.type}
                    color={permission.type === 'repository' ? 'primary' : 'secondary'}
                    size='small'
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={permission.level}
                    color={
                      permission.level === 'admin'
                        ? 'error'
                        : permission.level === 'write'
                          ? 'warning'
                          : 'success'
                    }
                    size='small'
                  />
                </TableCell>
                <TableCell align='right'>
                  <Stack direction='row' spacing={1} justifyContent='flex-end'>
                    {hasPermission('permissions.edit') && (
                      <IconButton
                        size='small'
                        onClick={() => openPermissionModal(permission)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    {hasPermission('permissions.delete') && (
                      <IconButton
                        size='small'
                        color='error'
                        onClick={() => handleDeletePermission(permission)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size='small'
                      onClick={() => openAssignModal(permission)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Permission Modal */}
      <Dialog
        open={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          {selectedPermission ? 'Edit Permission' : 'Create Permission'}
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
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label='Type'
              >
                <MenuItem value='repository'>Repository</MenuItem>
                <MenuItem value='organization'>Organization</MenuItem>
                <MenuItem value='team'>Team</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                label='Level'
              >
                <MenuItem value='read'>Read</MenuItem>
                <MenuItem value='write'>Write</MenuItem>
                <MenuItem value='admin'>Admin</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPermissionModalOpen(false)}>Cancel</Button>
          <Button
            onClick={selectedPermission ? handleUpdatePermission : handleCreatePermission}
            variant='contained'
          >
            {selectedPermission ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Modal */}
      <Dialog
        open={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Permission Assignments</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Add assignment content here */}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAssignModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PermissionsPage;
