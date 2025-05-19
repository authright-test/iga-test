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
  InputLabel,
  LinearProgress,
  Menu,
  MenuItem,
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
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { QuickSearchBar } from '../../components/common/quick-search-bar';
import { SearchCriteriaBar, SearchCriteriaItem } from '../../components/common/search-criteria-bar';
import { usePagingQueryRequest } from '../../components/common/usePagingQueryRequest';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useOrganization } from '../../hooks/useOrganization';
import { usePermissions } from '../../hooks/usePermissions';

const OrganizationPage = () => {
  const { queryRequest, handleQuickSearch, setQueryRequest, resetQueryRequest, handlePageChange } =
    usePagingQueryRequest({
      page: 0,
      size: 20,
    });
  const [data, setData] = useState({});
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    location: '',
    email: '',
    plan: 'free',
    status: 'active',
  });
  const [anchorEl, setAnchorEl] = useState(null);

  const { organization, logAuditEvent } = useAuth();
  const { hasPermission } = usePermissions();

  const {
    organizations,
    isLoading,
    error,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizations,
    addMember,
    removeMember,
    updateMemberRole,
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
      const updatedOrg = await updateOrganization(selectedOrg.id, formData);
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

  return (
    <Stack direction='column' gap={2}>
      {!hasPermission('organization.view') && (
        <Alert severity='error'>
          <Typography variant='h4' gutterBottom>Access Denied</Typography>
          <Typography>You do not have permission to view organization details.</Typography>
        </Alert>
      )}

      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Stack direction='row' spacing={2}>
          {hasPermission('organization.create') && (
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => openOrgModal()}
            >
              Create Organization
            </Button>
          )}
        </Stack>

        <QuickSearchBar
          width='250'
          onSearch={handleQuickSearch}
          placeholder={'Search Organization, Email ...'}
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
          onRefresh={getOrganizations}>
          <SearchCriteriaItem label={'Total Records'} value={data?.totalElements ?? 0} />
          <SearchCriteriaItem
            label={'Plan'}
            value={queryRequest.plan}
          />
          <SearchCriteriaItem label={'Status'} value={queryRequest.status} />
        </SearchCriteriaBar>

        {(isLoading) && <LinearProgress />}
        <PerfectScrollbar>
          <Box sx={{ minWidth: 1050, minHeight: 500 }}>
            <Table>
              {data?.content?.length === 0 && <caption>Empty</caption>}
              <TableHead>
                <TableRow>
                  <TableCell>Organization</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.content?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Avatar src={item.avatar}>{item.name[0]}</Avatar>
                        <Typography>{item.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.plan}
                        color={item.plan === 'enterprise' ? 'primary' : 'default'}
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
                    <TableCell>{item.location}</TableCell>
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
              required
            />
            <FormControl fullWidth>
              <InputLabel>Plan</InputLabel>
              <Select
                name='plan'
                value={formData.plan}
                onChange={handleInputChange}
                label='Plan'
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
              >
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
                <MenuItem value='suspended'>Suspended</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOrgModalOpen(false)}>Cancel</Button>
          <Button
            onClick={selectedOrg ? handleUpdateOrg : handleCreateOrg}
            variant='contained'
          >
            {selectedOrg ? 'Update' : 'Create'}
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
          <Button onClick={() => setIsMemberModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default OrganizationPage;
