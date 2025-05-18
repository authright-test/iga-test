import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
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
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { usePermissions } from '../../hooks/usePermissions';

const AuditLogsPage = () => {
  const [filters, setFilters] = useState({
    action: '',
    resourceType: '',
    searchTerm: '',
  });

  const { logAuditEvent } = useAuth();
  const { hasPermission } = usePermissions();

  const {
    logs,
    isLoading,
    error,
    getLogs,
    getLogDetails,
  } = useAuditLogs();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    getLogs(filters);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'created':
        return 'success';
      case 'updated':
        return 'primary';
      case 'deleted':
        return 'error';
      case 'assigned':
        return 'secondary';
      case 'removed':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getResourceTypeColor = (type) => {
    switch (type) {
      case 'user':
        return 'primary';
      case 'team':
        return 'secondary';
      case 'repository':
        return 'success';
      case 'permission':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (!hasPermission('audit_logs.view')) {
    return (
      <Box p={4}>
        <Typography variant="h4" gutterBottom>Access Denied</Typography>
        <Typography>You do not have permission to view audit logs.</Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box p={4}>
        <Typography variant="h4" gutterBottom>Loading audit logs...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography variant="h4" gutterBottom>Error loading audit logs</Typography>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Audit Logs</Typography>

      {/* Filters */}
      <Stack direction="row" spacing={2} mb={4} flexWrap="wrap" useFlexGap>
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            name="action"
            value={filters.action}
            onChange={handleFilterChange}
            displayEmpty
          >
            <MenuItem value="">Filter by action</MenuItem>
            <MenuItem value="created">Created</MenuItem>
            <MenuItem value="updated">Updated</MenuItem>
            <MenuItem value="deleted">Deleted</MenuItem>
            <MenuItem value="assigned">Assigned</MenuItem>
            <MenuItem value="removed">Removed</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <Select
            name="resourceType"
            value={filters.resourceType}
            onChange={handleFilterChange}
            displayEmpty
          >
            <MenuItem value="">Filter by resource type</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="team">Team</MenuItem>
            <MenuItem value="repository">Repository</MenuItem>
            <MenuItem value="permission">Permission</MenuItem>
          </Select>
        </FormControl>

        <TextField
          name="searchTerm"
          value={filters.searchTerm}
          onChange={handleFilterChange}
          placeholder="Search logs..."
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          startIcon={<FilterIcon />}
          onClick={handleSearch}
        >
          Apply Filters
        </Button>
      </Stack>

      {/* Logs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Resource Type</TableCell>
              <TableCell>Resource ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(log.timestamp).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.action}
                    color={getActionColor(log.action)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.resourceType}
                    color={getResourceTypeColor(log.resourceType)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{log.resourceId}</Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={0}>
                    <Typography variant="body2">{log.user.username}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({log.user.email})
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={0}>
                    {Object.entries(log.details).map(([key, value]) => (
                      <Typography key={key} variant="caption">
                        <strong>{key}:</strong> {JSON.stringify(value)}
                      </Typography>
                    ))}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AuditLogsPage; 