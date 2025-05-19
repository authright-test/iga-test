import React, { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  LinearProgress,
  Menu,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { QuickSearchBar } from '../../components/common/quick-search-bar';
import { SearchCriteriaBar, SearchCriteriaItem } from '../../components/common/search-criteria-bar';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { usePermissions } from '../../hooks/usePermissions';
import { useOrganizationPage, useOrganization } from '../../hooks/useOrganization';

const OrganizationPage = () => {
  const { logAuditEvent } = useAuth();
  const { hasPermission } = usePermissions();

  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    location: '',
    email: '',
    plan: 'free',
    status: 'active',
    defaultRepositoryPermission: 'read',
    membersCanCreateRepositories: true,
    twoFactorRequirementEnabled: false,
    samlEnabled: false
  });

  const {
    queryRequest,
    handleQuickSearch,
    setQueryRequest,
    resetQueryRequest,
    handlePageChange,
    organizations,
    isLoadingOrganizations,
    organizationsError,
    getOrganizations,
  } = useOrganizationPage();

  const {
    createOrganization,
    isCreatingOrganization,
    createOrganizationError,
    updateOrganization,
    isUpdatingOrganization,
    updateOrganizationError,
    deleteOrganization,
    isDeletingOrganization,
    deleteOrganizationError,
    useOrganizationMembers,
    updateOrganizationMembers,
    isUpdatingMembers,
    updateMembersError,
  } = useOrganization();

  const handleCreateOrg = async () => {
    try {
      if (!formData.name || !formData.email) {
        console.error('Name and email are required');
        return;
      }

      const newOrg = await createOrganization(formData);
      logAuditEvent(
        'organization_created',
        'organization',
        newOrg.id.toString(),
        { name: formData.name }
      );
      setIsOrgModalOpen(false);
    } catch (err) {
      console.error('Error creating organization:', err);
    }
  };

  const handleUpdateOrg = async () => {
    try {
      if (!selectedOrg) return;
      const updatedOrg = await updateOrganization({
        organizationId: selectedOrg.id,
        organizationData: formData
      });
      logAuditEvent(
        'organization_updated',
        'organization',
        selectedOrg.id.toString(),
        { name: formData.name }
      );
      setIsOrgModalOpen(false);
    } catch (err) {
      console.error('Error updating organization:', err);
    }
  };

  const handleDeleteOrg = async (org) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        await deleteOrganization(org.id);
        logAuditEvent(
          'organization_deleted',
          'organization',
          org.id.toString(),
          { name: org.name }
        );
      } catch (err) {
        console.error('Error deleting organization:', err);
      }
    }
  };

  const handleManageMembers = async (org) => {
    try {
      setSelectedOrg(org);
      setIsMemberModalOpen(true);
    } catch (err) {
      console.error('Error loading members:', err);
    }
  };

  const openOrgModal = (org = null) => {
    if (org) {
      setSelectedOrg(org);
      setFormData({
        name: org.name,
        description: org.description,
        website: org.website,
        location: org.location,
        email: org.email,
        plan: org.plan,
        status: org.status,
        defaultRepositoryPermission: org.defaultRepositoryPermission,
        membersCanCreateRepositories: org.membersCanCreateRepositories,
        twoFactorRequirementEnabled: org.twoFactorRequirementEnabled,
        samlEnabled: org.samlEnabled
      });
    } else {
      setSelectedOrg(null);
      setFormData({
        name: '',
        description: '',
        website: '',
        location: '',
        email: '',
        plan: 'free',
        status: 'active',
        defaultRepositoryPermission: 'read',
        membersCanCreateRepositories: true,
        twoFactorRequirementEnabled: false,
        samlEnabled: false
      });
    }
    setIsOrgModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMenuOpen = (event, org) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrg(org);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrg(null);
  };

  if (!hasPermission('organization.view')) {
    return (
      <Alert severity='error'>
        <Typography variant='h4' gutterBottom>Access Denied</Typography>
        <Typography>You do not have permission to view organization details.</Typography>
      </Alert>
    );
  }

  return (
    <Stack direction='column' gap={2}>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Stack direction='row' spacing={2}>
          {hasPermission('organization.create') && (
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => openOrgModal()}
              disabled={isCreatingOrganization}
            >
              {isCreatingOrganization ? 'Creating...' : 'Create Organization'}
            </Button>
          )}
        </Stack>

        <QuickSearchBar
          width='250'
          onSearch={handleQuickSearch}
          placeholder={'Search Organization, Email ...'}
        />
      </Stack>

      {(organizationsError || createOrganizationError || updateOrganizationError || deleteOrganizationError) && (
        <Alert severity='error'>
          {organizationsError?.message || createOrganizationError?.message || updateOrganizationError?.message || deleteOrganizationError?.message}
        </Alert>
      )}

      <Stack direction='column'>
        <SearchCriteriaBar
          sx={{ borderRadius: 0 }}
          disabled={isLoadingOrganizations}
          onRefresh={getOrganizations}
        >
          <SearchCriteriaItem label={'Total Records'} value={organizations?.totalElements} />
          <SearchCriteriaItem label={'Plan'} value={queryRequest.plan} />
          <SearchCriteriaItem label={'Status'} value={queryRequest.status} />
        </SearchCriteriaBar>

        {(isLoadingOrganizations || isCreatingOrganization || isUpdatingOrganization || isDeletingOrganization) &&
          <LinearProgress />}

        <PerfectScrollbar>
          <Box sx={{ minHeight: 'calc(100vh - 320px)', backgroundColor: 'white' }}>
            <Table>
              {organizations?.content?.length === 0 && <caption>No organizations found</caption>}
              <TableHead>
                <TableRow hover>
                  <TableCell>Organization</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {organizations?.content?.map((org) => (
                  <TableRow key={org.id} hover>
                    <TableCell>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Avatar src={org.avatar}>{org.name[0]}</Avatar>
                        <Typography>{org.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{org.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={org.plan}
                        color={org.plan === 'enterprise' ? 'primary' : 'default'}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={org.status}
                        color={org.status === 'active' ? 'success' : 'error'}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>{org.location}</TableCell>
                    <TableCell align='right'>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, org)}
                        disabled={isUpdatingOrganization || isDeletingOrganization}
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

        {organizations && (
          <Stack direction='row' justifyContent='center' pt={2}>
            <Pagination
              color='primary'
              shape='circular'
              onChange={(event, value) => handlePageChange(value - 1)}
              count={organizations.totalPages}
              page={queryRequest.page + 1}
            />
          </Stack>
        )}
      </Stack>

      {/* Organization Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {hasPermission('organization.edit') && (
          <MenuItem onClick={() => {
            handleMenuClose();
            openOrgModal(selectedOrg);
          }}>
            <EditIcon fontSize='small' sx={{ mr: 1 }} />
            Edit Organization
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          handleMenuClose();
          handleManageMembers(selectedOrg);
        }}>
          <BusinessIcon fontSize='small' sx={{ mr: 1 }} />
          Manage Members
        </MenuItem>
        {hasPermission('organization.delete') && (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              handleDeleteOrg(selectedOrg);
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize='small' sx={{ mr: 1 }} />
            Delete Organization
          </MenuItem>
        )}
      </Menu>

      {/* Organization Modal */}
      <Dialog
        open={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          {selectedOrg ? 'Edit Organization' : 'Create Organization'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label='Organization Name'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={isCreatingOrganization || isUpdatingOrganization}
            />
            <TextField
              label='Description'
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={4}
              disabled={isCreatingOrganization || isUpdatingOrganization}
            />
            <TextField
              label='Website'
              name='website'
              value={formData.website}
              onChange={handleInputChange}
              fullWidth
              disabled={isCreatingOrganization || isUpdatingOrganization}
            />
            <TextField
              label='Location'
              name='location'
              value={formData.location}
              onChange={handleInputChange}
              fullWidth
              disabled={isCreatingOrganization || isUpdatingOrganization}
            />
            <TextField
              label='Email'
              name='email'
              type='email'
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={isCreatingOrganization || isUpdatingOrganization}
            />
            <FormControl fullWidth>
              <InputLabel>Plan</InputLabel>
              <Select
                name='plan'
                value={formData.plan}
                onChange={handleInputChange}
                label='Plan'
                disabled={isCreatingOrganization || isUpdatingOrganization}
              >
                <MenuItem value='free'>Free</MenuItem>
                <MenuItem value='pro'>Pro</MenuItem>
                <MenuItem value='enterprise'>Enterprise</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name='status'
                value={formData.status}
                onChange={handleInputChange}
                label='Status'
                disabled={isCreatingOrganization || isUpdatingOrganization}
              >
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
                <MenuItem value='suspended'>Suspended</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Default Repository Permission</InputLabel>
              <Select
                name='defaultRepositoryPermission'
                value={formData.defaultRepositoryPermission}
                onChange={handleInputChange}
                label='Default Repository Permission'
                disabled={isCreatingOrganization || isUpdatingOrganization}
              >
                <MenuItem value='read'>Read</MenuItem>
                <MenuItem value='write'>Write</MenuItem>
                <MenuItem value='admin'>Admin</MenuItem>
                <MenuItem value='none'>None</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.membersCanCreateRepositories}
                  onChange={(e) => handleInputChange({
                    target: {
                      name: 'membersCanCreateRepositories',
                      value: e.target.checked
                    }
                  })}
                  disabled={isCreatingOrganization || isUpdatingOrganization}
                />
              }
              label="Members can create repositories"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.twoFactorRequirementEnabled}
                  onChange={(e) => handleInputChange({
                    target: {
                      name: 'twoFactorRequirementEnabled',
                      value: e.target.checked
                    }
                  })}
                  disabled={isCreatingOrganization || isUpdatingOrganization}
                />
              }
              label="Require two-factor authentication"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.samlEnabled}
                  onChange={(e) => handleInputChange({
                    target: {
                      name: 'samlEnabled',
                      value: e.target.checked
                    }
                  })}
                  disabled={isCreatingOrganization || isUpdatingOrganization}
                />
              }
              label="Enable SAML SSO"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsOrgModalOpen(false)}
            disabled={isCreatingOrganization || isUpdatingOrganization}
          >
            Cancel
          </Button>
          <Button
            onClick={selectedOrg ? handleUpdateOrg : handleCreateOrg}
            variant='contained'
            disabled={isCreatingOrganization || isUpdatingOrganization}
          >
            {isCreatingOrganization ? 'Creating...' : isUpdatingOrganization ? 'Updating...' : selectedOrg ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Members Modal */}
      <Dialog
        open={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Manage Organization Members</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Add your members management UI here */}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsMemberModalOpen(false)}
            disabled={isUpdatingMembers}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              // Implement member update logic
            }}
            variant='contained'
            disabled={isUpdatingMembers}
          >
            {isUpdatingMembers ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default OrganizationPage;
