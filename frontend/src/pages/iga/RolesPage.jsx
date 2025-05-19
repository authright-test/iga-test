import React, { useState } from 'react';
import {
  Alert,
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
  InputLabel, LinearProgress,
  Menu,
  MenuItem, Pagination,
  Paper,
  Select,
  Stack, Table, TableBody, TableCell, TableHead, TableRow,
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
import PerfectScrollbar from 'react-perfect-scrollbar';
import { QuickSearchBar } from '../../components/common/quick-search-bar';
import { SearchCriteriaBar, SearchCriteriaItem } from '../../components/common/search-criteria-bar';
import { usePagingQueryRequest } from '../../components/common/usePagingQueryRequest';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { usePermissions } from '../../hooks/usePermissions';
import { useRoles } from '../../hooks/useRoles';

const RolesPage = () => {
  const { queryRequest, handleQuickSearch, setQueryRequest, resetQueryRequest, handlePageChange } =
    usePagingQueryRequest({
      page: 0,
      size: 20,
    });

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
    roles: data,
    isLoadingRoles,
    rolesError,
    getRoles,
    createRole,
    isCreatingRole,
    createRoleError,
    updateRole,
    isUpdatingRole,
    updateRoleError,
    deleteRole,
    isDeletingRole,
    deleteRoleError,
    assignRole,
    isAssigningRole,
    assignRoleError,
    revokeRole,
    isRevokingRole,
    revokeRoleError,
    getRolePermissionsQuery,
    updateRolePermissions,
    isUpdatingPermissions,
    updatePermissionsError,
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
      const updatedRole = await updateRole({ roleId: selectedRole.id, roleData: formData });
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
      await updateRolePermissions({ roleId, permissions });
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
      const permissions = await getRolePermissionsQuery.refetch(role.id);
      setSelectedRole(role);
      setFormData(prev => ({
        ...prev,
        permissions: permissions.data?.permissions || [],
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

  return (
    <Stack direction='column' gap={2}>

      {!hasPermission('roles.view') && (
        <Alert severity='error'>
          <Typography variant='h4' gutterBottom>Access Denied</Typography>
          <Typography>You do not have permission to view roles details.</Typography>
        </Alert>
      )}

      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Stack direction='row' spacing={2}>
          {hasPermission('roles.create') && (
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => openRoleModal()}
              disabled={isCreatingRole}
            >
              {isCreatingRole ? 'Creating...' : 'Create Role'}
            </Button>
          )}
        </Stack>

        <QuickSearchBar
          width='250'
          onSearch={handleQuickSearch}
          placeholder={'Search Name ...'}
        />
      </Stack>

      {(rolesError || createRoleError || updateRoleError || deleteRoleError) && (
        <Alert severity='error'>
          {rolesError?.message || createRoleError?.message || updateRoleError?.message || deleteRoleError?.message}
        </Alert>
      )}

      <Stack direction='column'>
        <SearchCriteriaBar
          sx={{
            borderRadius: 0,
          }}
          disabled={isLoadingRoles}
          onRefresh={getRoles}>
          <SearchCriteriaItem label={'Total Records'} value={roles?.length ?? 0} />
          <SearchCriteriaItem
            label={'Account'}
            value={queryRequest.account}
          />
          <SearchCriteriaItem label={'Name'} value={queryRequest.name} />
        </SearchCriteriaBar>

        {(isLoadingRoles || isCreatingRole || isUpdatingRole || isDeletingRole) && <LinearProgress />}

        <PerfectScrollbar>
          <Box sx={{ minWidth: 1050, minHeight: 500 }}>
            <Table>
              {roles?.length === 0 && <caption>No roles found</caption>}
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles?.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Avatar>
                          <ShieldIcon />
                        </Avatar>
                        <Typography>{role.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <Stack direction='row' spacing={1}>
                        {role.permissions?.map((permission) => (
                          <Chip
                            key={permission.id}
                            label={permission.name}
                            size="small"
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell align='right'>
                      <IconButton
                        onClick={() => openRoleModal(role)}
                        disabled={isUpdatingRole}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteRole(role)}
                        disabled={isDeletingRole}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </PerfectScrollbar>
      </Stack>

      {/* Role Modal */}
      <Dialog
        open={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedRole ? 'Edit Role' : 'Create Role'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              disabled={isCreatingRole || isUpdatingRole}
            />
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
              disabled={isCreatingRole || isUpdatingRole}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsRoleModalOpen(false)}
            disabled={isCreatingRole || isUpdatingRole}
          >
            Cancel
          </Button>
          <Button
            onClick={selectedRole ? handleUpdateRole : handleCreateRole}
            variant="contained"
            disabled={isCreatingRole || isUpdatingRole}
          >
            {isCreatingRole ? 'Creating...' : isUpdatingRole ? 'Updating...' : selectedRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Modal */}
      <Dialog
        open={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Manage Permissions</DialogTitle>
        <DialogContent>
          {selectedRole && (
            <PermissionsForm
              roleId={selectedRole.id}
              permissions={formData.permissions}
              onPermissionsChange={(newPermissions) => {
                setFormData(prev => ({
                  ...prev,
                  permissions: newPermissions
                }));
              }}
              disabled={isUpdatingPermissions}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsPermissionsModalOpen(false)}
            disabled={isUpdatingPermissions}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleUpdatePermissions(selectedRole.id, formData.permissions)}
            variant="contained"
            disabled={isUpdatingPermissions}
          >
            {isUpdatingPermissions ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default RolesPage;
