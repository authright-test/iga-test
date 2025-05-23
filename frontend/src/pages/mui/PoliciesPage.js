import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAutomationPolicies } from '../../hooks/useAutomationPolicies';
import { usePermissions } from '../../hooks/usePermissions';

const PoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'repository',
    enabled: true,
    rules: [],
  });

  const { logAuditEvent } = useAuth();
  const { hasPermission } = usePermissions();
  const { getPolicies, createPolicy, updatePolicy, deletePolicy } = useAutomationPolicies();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      const data = await getPolicies();
      setPolicies(data);
      setError(null);
    } catch (err) {
      setError('Failed to load policies');
      console.error('Error loading policies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePolicy = async () => {
    try {
      const newPolicy = await createPolicy(formData);
      logAuditEvent(
        'policy_created',
        'policy',
        newPolicy.id.toString(),
        { name: formData.name }
      );
      setIsPolicyModalOpen(false);
      fetchPolicies();
    } catch (err) {
      console.error('Error creating policy:', err);
    }
  };

  const handleUpdatePolicy = async () => {
    try {
      if (!selectedPolicy) return;
      const updatedPolicy = await updatePolicy(selectedPolicy.id, formData);
      logAuditEvent(
        'policy_updated',
        'policy',
        selectedPolicy.id.toString(),
        { name: formData.name }
      );
      setIsPolicyModalOpen(false);
      fetchPolicies();
    } catch (err) {
      console.error('Error updating policy:', err);
    }
  };

  const handleDeletePolicy = async (policy) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await deletePolicy(policy.id);
        logAuditEvent(
          'policy_deleted',
          'policy',
          policy.id.toString(),
          { name: policy.name }
        );
        fetchPolicies();
      } catch (err) {
        console.error('Error deleting policy:', err);
      }
    }
  };

  const openPolicyModal = (policy = null) => {
    if (policy) {
      setSelectedPolicy(policy);
      setFormData({
        name: policy.name,
        description: policy.description,
        type: policy.type,
        enabled: policy.enabled,
        rules: policy.rules,
      });
    } else {
      setSelectedPolicy(null);
      setFormData({
        name: '',
        description: '',
        type: 'repository',
        enabled: true,
        rules: [],
      });
    }
    setIsPolicyModalOpen(true);
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
          Policies
        </Typography>
        {hasPermission('policies.create') && (
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => openPolicyModal()}
          >
            Create Policy
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
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell>{policy.name}</TableCell>
                <TableCell>{policy.description}</TableCell>
                <TableCell>
                  <Chip
                    label={policy.type}
                    color={policy.type === 'repository' ? 'primary' : 'secondary'}
                    size='small'
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={policy.enabled ? 'Enabled' : 'Disabled'}
                    color={policy.enabled ? 'success' : 'error'}
                    size='small'
                  />
                </TableCell>
                <TableCell align='right'>
                  <Stack direction='row' spacing={1} justifyContent='flex-end'>
                    {hasPermission('policies.edit') && (
                      <IconButton
                        size='small'
                        onClick={() => openPolicyModal(policy)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    {hasPermission('policies.delete') && (
                      <IconButton
                        size='small'
                        color='error'
                        onClick={() => handleDeletePolicy(policy)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Policy Modal */}
      <Dialog
        open={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          {selectedPolicy ? 'Edit Policy' : 'Create Policy'}
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
            <FormControlLabel
              control={
                <Switch
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                />
              }
              label='Enabled'
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPolicyModalOpen(false)}>Cancel</Button>
          <Button
            onClick={selectedPolicy ? handleUpdatePolicy : handleCreatePolicy}
            variant='contained'
          >
            {selectedPolicy ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PoliciesPage;
