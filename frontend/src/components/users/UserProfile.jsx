import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  GitHub as GitHubIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useUser } from '../../../hooks/useUser';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    team: '',
  });

  const { logAuditEvent } = useAuth();
  const { getUser, updateUser } = useUser();

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await getUser(userId);
      setUser(userData);
      setFormData({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        team: userData.team,
      });
    } catch (err) {
      setError('Failed to load user data');
      console.error('Error loading user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await updateUser(userId, formData);
      setUser(updatedUser);
      logAuditEvent(
        'user_updated',
        'user',
        userId.toString(),
        { name: formData.name }
      );
      setIsEditModalOpen(false);
    } catch (err) {
      setError('Failed to update user profile');
      console.error('Error updating user profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (isLoading && !user) {
    return (
      <Box p={4} display='flex' justifyContent='center' alignItems='center'>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !user) {
    return (
      <Box p={4}>
        <Typography variant='h4' color='error' gutterBottom>
          Error
        </Typography>
        <Typography>{error}</Typography>
        <Button
          variant='contained'
          onClick={loadUserData}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box p={4}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={3} alignItems='center'>
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  sx={{ width: 120, height: 120 }}
                />
                <Typography variant='h5'>{user.name}</Typography>
                <Typography color='text.secondary'>{user.email}</Typography>
                <Stack direction='row' spacing={1}>
                  <Chip
                    icon={<SecurityIcon />}
                    label={user.role}
                    color='primary'
                  />
                  <Chip
                    icon={<GroupIcon />}
                    label={user.team}
                    color='secondary'
                  />
                </Stack>
                <Button
                  variant='outlined'
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit Profile
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
              >
                <Tab label='Activity' />
                <Tab label='Permissions' />
                <Tab label='GitHub' />
              </Tabs>

              {activeTab === 0 && (
                <List>
                  {user?.activity?.map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText
                          primary={activity.action}
                          secondary={new Date(activity.timestamp).toLocaleString()}
                        />
                      </ListItem>
                      {index < user.activity.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}

              {activeTab === 1 && (
                <Stack spacing={2}>
                  <Typography variant='subtitle1' gutterBottom>
                    Role Permissions
                  </Typography>
                  <List>
                    {user?.permissions?.map((permission, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={permission.name}
                          secondary={permission.description}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Stack>
              )}

              {activeTab === 2 && (
                <Stack spacing={2}>
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <GitHubIcon />
                    <Typography variant='subtitle1'>
                      GitHub Integration
                    </Typography>
                  </Stack>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary='GitHub Username'
                        secondary={user.githubUsername}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary='Last Sync'
                        secondary={new Date(user.lastSync).toLocaleString()}
                      />
                    </ListItem>
                  </List>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Modal */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label='Name'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label='Email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label='Role'
              name='role'
              value={formData.role}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label='Team'
              name='team'
              value={formData.team}
              onChange={handleInputChange}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateProfile}
            variant='contained'
            disabled={isLoading}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;
