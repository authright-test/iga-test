import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  IconButton,
  Button,
  useToast,
  Spinner,
  Text,
  Badge,
  HStack,
  Select,
  Input,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  Alert,
  AlertIcon,
  Tooltip,
  Grid,
  GridItem,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FiDownload, 
  FiRefreshCw, 
  FiFilter, 
  FiSearch, 
  FiX, 
  FiActivity, 
  FiUser, 
  FiFolder, 
  FiCalendar
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AuditLogsPage = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    resourceType: '',
    startDate: '',
    endDate: '',
    searchTerm: ''
  });
  const toast = useToast();
  const { token, organization } = useAuth();
  const statBgColor = useColorModeValue('white', 'gray.700');

  // Fetch audit logs on component mount and when filters or page changes
  useEffect(() => {
    if (organization?.id) {
      fetchAuditLogs();
      fetchAuditStats();
    }
  }, [organization, page, filters]);

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let url = `/api/audit/organization/${organization.id}/logs?page=${page}&limit=20`;
      
      // Add filters to URL if they exist
      if (filters.action) url += `&action=${filters.action}`;
      if (filters.resourceType) url += `&resourceType=${filters.resourceType}`;
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;
      if (filters.searchTerm) url += `&searchTerm=${filters.searchTerm}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAuditLogs(response.data.logs);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to fetch audit logs: ' + (err.response?.data?.error || err.message));
      toast({
        title: 'Error fetching audit logs',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch audit stats
  const fetchAuditStats = async () => {
    try {
      setIsStatsLoading(true);
      
      const url = `/api/audit/organization/${organization.id}/stats`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats(response.data);
    } catch (err) {
      toast({
        title: 'Error fetching audit stats',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filters change
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      action: '',
      resourceType: '',
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
    setPage(1);
  };

  // Export audit logs as CSV
  const exportToCSV = async () => {
    try {
      // Create CSV header
      let csv = 'Date,Action,Resource Type,Resource ID,User,Details\n';
      
      // Add rows
      auditLogs.forEach(log => {
        const date = new Date(log.createdAt).toLocaleString();
        const action = log.action;
        const resourceType = log.resourceType;
        const resourceId = log.resourceId;
        const user = log.User ? log.User.username : 'System';
        // Escape quotes in JSON string
        const details = JSON.stringify(log.details).replace(/"/g, '""');
        
        csv += `"${date}","${action}","${resourceType}","${resourceId}","${user}","${details}"\n`;
      });
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: 'Export successful',
        description: 'Audit logs have been exported to CSV',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Export failed',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Get color based on action
  const getActionColor = (action) => {
    if (action.includes('created') || action.includes('added')) {
      return 'green';
    } else if (action.includes('deleted') || action.includes('removed')) {
      return 'red';
    } else if (action.includes('updated') || action.includes('edited')) {
      return 'blue';
    } else if (action.includes('policy_violated') || action.includes('policy_enforced')) {
      return 'orange';
    } else {
      return 'gray';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h1" size="lg">Audit Logs</Heading>
        <HStack>
          <Tooltip label="Refresh data">
            <IconButton
              icon={<FiRefreshCw />}
              aria-label="Refresh"
              onClick={() => {
                fetchAuditLogs();
                fetchAuditStats();
              }}
            />
          </Tooltip>
          <Tooltip label="Export to CSV">
            <IconButton
              icon={<FiDownload />}
              aria-label="Export"
              onClick={exportToCSV}
              isDisabled={auditLogs.length === 0}
            />
          </Tooltip>
        </HStack>
      </Flex>
      
      {/* Stats Grid */}
      {!isStatsLoading && stats && (
        <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4} mb={6}>
          <GridItem>
            <Stat
              px={4}
              py={3}
              shadow="base"
              borderColor="gray.200"
              rounded="lg"
              bg={statBgColor}
            >
              <Flex justifyContent="space-between">
                <Box>
                  <StatLabel>Total Actions</StatLabel>
                  <StatNumber>{stats.totalLogs || 0}</StatNumber>
                  <StatHelpText>All recorded events</StatHelpText>
                </Box>
                <Box my="auto" color="gray.600" alignContent="center">
                  <FiActivity size={24} />
                </Box>
              </Flex>
            </Stat>
          </GridItem>
          
          <GridItem>
            <Stat
              px={4}
              py={3}
              shadow="base"
              borderColor="gray.200"
              rounded="lg"
              bg={statBgColor}
            >
              <Flex justifyContent="space-between">
                <Box>
                  <StatLabel>Most Active User</StatLabel>
                  <StatNumber>
                    {stats.userCounts?.length > 0 ? stats.userCounts[0].username : 'N/A'}
                  </StatNumber>
                  <StatHelpText>
                    {stats.userCounts?.length > 0 ? `${stats.userCounts[0].count} actions` : 'No data'}
                  </StatHelpText>
                </Box>
                <Box my="auto" color="gray.600" alignContent="center">
                  <FiUser size={24} />
                </Box>
              </Flex>
            </Stat>
          </GridItem>
          
          <GridItem>
            <Stat
              px={4}
              py={3}
              shadow="base"
              borderColor="gray.200"
              rounded="lg"
              bg={statBgColor}
            >
              <Flex justifyContent="space-between">
                <Box>
                  <StatLabel>Most Common Action</StatLabel>
                  <StatNumber>
                    {stats.actionCounts?.length > 0 
                      ? stats.actionCounts[0].action.replace(/_/g, ' ') 
                      : 'N/A'}
                  </StatNumber>
                  <StatHelpText>
                    {stats.actionCounts?.length > 0 ? `${stats.actionCounts[0].count} times` : 'No data'}
                  </StatHelpText>
                </Box>
                <Box my="auto" color="gray.600" alignContent="center">
                  <FiActivity size={24} />
                </Box>
              </Flex>
            </Stat>
          </GridItem>
          
          <GridItem>
            <Stat
              px={4}
              py={3}
              shadow="base"
              borderColor="gray.200"
              rounded="lg"
              bg={statBgColor}
            >
              <Flex justifyContent="space-between">
                <Box>
                  <StatLabel>Most Common Resource</StatLabel>
                  <StatNumber>
                    {stats.resourceCounts?.length > 0 
                      ? stats.resourceCounts[0].resourceType 
                      : 'N/A'}
                  </StatNumber>
                  <StatHelpText>
                    {stats.resourceCounts?.length > 0 ? `${stats.resourceCounts[0].count} records` : 'No data'}
                  </StatHelpText>
                </Box>
                <Box my="auto" color="gray.600" alignContent="center">
                  <FiFolder size={24} />
                </Box>
              </Flex>
            </Stat>
          </GridItem>
        </Grid>
      )}
      
      {/* Filters */}
      <Box mb={6} p={4} borderWidth="1px" borderRadius="lg">
        <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={4}>
          <FormControl>
            <FormLabel fontSize="sm">Action</FormLabel>
            <Select 
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              placeholder="All actions"
              size="sm"
            >
              <option value="repository_created">Repository Created</option>
              <option value="repository_deleted">Repository Deleted</option>
              <option value="repository_visibility_changed">Visibility Changed</option>
              <option value="member_added">Member Added</option>
              <option value="member_removed">Member Removed</option>
              <option value="policy_enforced">Policy Enforced</option>
              <option value="policy_created">Policy Created</option>
              <option value="policy_updated">Policy Updated</option>
              <option value="policy_deleted">Policy Deleted</option>
              <option value="role_created">Role Created</option>
              <option value="role_updated">Role Updated</option>
              <option value="role_deleted">Role Deleted</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel fontSize="sm">Resource Type</FormLabel>
            <Select 
              name="resourceType"
              value={filters.resourceType}
              onChange={handleFilterChange}
              placeholder="All resources"
              size="sm"
            >
              <option value="repository">Repository</option>
              <option value="user">User</option>
              <option value="team">Team</option>
              <option value="organization">Organization</option>
              <option value="policy">Policy</option>
              <option value="role">Role</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel fontSize="sm">Start Date</FormLabel>
            <Input 
              type="date" 
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              size="sm"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel fontSize="sm">End Date</FormLabel>
            <Input 
              type="date" 
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              size="sm"
            />
          </FormControl>
        </Flex>
        
        <Flex gap={4} alignItems="flex-end">
          <FormControl flex={1}>
            <FormLabel fontSize="sm">Search</FormLabel>
            <InputGroup size="sm">
              <Input 
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleFilterChange}
                placeholder="Search audit logs..."
              />
              <InputRightElement>
                <FiSearch />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          
          <Button 
            leftIcon={<FiX />} 
            variant="outline"
            size="sm"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </Flex>
      </Box>
      
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" color="brand.500" />
        </Flex>
      ) : auditLogs.length === 0 ? (
        <Box p={5} textAlign="center" borderWidth="1px" borderRadius="md">
          <Text fontSize="lg" mb={4}>No audit logs found</Text>
          <Text color="gray.500">Try modifying your filters or create more activities in the system.</Text>
        </Box>
      ) : (
        <>
          <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb={4}>
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Timestamp</Th>
                  <Th>Action</Th>
                  <Th>Resource</Th>
                  <Th>User</Th>
                  <Th>Details</Th>
                </Tr>
              </Thead>
              <Tbody>
                {auditLogs.map((log) => (
                  <Tr key={log.id}>
                    <Td whiteSpace="nowrap">{formatDate(log.createdAt)}</Td>
                    <Td>
                      <Badge colorScheme={getActionColor(log.action)}>
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack>
                        <Badge variant="outline">{log.resourceType}</Badge>
                        <Text fontSize="sm">{log.resourceId}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      {log.User ? (
                        <HStack>
                          <Text>{log.User.username}</Text>
                        </HStack>
                      ) : (
                        <Text color="gray.500">System</Text>
                      )}
                    </Td>
                    <Td fontSize="sm">
                      {log.details && (
                        <Tooltip
                          label={<pre>{JSON.stringify(log.details, null, 2)}</pre>}
                          placement="left"
                          hasArrow
                        >
                          <Text noOfLines={1} maxW="200px">
                            {log.details.repositoryName || log.details.policyName || log.details.roleName || 
                             JSON.stringify(log.details).slice(0, 50) + '...'}
                          </Text>
                        </Tooltip>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          
          {/* Pagination */}
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="sm">
              Showing page {page} of {totalPages}
            </Text>
            <HStack>
              <Button
                size="sm"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                isDisabled={page === 1}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                isDisabled={page === totalPages}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default AuditLogsPage; 