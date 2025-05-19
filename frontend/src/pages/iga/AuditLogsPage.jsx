import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputAdornment, LinearProgress,
  Menu,
  MenuItem, Pagination,
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
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { SearchCriteriaBar, SearchCriteriaItem } from '../../components/common/search-criteria-bar';
import { usePagingQueryRequest } from '../../components/common/usePagingQueryRequest';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { usePermissions } from '../../hooks/usePermissions';

const AuditLogsPage = () => {

  const { queryRequest, handleQuickSearch, setQueryRequest, resetQueryRequest, handlePageChange } =
    usePagingQueryRequest({
      page: 0,
      size: 20,
    });
  const [data, setData] = useState({});

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

  // if (!hasPermission('audit_logs.view')) {
  //   return (
  //     <Box p={4}>
  //       <Typography variant='h4' gutterBottom>Access Denied</Typography>
  //       <Typography>You do not have permission to view audit logs.</Typography>
  //     </Box>
  //   );
  // }

  return (
    <Stack direction='column' gap={2}>
      <Stack direction='row' justifyContent='center' spacing={2} flexWrap='wrap' useFlexGap>
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            name='action'
            value={filters.action}
            onChange={handleFilterChange}
            displayEmpty
          >
            <MenuItem value=''>Filter by action</MenuItem>
            <MenuItem value='created'>Created</MenuItem>
            <MenuItem value='updated'>Updated</MenuItem>
            <MenuItem value='deleted'>Deleted</MenuItem>
            <MenuItem value='assigned'>Assigned</MenuItem>
            <MenuItem value='removed'>Removed</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <Select
            name='resourceType'
            value={filters.resourceType}
            onChange={handleFilterChange}
            displayEmpty
          >
            <MenuItem value=''>Filter by resource type</MenuItem>
            <MenuItem value='user'>User</MenuItem>
            <MenuItem value='team'>Team</MenuItem>
            <MenuItem value='repository'>Repository</MenuItem>
            <MenuItem value='permission'>Permission</MenuItem>
          </Select>
        </FormControl>

        <TextField
          name='searchTerm'
          value={filters.searchTerm}
          onChange={handleFilterChange}
          placeholder='Search logs...'
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant='contained'
          startIcon={<FilterIcon />}
          onClick={handleSearch}
        >
          Apply Filters
        </Button>
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
          onRefresh={getLogs}>
          <SearchCriteriaItem label={'Total Records'} value={data?.totalElements ?? 0} />
          <SearchCriteriaItem
            label={'Account'}
            value={queryRequest.account}
          />
          <SearchCriteriaItem label={'Email'} value={queryRequest.email} />
        </SearchCriteriaBar>

        {(isLoading) && <LinearProgress />}
        <PerfectScrollbar>
          <Box sx={{ minWidth: 1050, minHeight: 500 }}>
            {/* Logs Table */}
            <Table>
              {data?.content?.length === 0 && <caption>Empty</caption>}
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
                {data?.content?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Typography variant='body2'>
                        {new Date(log.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        color={getActionColor(log.action)}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.resourceType}
                        color={getResourceTypeColor(log.resourceType)}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{log.resourceId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0}>
                        <Typography variant='body2'>{log.user.username}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          ({log.user.email})
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0}>
                        {Object.entries(log?.details)?.map(([key, value]) => (
                          <Typography key={key} variant='caption'>
                            <strong>{key}:</strong> {JSON.stringify(value)}
                          </Typography>
                        ))}
                      </Stack>
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


    </Stack>
  );
};

export default AuditLogsPage;
