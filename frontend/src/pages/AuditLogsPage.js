import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FiFilter, FiSearch } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useAuditLogs } from '../hooks/useAuditLogs';

const AuditLogsPage = () => {
  const [filters, setFilters] = useState({
    action: '',
    resourceType: '',
    searchTerm: '',
  });

  const toast = useToast();
  const { logAuditEvent } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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
    switch(action) {
      case 'created':
        return 'green';
      case 'updated':
        return 'blue';
      case 'deleted':
        return 'red';
      case 'assigned':
        return 'purple';
      case 'removed':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getResourceTypeColor = (type) => {
    switch(type) {
      case 'user':
        return 'blue';
      case 'team':
        return 'purple';
      case 'repository':
        return 'green';
      case 'permission':
        return 'orange';
      default:
        return 'gray';
    }
  };

  if (isLoading) {
    return (
      <Box p={4}>
        <Heading size="lg" mb={4}>Loading audit logs...</Heading>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Heading size="lg" mb={4}>Error loading audit logs</Heading>
        <Box color="red.500">{error}</Box>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Heading size="lg" mb={4}>Audit Logs</Heading>

      {/* Filters */}
      <Flex mb={4} gap={4} wrap="wrap">
        <Select
          name="action"
          value={filters.action}
          onChange={handleFilterChange}
          placeholder="Filter by action"
          width="200px"
        >
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
          <option value="assigned">Assigned</option>
          <option value="removed">Removed</option>
        </Select>

        <Select
          name="resourceType"
          value={filters.resourceType}
          onChange={handleFilterChange}
          placeholder="Filter by resource type"
          width="200px"
        >
          <option value="user">User</option>
          <option value="team">Team</option>
          <option value="repository">Repository</option>
          <option value="permission">Permission</option>
        </Select>

        <InputGroup width="300px">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleFilterChange}
            placeholder="Search logs..."
          />
        </InputGroup>

        <Button
          leftIcon={<FiFilter />}
          colorScheme="blue"
          onClick={handleSearch}
        >
          Apply Filters
        </Button>
      </Flex>

      {/* Logs Table */}
      <Box
        bg={bgColor}
        shadow="sm"
        rounded="lg"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Timestamp</Th>
              <Th>Action</Th>
              <Th>Resource Type</Th>
              <Th>Resource ID</Th>
              <Th>User</Th>
              <Th>Details</Th>
            </Tr>
          </Thead>
          <Tbody>
            {logs.map((log) => (
              <Tr key={log.id}>
                <Td>
                  <Text fontSize="sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </Text>
                </Td>
                <Td>
                  <Badge colorScheme={getActionColor(log.action)}>
                    {log.action}
                  </Badge>
                </Td>
                <Td>
                  <Badge colorScheme={getResourceTypeColor(log.resourceType)}>
                    {log.resourceType}
                  </Badge>
                </Td>
                <Td>
                  <Text fontSize="sm">{log.resourceId}</Text>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <Text fontSize="sm">{log.user.username}</Text>
                    <Text fontSize="xs" color="gray.500">
                      ({log.user.email})
                    </Text>
                  </HStack>
                </Td>
                <Td>
                  <VStack align="start" spacing={0}>
                    {Object.entries(log.details).map(([key, value]) => (
                      <Text key={key} fontSize="xs">
                        <strong>{key}:</strong> {JSON.stringify(value)}
                      </Text>
                    ))}
                  </VStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default AuditLogsPage;
