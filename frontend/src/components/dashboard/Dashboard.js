import { Box, Card, Grid, Heading, Icon, SimpleGrid, Stack, Stat, Text } from '@chakra-ui/react';
import React from 'react';
import { FiAlertCircle, FiShield } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { usePolicies } from '../../hooks/usePolicies';
import { useStats } from '../../hooks/useStats';

const Dashboard = () => {
  const { user, organization } = useAuth();
  const { stats, isLoading: statsLoading } = useStats();
  const { recentLogs, isLoading: logsLoading } = useAuditLogs();
  const { policies, isLoading: policiesLoading } = usePolicies();

  return (
    <Box p={6}>
      {/* Header */}
      <Stack direction='column' gap={4} align='stretch' mb={8}>
        <Heading size='lg'>Welcome, {user?.username}</Heading>
        <Text color='gray.500'>
          {organization?.name} Dashboard
        </Text>
      </Stack>

      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {/*<StatCard*/}
        {/*  title='Total Members'*/}
        {/*  value={stats?.totalMembers || 0}*/}
        {/*  icon={FiUsers}*/}
        {/*  change={stats?.memberChange}*/}
        {/*  isLoading={statsLoading}*/}
        {/*/>*/}
        {/*<StatCard*/}
        {/*  title='Repositories'*/}
        {/*  value={stats?.totalRepos || 0}*/}
        {/*  icon={FiGitBranch}*/}
        {/*  change={stats?.repoChange}*/}
        {/*  isLoading={statsLoading}*/}
        {/*/>*/}
        {/*<StatCard*/}
        {/*  title='Active Policies'*/}
        {/*  value={stats?.activePolicies || 0}*/}
        {/*  icon={FiShield}*/}
        {/*  change={stats?.policyChange}*/}
        {/*  isLoading={statsLoading}*/}
        {/*/>*/}
        {/*<StatCard*/}
        {/*  title='Security Alerts'*/}
        {/*  value={stats?.securityAlerts || 0}*/}
        {/*  icon={FiAlertCircle}*/}
        {/*  change={stats?.alertChange}*/}
        {/*  isLoading={statsLoading}*/}
        {/*  isAlert*/}
        {/*/>*/}
      </SimpleGrid>

      {/* Main Content */}
      {/*<Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>*/}
      <Grid gap={6}>
        {/* Left Column */}
        <Stack direction='column' gap={6}>
          {/* Recent Activity */}
          <Card.Root borderWidth='1px'>
            <Card.Header>
              <Heading size='md'>Recent Activity</Heading>
            </Card.Header>
            <Card.Body>
              <Stack gap={4}>
                {recentLogs?.map((log) => (
                  <ActivityItem key={log.id} log={log} />
                ))}
              </Stack>
            </Card.Body>
          </Card.Root>

          {/* Repository Access Overview */}
          <Card borderWidth='1px'>
            <Card.Header>
              <Heading size='md'>Repository Access Overview</Heading>
            </Card.Header>
            <Card.Body>
              <Stack gap={4}>
                {stats?.repoAccess?.map((repo) => (
                  <RepoAccessItem key={repo.id} repo={repo} />
                ))}
              </Stack>
            </Card.Body>
          </Card>
        </Stack>

        {/* Right Column */}
        <Stack direction='column' gap={6} align='stretch'>
          {/* Active Policies */}
          <Card borderWidth='1px'>
            <Card.Header>
              <Heading size='md'>Active Policies</Heading>
            </Card.Header>
            <Card.Body>
              <Stack gap={4}>
                {policies?.map((policy) => (
                  <PolicyItem key={policy.id} policy={policy} />
                ))}
              </Stack>
            </Card.Body>
          </Card>

          {/* Security Status */}
          <Card borderWidth='1px'>
            <Card.Header>
              <Heading size='md'>Security Status</Heading>
            </Card.Header>
            <Card.Body>
              <Stack gap={4}>
                {stats?.securityStatus?.map((status) => (
                  <SecurityStatusItem key={status.id} status={status} />
                ))}
              </Stack>
            </Card.Body>
          </Card>
        </Stack>
      </Grid>
    </Box>
  );
};

// Stat Card Component
// Usage: <StatCard
//           title='Total Members'
//           value={stats?.totalMembers || 0}
//           icon={FiUsers}
//           change={stats?.memberChange}
//           isLoading={statsLoading}
//         />
const StatCard = ({ title, value, icon, change, isLoading, isAlert = false }) => {
  return (
    <Card borderWidth='1px'>
      <Card.Body>
        <Stack gap={4}>
          <Icon
            as={icon}
            boxSize={8}
            color={isAlert ? 'red.500' : 'blue.500'}
          />
          <Stat.Root>
            <Stat.Label>{title}</Stat.Label>
            <Stat.ValueText>{isLoading ? '...' : value}</Stat.ValueText>
            {change && (
              <Stat.HelpText>
                {change > 0 ? (<Stat.UpIndicator />) : (<Stat.DownIndicator />)}
                {Math.abs(change)}%
              </Stat.HelpText>
            )}
          </Stat.Root>
        </Stack>
      </Card.Body>
    </Card>
  );
};

// Activity Item Component
const ActivityItem = ({ log }) => {

  return (
    <Stack gap={4} p={2} borderRadius='md' _hover={{ bg: 'gray.50' }}>
      <Icon as={log?.icon} boxSize={5} color='blue.500' />
      <Stack direction='column' align='start' spacing={0}>
        <Text fontWeight='medium'>{log?.action}</Text>
        <Text fontSize='sm'>
          {log?.timestamp} • {log?.user}
        </Text>
      </Stack>
    </Stack>
  );
};

// Repo Access Item Component
const RepoAccessItem = ({ repo }) => {

  return (
    <Stack gap={4} p={2} borderRadius='md' _hover={{ bg: 'gray.50' }}>
      <Stack direction='column' align='start' spacing={0}>
        <Text fontWeight='medium'>{repo?.name}</Text>
        <Text fontSize='sm'>
          {repo?.accessType} • {repo?.memberCount} members
        </Text>
      </Stack>
    </Stack>
  );
};

// Policy Item Component
const PolicyItem = ({ policy }) => {

  return (
    <Stack gap={4} p={2} borderRadius='md' _hover={{ bg: 'gray.50' }}>
      <Icon as={FiShield} boxSize={5} color='green.500' />
      <Stack direction='column' align='start' spacing={0}>
        <Text fontWeight='medium'>{policy?.name}</Text>
        <Text fontSize='sm'>
          {policy?.type} • {policy?.status}
        </Text>
      </Stack>
    </Stack>
  );
};

// Security Status Item Component
const SecurityStatusItem = ({ status }) => {

  const statusColor = status.severity === 'high' ? 'red.500' :
    status.severity === 'medium' ? 'orange.500' : 'green.500';

  return (
    <Stack gap={4} p={2} borderRadius='md' _hover={{ bg: 'gray.50' }}>
      <Icon as={FiAlertCircle} boxSize={5} color={statusColor} />
      <Stack direction='column' align='start' spacing={0}>
        <Text fontWeight='medium'>{status?.title}</Text>
        <Text fontSize='sm'>
          {status?.description}
        </Text>
      </Stack>
    </Stack>
  );
};

export default Dashboard;
