import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../hooks/useOrganization';
import { usePermissions } from '../../hooks/usePermissions';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    defaultRole: 'user',
    requireApproval: true,
    autoSync: true,
    syncInterval: 'daily',
    notificationEmail: '',
    auditLogRetention: '90',
    maxLoginAttempts: '5',
    sessionTimeout: '30',
  });

  const { organization, logAuditEvent } = useAuth();
  const { hasPermission } = usePermissions();

  const {
    getOrganizationSettings,
    updateOrganizationSettings,
  } = useOrganization();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getOrganizationSettings();
        setSettings(data);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    if (organization?.id) {
      fetchSettings();
    }
  }, [organization?.id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await updateOrganizationSettings(settings);
      logAuditEvent(
        'settings_updated',
        'organization',
        organization.id.toString(),
        { settings }
      );
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  if (!hasPermission('settings.manage')) {
    return (
      <Box p={4}>
        <Typography variant="h4" gutterBottom>Access Denied</Typography>
        <Typography>You do not have permission to manage settings.</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Organization Settings</Typography>

      <Card>
        <CardContent>
          <Stack spacing={4}>
            <Box>
              <Typography variant="h6" gutterBottom>General Settings</Typography>
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Default Role for New Users</InputLabel>
                  <Select
                    name="defaultRole"
                    value={settings.defaultRole}
                    onChange={handleInputChange}
                    label="Default Role for New Users"
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="maintainer">Maintainer</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      name="requireApproval"
                      checked={settings.requireApproval}
                      onChange={handleInputChange}
                    />
                  }
                  label="Require Approval for New Users"
                />
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>Sync Settings</Typography>
              <Stack spacing={3}>
                <FormControlLabel
                  control={
                    <Switch
                      name="autoSync"
                      checked={settings.autoSync}
                      onChange={handleInputChange}
                    />
                  }
                  label="Auto Sync with GitHub"
                />

                <FormControl fullWidth>
                  <InputLabel>Sync Interval</InputLabel>
                  <Select
                    name="syncInterval"
                    value={settings.syncInterval}
                    onChange={handleInputChange}
                    label="Sync Interval"
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>Notification Settings</Typography>
              <Stack spacing={3}>
                <TextField
                  label="Notification Email"
                  name="notificationEmail"
                  value={settings.notificationEmail}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>Security Settings</Typography>
              <Stack spacing={3}>
                <TextField
                  label="Audit Log Retention (days)"
                  name="auditLogRetention"
                  type="number"
                  value={settings.auditLogRetention}
                  onChange={handleInputChange}
                  inputProps={{ min: 1, max: 365 }}
                  fullWidth
                />

                <TextField
                  label="Max Login Attempts"
                  name="maxLoginAttempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={handleInputChange}
                  inputProps={{ min: 1, max: 10 }}
                  fullWidth
                />

                <TextField
                  label="Session Timeout (minutes)"
                  name="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={handleInputChange}
                  inputProps={{ min: 5, max: 120 }}
                  fullWidth
                />
              </Stack>
            </Box>

            <Button
              variant="contained"
              onClick={handleSaveSettings}
              sx={{ alignSelf: 'flex-start' }}
            >
              Save Settings
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage; 