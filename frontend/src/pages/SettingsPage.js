import { toaster } from '@/components/ui/toaster';
import { Box, Button, Field, Heading, Input, Select, Stack, Switch, Text, } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../hooks/useOrganization';
import { usePermissions } from '../hooks/usePermissions';

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
        toaster.create({
          title: 'Error loading settings',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
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
      toaster.create({
        title: 'Settings updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toaster.create({
        title: 'Error updating settings',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!hasPermission('settings.manage')) {
    return (
      <Box p={4}>
        <Heading size='lg' mb={4}>Access Denied</Heading>
        <Text>You do not have permission to manage settings.</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Heading size='lg' mb={6}>Organization Settings</Heading>

      <Box

        borderWidth='1px'

        borderRadius='md'
        p={6}
      >
        <Stack direction='column' gap={6} align='stretch'>
          <Stack gap={4}>
            <Heading size='md'>General Settings</Heading>
            <Field.Root>
              <Field.Label>Default Role for New Users</Field.Label>
              <Select
                name='defaultRole'
                value={settings.defaultRole}
                onChange={handleInputChange}
              >
                <option value='user'>User</option>
                <option value='admin'>Admin</option>
                <option value='maintainer'>Maintainer</option>
              </Select>
            </Field.Root>

            <Field.Root display='flex' alignItems='center'>
              <Field.Label mb={0}>Require Approval for New Users</Field.Label>
              <Switch.Root
                name='requireApproval'
                checked={settings.requireApproval}
                onCheckedChange={handleInputChange}
              >
                <Switch.HiddenInput />
                <Switch.Control />
                <Switch.Label />
              </Switch.Root>
            </Field.Root>
          </Stack>

          <Stack gap={4}>
            <Heading size='md'>Sync Settings</Heading>
            <Field.Root display='flex' alignItems='center'>
              <Field.Label mb={0}>Auto Sync with GitHub</Field.Label>
              <Switch.Root
                name='autoSync'
                checked={settings.autoSync}
                onCheckedChange={handleInputChange}
              >
                <Switch.HiddenInput />
                <Switch.Control />
                <Switch.Label />

              </Switch.Root>
            </Field.Root>

            <Field.Root>
              <Field.Label>Sync Interval</Field.Label>
              <Select
                name='syncInterval'
                value={settings.syncInterval}
                onChange={handleInputChange}
              >
                <option value='hourly'>Hourly</option>
                <option value='daily'>Daily</option>
                <option value='weekly'>Weekly</option>
              </Select>
            </Field.Root>
          </Stack>

          <Stack gap={4}>
            <Heading size='md'>Notification Settings</Heading>
            <Field.Root>
              <Field.Label>Notification Email</Field.Label>
              <Input
                name='notificationEmail'
                value={settings.notificationEmail}
                onChange={handleInputChange}
                placeholder='Enter notification email'
              />
            </Field.Root>
          </Stack>

          <Stack gap={4}>
            <Heading size='md'>Security Settings</Heading>
            <Field.Root>
              <Field.Label>Audit Log Retention (days)</Field.Label>
              <Input
                name='auditLogRetention'
                type='number'
                value={settings.auditLogRetention}
                onChange={handleInputChange}
                min='1'
                max='365'
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Max Login Attempts</Field.Label>
              <Input
                name='maxLoginAttempts'
                type='number'
                value={settings.maxLoginAttempts}
                onChange={handleInputChange}
                min='1'
                max='10'
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Session Timeout (minutes)</Field.Label>
              <Input
                name='sessionTimeout'
                type='number'
                value={settings.sessionTimeout}
                onChange={handleInputChange}
                min='5'
                max='120'
              />
            </Field.Root>
          </Stack>

          <Button
            colorScheme='blue'
            onClick={handleSaveSettings}
            alignSelf='flex-start'
          >
            Save Settings
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default SettingsPage;
