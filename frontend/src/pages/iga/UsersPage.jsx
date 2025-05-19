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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  GitHub as GitHubIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { QuickSearchBar } from '../../components/common/quick-search-bar';
import { SearchCriteriaBar, SearchCriteriaItem } from '../../components/common/search-criteria-bar';
import { SimpleQueryBar } from '../../components/common/simple-query-bar';
import { usePagingQueryRequest } from '../../components/common/usePagingQueryRequest';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { usePermissions } from '../../hooks/usePermissions';
import { useUsers } from '../../hooks/useUsers';

const UsersPage = () => {

  const { queryRequest, handleQuickSearch, setQueryRequest, resetQueryRequest, handlePageChange } =
    usePagingQueryRequest({
      page: 0,
      size: 20,
    });
  const [data, setData] = useState({});

  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
    status: 'active',
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const { organization, logAuditEvent } = useAuth();
  const { hasPermission } = usePermissions();

  const {
    users,
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    getUsers,
    syncWithGitHub,
  } = useUsers();

  const handleCreateUser = async () => {
    try {
      if (!formData.username || !formData.email) {
        console.error('Username and email are required');
        return;
      }

      const newUser = await createUser(formData);
      logAuditEvent(
        'user_created',
        'user',
        newUser.id.toString(),
        { username: formData.username }
      );
      setIsUserModalOpen(false);
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (!selectedUser) return;
      const updatedUser = await updateUser(selectedUser.id, formData);
      logAuditEvent(
        'user_updated',
        'user',
        selectedUser.id.toString(),
        { username: formData.username }
      );
      setIsUserModalOpen(false);
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(user.id);
        logAuditEvent(
          'user_deleted',
          'user',
          user.id.toString(),
          { username: user.username }
        );
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleManageRoles = async (user) => {
    try {
      setSelectedUser(user);
      setIsRolesModalOpen(true);
    } catch (err) {
      console.error('Error loading roles:', err);
    }
  };

  const handleSyncWithGitHub = async () => {
    try {
      setIsSyncing(true);
      await syncWithGitHub();
      logAuditEvent(
        'users_synced',
        'user',
        'all',
        { organization: organization.name }
      );
    } catch (err) {
      console.error('Error syncing with GitHub:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const openUserModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: '',
        email: '',
        role: 'user',
        status: 'active',
      });
    }
    setIsUserModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  return (
    <Stack direction='column' gap={2}>

      {!hasPermission('users.view') && (
        <Alert severity='error'>
          <Typography variant='h4' gutterBottom>Access Denied</Typography>
          <Typography>You do not have permission to view users details.</Typography>
        </Alert>
      )}
      
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Stack direction='row' spacing={2}>
          {hasPermission('users.create') && (
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => openUserModal()}
            >
              Create User
            </Button>
          )}
          <Button
            variant='outlined'
            startIcon={<GitHubIcon />}
            onClick={handleSyncWithGitHub}
            disabled={isSyncing}
          >
            {isSyncing ? 'Syncing...' : 'Sync with GitHub'}
          </Button>
        </Stack>

        <QuickSearchBar
          width='250'
          onSearch={handleQuickSearch}
          placeholder={'Search User, Email ...'}
        />
      </Stack>

      {error && (
        <Alert severity='error'>
          {error}
        </Alert>
      )}

      <Stack direction='column'>
        <SearchCriteriaBar
          sx={{
            borderRadius: 0,
          }}
          disabled={isLoading}

          onRefresh={getUsers}>
          <SearchCriteriaItem label={'Total Records'} value={data?.totalElements ?? 0} />
          <SearchCriteriaItem
            label={'Account'}
            value={queryRequest.account}
          />
          <SearchCriteriaItem label={'Email'} value={queryRequest.email} />
        </SearchCriteriaBar>

        {(isLoading) && <LinearProgress />}
        <PerfectScrollbar>
          <Box sx={{ minWidth: 1050, minHeight: 500 }}>
            <Table>
              {data?.content?.length === 0 && <caption>Empty</caption>}
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.content?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Avatar src={item.avatarUrl}>{item.username[0]}</Avatar>
                        <Typography>{item.username}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.role}
                        color={item.role === 'admin' ? 'primary' : 'default'}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={item.status === 'active' ? 'success' : 'error'}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>{new Date(item.lastLogin).toLocaleString()}</TableCell>
                    <TableCell align='right'>
                      <IconButton
                        size='small'
                        onClick={(e) => handleMenuOpen(e, item)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </PerfectScrollbar>
      </Stack>

      {data?.totalPages > 1 && (
        <Stack direction={'row'} justifyContent={'center'} pt={2}>
          <Pagination
            color={'primary'}
            shape={'circular'}
            onChange={(event, value) => handlePageChange(value - 1)}
            count={data.totalPages ?? 0}
            page={data.page + 1}
          />
        </Stack>
      )}

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {hasPermission('users.edit') && (
          <MenuItem onClick={() => {
            handleMenuClose();
            openUserModal(selectedUser);
          }}>
            <EditIcon fontSize='small' sx={{ mr: 1 }} />
            Edit User
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          handleMenuClose();
          handleManageRoles(selectedUser);
        }}>
          <ShieldIcon fontSize='small' sx={{ mr: 1 }} />
          Manage Roles
        </MenuItem>
        {hasPermission('users.delete') && (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              handleDeleteUser(selectedUser);
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize='small' sx={{ mr: 1 }} />
            Delete User
          </MenuItem>
        )}
      </Menu>

      {/* User Modal */}
      <Dialog
        open={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Create User'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label='Username'
              name='username'
              value={formData.username}
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
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name='role'
                value={formData.role}
                onChange={handleInputChange}
                label='Role'
              >
                <MenuItem value='user'>User</MenuItem>
                <MenuItem value='admin'>Admin</MenuItem>
                <MenuItem value='maintainer'>Maintainer</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name='status'
                value={formData.status}
                onChange={handleInputChange}
                label='Status'
              >
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
                <MenuItem value='suspended'>Suspended</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
          <Button
            onClick={selectedUser ? handleUpdateUser : handleCreateUser}
            variant='contained'
          >
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Roles Modal */}
      <Dialog
        open={isRolesModalOpen}
        onClose={() => setIsRolesModalOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Manage User Roles</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Add your roles management UI here */}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRolesModalOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleUpdateRoles(selectedUser?.id, formData.roles)}
            variant='contained'
          >
            Update Roles
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default UsersPage;
