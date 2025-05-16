import {
  Badge,
  Button,
  Card,
  Heading,
  Icon,
  IconButton,
  Input,
  Menu,
  MenuItem,
  Select,
  Stack,
  Table,
  Tooltip,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FiAlertCircle, FiDownload, FiRefreshCw, FiSearch } from 'react-icons/fi';
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
    <Stack gap={6}>
      {/* Filters */}
      <Card borderWidth='1px'>
        <Card.Header>
          <Stack justify='space-between'>
            <Heading size='md'>Audit Logs</Heading>
            <Stack>
              <Button
                leftIcon={<FiRefreshCw />}
                size='sm'
                onClick={() => setFilters({})}
              >
                Reset
              </Button>
              <Menu>
                <MenuButton
                  as={Button}
                  leftIcon={<FiDownload />}
                  size='sm'
                >
                  Export
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => handleExport('csv')}>CSV</MenuItem>
                  <MenuItem onClick={() => handleExport('json')}>JSON</MenuItem>
                  <MenuItem onClick={() => handleExport('pdf')}>PDF</MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          </Stack>
        </Card.Header>
        <Card.Body>
          <Stack gap={4}>
            <Stack>
              <Input
                placeholder='Search logs...'
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                leftElement={<Icon as={FiSearch} color='gray.400' />}
              />
              <Select
                placeholder='Action Type'
                value={filters.actionType}
                onChange={(e) => setFilters(prev => ({ ...prev, actionType: e.target.value }))}
              >
                <option value='access'>Access</option>
                <option value='modification'>Modification</option>
                <option value='deletion'>Deletion</option>
                <option value='creation'>Creation</option>
              </Select>
              <Select
                placeholder='Severity'
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              >
                <option value='high'>High</option>
                <option value='medium'>Medium</option>
                <option value='low'>Low</option>
              </Select>
            </Stack>
            <DateRangePicker
              value={filters.dateRange}
              onChange={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
            />
          </Stack>
        </Card.Body>
      </Card>

      {/* Logs Table */}
      <Card borderWidth='1px'>
        <Card.Body>
          <Table.Root variant='simple'>
            <Table.Header>
              <Table.Row>
                <Table.Cell>Timestamp</Table.Cell>
                <Table.Cell>User</Table.Cell>
                <Table.Cell>Action</Table.Cell>
                <Table.Cell>Resource</Table.Cell>
                <Table.Cell>Severity</Table.Cell>
                <Table.Cell>Details</Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {logs?.map((log) => (
                <Table.Row key={log.id}>
                  <Table.Cell>{new Date(log.timestamp).toLocaleString()}</Table.Cell>
                  <Table.Cell>{log.user}</Table.Cell>
                  <Table.Cell>{log.action}</Table.Cell>
                  <Table.Cell>{log.resource}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      colorScheme={
                        log.severity === 'high' ? 'red' :
                          log.severity === 'medium' ? 'orange' : 'yellow'
                      }
                    >
                      {log.severity}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Tooltip label='View Details'>
                      <IconButton
                        icon={<FiAlertCircle />}
                        size='sm'
                        variant='ghost'
                        onClick={() => {/* Handle view details */
                        }}
                      />
                    </Tooltip>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card.Body>
      </Card>

      {/* Analysis Section */}
      <Card borderWidth='1px'>
        <Card.Header>
          <Heading size='md'>Audit Analysis</Heading>
        </Card.Header>
        <Card.Body>
          <Stack gap={6}>
            {/* Add analysis components here */}
          </Stack>
        </Card.Body>
      </Card>
    </Stack>
  );
};

export default AuditLogViewer;
