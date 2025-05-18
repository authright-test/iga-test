import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuditLogs } from '../../hooks/useAuditLogs';

const AuditLogViewer = () => {
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    eventType: '',
    userId: '',
    resourceType: '',
  });

  const {
    logs,
    isLoading,
    error,
    getAuditLogs,
  } = useAuditLogs();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name) => (date) => {
    setFilters(prev => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleSearch = async () => {
    try {
      await getAuditLogs(filters);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  };

  if (isLoading) {
    return (
      <Box p={4}>
        <Typography variant='h4' gutterBottom>Loading audit logs...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography variant='h4' gutterBottom>Error loading audit logs</Typography>
        <Typography color='error'>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant='h4' gutterBottom>Audit Logs</Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <DatePicker
                label='Start Date'
                value={filters.startDate}
                onChange={handleDateChange('startDate')}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label='End Date'
                value={filters.endDate}
                onChange={handleDateChange('endDate')}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  name='eventType'
                  value={filters.eventType}
                  onChange={handleFilterChange}
                  label='Event Type'
                >
                  <MenuItem value=''>All</MenuItem>
                  <MenuItem value='create'>Create</MenuItem>
                  <MenuItem value='update'>Update</MenuItem>
                  <MenuItem value='delete'>Delete</MenuItem>
                  <MenuItem value='login'>Login</MenuItem>
                  <MenuItem value='logout'>Logout</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label='User ID'
                name='userId'
                value={filters.userId}
                onChange={handleFilterChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Resource Type</InputLabel>
                <Select
                  name='resourceType'
                  value={filters.resourceType}
                  onChange={handleFilterChange}
                  label='Resource Type'
                >
                  <MenuItem value=''>All</MenuItem>
                  <MenuItem value='user'>User</MenuItem>
                  <MenuItem value='team'>Team</MenuItem>
                  <MenuItem value='role'>Role</MenuItem>
                  <MenuItem value='repository'>Repository</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Event Type</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Resource Type</TableCell>
              <TableCell>Resource ID</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label={log.eventType}
                    color={
                      log.eventType === 'create' ? 'success' :
                        log.eventType === 'update' ? 'primary' :
                          log.eventType === 'delete' ? 'error' :
                            'default'
                    }
                    size='small'
                  />
                </TableCell>
                <TableCell>{log.user.username}</TableCell>
                <TableCell>{log.resourceType}</TableCell>
                <TableCell>{log.resourceId}</TableCell>
                <TableCell>
                  <Typography variant='body2' color='text.secondary'>
                    {JSON.stringify(log.details, null, 2)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AuditLogViewer;
