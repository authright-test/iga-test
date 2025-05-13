import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Stack,
  HStack,
  VStack,
  Icon,
  Badge,
  useColorModeValue,
  Button,
  Input,
  Select,
  DateRangePicker,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FiFilter, FiDownload, FiSearch, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { useAuditLogs } from '../../hooks/useAuditLogs';

const AuditLogViewer = () => {
  const [filters, setFilters] = useState({
    search: '',
    actionType: '',
    user: '',
    dateRange: null,
    severity: '',
  });

  const { logs, isLoading, error, exportLogs, getLogStats, getLogTrends } = useAuditLogs({
    filters,
    limit: 50,
  });

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleExport = async (format) => {
    try {
      const data = await exportLogs({ ...filters, format });
      // Handle file download
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <Stack spacing={6}>
      {/* Filters */}
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md">Audit Logs</Heading>
            <HStack>
              <Button
                leftIcon={<FiRefreshCw />}
                size="sm"
                onClick={() => setFilters({})}
              >
                Reset
              </Button>
              <Menu>
                <MenuButton
                  as={Button}
                  leftIcon={<FiDownload />}
                  size="sm"
                >
                  Export
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => handleExport('csv')}>CSV</MenuItem>
                  <MenuItem onClick={() => handleExport('json')}>JSON</MenuItem>
                  <MenuItem onClick={() => handleExport('pdf')}>PDF</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <Stack spacing={4}>
            <HStack>
              <Input
                placeholder="Search logs..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                leftElement={<Icon as={FiSearch} color="gray.400" />}
              />
              <Select
                placeholder="Action Type"
                value={filters.actionType}
                onChange={(e) => setFilters(prev => ({ ...prev, actionType: e.target.value }))}
              >
                <option value="access">Access</option>
                <option value="modification">Modification</option>
                <option value="deletion">Deletion</option>
                <option value="creation">Creation</option>
              </Select>
              <Select
                placeholder="Severity"
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </HStack>
            <DateRangePicker
              value={filters.dateRange}
              onChange={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
            />
          </Stack>
        </CardBody>
      </Card>

      {/* Logs Table */}
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Timestamp</Th>
                <Th>User</Th>
                <Th>Action</Th>
                <Th>Resource</Th>
                <Th>Severity</Th>
                <Th>Details</Th>
              </Tr>
            </Thead>
            <Tbody>
              {logs?.map((log) => (
                <Tr key={log.id}>
                  <Td>{new Date(log.timestamp).toLocaleString()}</Td>
                  <Td>{log.user}</Td>
                  <Td>{log.action}</Td>
                  <Td>{log.resource}</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        log.severity === 'high' ? 'red' :
                        log.severity === 'medium' ? 'orange' : 'yellow'
                      }
                    >
                      {log.severity}
                    </Badge>
                  </Td>
                  <Td>
                    <Tooltip label="View Details">
                      <IconButton
                        icon={<FiAlertCircle />}
                        size="sm"
                        variant="ghost"
                        onClick={() => {/* Handle view details */}}
                      />
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Analysis Section */}
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md">Audit Analysis</Heading>
        </CardHeader>
        <CardBody>
          <Stack spacing={6}>
            {/* Add analysis components here */}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
};

export default AuditLogViewer; 