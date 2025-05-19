import React, { useState } from 'react';
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
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
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
  PlayArrow as PlayIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useAutomationPolicies } from '../../hooks/useAutomationPolicies';
import { usePermissions } from '../../hooks/usePermissions';

const AutomationPoliciesPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    trigger: '',
    conditions: [],
    actions: [],
    isEnabled: true,
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
    runPolicy,
  } = useAutomationPolicies();

  const handleCreatePolicy = () => {
    createPolicy(newPolicy);
    setIsCreateDialogOpen(false);
    setNewPolicy({
      name: '',
      description: '',
      trigger: '',
      conditions: [],
      actions: [],
      isEnabled: true,
    });
  };

  const handleUpdatePolicy = () => {
    updatePolicy(selectedPolicy.id, selectedPolicy);
    setIsEditDialogOpen(false);
  };

  const handleDeletePolicy = (policyId) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      deletePolicy(policyId);
    }
  };

  const handleEnablePolicy = (policyId) => {
    enablePolicy(policyId);
  };

  const handleDisablePolicy = (policyId) => {
    disablePolicy(policyId);
  };

  const handleRunPolicy = (policyId) => {
    runPolicy(policyId);
  };

  if (!hasPermission('automation_policies.view')) {
    return (
      <Box p={4}>
        <Typography variant='h4' gutterBottom>Access Denied</Typography>
        <Typography>You do not have permission to view automation policies.</Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box p={4}>
        <Typography variant='h4' gutterBottom>Loading automation policies...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography variant='h4' gutterBottom>Error loading automation policies</Typography>
        <Typography color='error'>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Stack direction='row' justifyContent='space-between' alignItems='center' mb={4}>
        <Typography variant='h4'>Automation Policies</Typography>
        {hasPermission('automation_policies.create') && (
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create Policy
          </Button>
        )}
      </Stack>

      <Grid container spacing={3}>
        {policies?.map((policy) => (
          <Grid item xs={12} md={6} lg={4} key={policy.id}>
            <Card>
              <CardHeader
                title={policy.name}
                subheader={policy.description}
                action={
                  <Stack direction='row' spacing={1}>
                    {hasPermission('automation_policies.edit') && (
                      <IconButton
                        onClick={() => {
                          setSelectedPolicy(policy);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    {hasPermission('automation_policies.delete') && (
                      <IconButton onClick={() => handleDeletePolicy(policy.id)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>
                }
              />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Trigger
                    </Typography>
                    <Typography variant='body2'>{policy.trigger}</Typography>
                  </Box>

                  <Box>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Conditions
                    </Typography>
                    <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                      {policy?.conditions?.map((condition, index) => (
                        <Chip
                          key={index}
                          label={condition}
                          size='small'
                          color='primary'
                          variant='outlined'
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Actions
                    </Typography>
                    <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                      {policy?.actions?.map((action, index) => (
                        <Chip
                          key={index}
                          label={action}
                          size='small'
                          color='secondary'
                          variant='outlined'
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Divider />

                  <Stack direction='row' spacing={2} justifyContent='space-between'>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={policy.isEnabled}
                          onChange={() =>
                            policy.isEnabled
                              ? handleDisablePolicy(policy.id)
                              : handleEnablePolicy(policy.id)
                          }
                          disabled={!hasPermission('automation_policies.edit')}
                        />
                      }
                      label='Enabled'
                    />
                    {hasPermission('automation_policies.run') && (
                      <Button
                        variant='outlined'
                        startIcon={<PlayIcon />}
                        onClick={() => handleRunPolicy(policy.id)}
                      >
                        Run Now
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Policy Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Create Automation Policy</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label='Name'
              value={newPolicy.name}
              onChange={(e) =>
                setNewPolicy((prev) => ({ ...prev, name: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label='Description'
              value={newPolicy.description}
              onChange={(e) =>
                setNewPolicy((prev) => ({ ...prev, description: e.target.value }))
              }
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Trigger</InputLabel>
              <Select
                value={newPolicy.trigger}
                onChange={(e) =>
                  setNewPolicy((prev) => ({ ...prev, trigger: e.target.value }))
                }
                label='Trigger'
              >
                <MenuItem value='on_push'>On Push</MenuItem>
                <MenuItem value='on_pull_request'>On Pull Request</MenuItem>
                <MenuItem value='on_merge'>On Merge</MenuItem>
                <MenuItem value='on_schedule'>On Schedule</MenuItem>
              </Select>
            </FormControl>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={newPolicy.isEnabled}
                    onChange={(e) =>
                      setNewPolicy((prev) => ({
                        ...prev,
                        isEnabled: e.target.checked,
                      }))
                    }
                  />
                }
                label='Enabled'
              />
            </FormGroup>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreatePolicy} variant='contained'>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Policy Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Edit Automation Policy</DialogTitle>
        <DialogContent>
          {selectedPolicy && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label='Name'
                value={selectedPolicy.name}
                onChange={(e) =>
                  setSelectedPolicy((prev) => ({ ...prev, name: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label='Description'
                value={selectedPolicy.description}
                onChange={(e) =>
                  setSelectedPolicy((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                multiline
                rows={3}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Trigger</InputLabel>
                <Select
                  value={selectedPolicy.trigger}
                  onChange={(e) =>
                    setSelectedPolicy((prev) => ({
                      ...prev,
                      trigger: e.target.value,
                    }))
                  }
                  label='Trigger'
                >
                  <MenuItem value='on_push'>On Push</MenuItem>
                  <MenuItem value='on_pull_request'>On Pull Request</MenuItem>
                  <MenuItem value='on_merge'>On Merge</MenuItem>
                  <MenuItem value='on_schedule'>On Schedule</MenuItem>
                </Select>
              </FormControl>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedPolicy.isEnabled}
                      onChange={(e) =>
                        setSelectedPolicy((prev) => ({
                          ...prev,
                          isEnabled: e.target.checked,
                        }))
                      }
                    />
                  }
                  label='Enabled'
                />
              </FormGroup>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdatePolicy} variant='contained'>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutomationPoliciesPage;
