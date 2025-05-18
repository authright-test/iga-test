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
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { usePolicies } from '../../hooks/usePolicies';

const PolicyManager = () => {
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'branch',
    enabled: true,
    conditions: [],
    actions: [],
  });

  const { logAuditEvent } = useAuth();
  const { hasPermission } = usePermissions();

  const {
    policies,
    isLoading,
    error,
    createPolicy,
    updatePolicy,
    deletePolicy,
    enablePolicy,
    disablePolicy,
  } = usePolicies();

  const handleCreatePolicy = async () => {
    try {
      if (!formData.name) {
        console.error('Policy name is required');
        return;
      }

      const newPolicy = await createPolicy(formData);
      logAuditEvent(
        'policy_created',
        'policy',
        newPolicy.id.toString(),
        { name: formData.name }
      );
      setIsPolicyModalOpen(false);
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
      } catch (err) {
        console.error('Error deleting policy:', err);
      }
    }
  };

  const handleTogglePolicy = async (policy) => {
    try {
      if (policy.enabled) {
        await disablePolicy(policy.id);
        logAuditEvent(
          'policy_disabled',
          'policy',
          policy.id.toString(),
          { name: policy.name }
        );
      } else {
        await enablePolicy(policy.id);
        logAuditEvent(
          'policy_enabled',
          'policy',
          policy.id.toString(),
          { name: policy.name }
        );
      }
    } catch (err) {
      console.error('Error toggling policy:', err);
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
        conditions: policy.conditions || [],
        actions: policy.actions || [],
      });
    } else {
      setSelectedPolicy(null);
      setFormData({
        name: '',
        description: '',
        type: 'branch',
        enabled: true,
        conditions: [],
        actions: [],
      });
    }
    setIsPolicyModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (isLoading) {
    return (
      <Box p={4}>
        <Typography variant='h4' gutterBottom>Loading policies...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography variant='h4' gutterBottom>Error loading policies</Typography>
        <Typography color='error'>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Stack direction='row' justifyContent='space-between' alignItems='center' mb={4}>
        <Typography variant='h4'>Policies</Typography>
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

      <Grid container spacing={3}>
        {policies.map((policy) => (
          <Grid item xs={12} md={6} lg={4} key={policy.id}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction='row' justifyContent='space-between' alignItems='center'>
                    <Typography variant='h6'>{policy.name}</Typography>
                    <Stack direction='row' spacing={1}>
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
                  </Stack>

                  <Typography variant='body2' color='text.secondary'>
                    {policy.description}
                  </Typography>

                  <Box>
                    <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                      Type
                    </Typography>
                    <Chip
                      label={policy.type}
                      color='primary'
                      size='small'
                    />
                  </Box>

                  <Box>
                    <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                      Status
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={policy.enabled}
                          onChange={() => handleTogglePolicy(policy)}
                          disabled={!hasPermission('policies.edit')}
                        />
                      }
                      label={policy.enabled ? 'Enabled' : 'Disabled'}
                    />
                  </Box>

                  <Box>
                    <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                      Conditions
                    </Typography>
                    <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                      {policy.conditions?.map((condition, index) => (
                        <Chip
                          key={index}
                          label={condition}
                          size='small'
                          variant='outlined'
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                      Actions
                    </Typography>
                    <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                      {policy.actions?.map((action, index) => (
                        <Chip
                          key={index}
                          label={action}
                          size='small'
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
              label='Policy Name'
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
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name='type'
                value={formData.type}
                onChange={handleInputChange}
                label='Type'
              >
                <MenuItem value='branch'>Branch Protection</MenuItem>
                <MenuItem value='commit'>Commit Signing</MenuItem>
                <MenuItem value='review'>Code Review</MenuItem>
                <MenuItem value='security'>Security Scan</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  name='enabled'
                  checked={formData.enabled}
                  onChange={handleInputChange}
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
            {selectedPolicy ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PolicyManager;
