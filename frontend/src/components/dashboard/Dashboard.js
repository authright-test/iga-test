import React from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stack,
  HStack,
  VStack,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { FiUsers, FiGitBranch, FiShield, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useStats } from '../../hooks/useStats';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { usePolicies } from '../../hooks/usePolicies';

const Dashboard = () => {
  const { user, organization } = useAuth();
  const { stats, isLoading: statsLoading } = useStats();
  const { recentLogs, isLoading: logsLoading } = useAuditLogs();
  const { policies, isLoading: policiesLoading } = usePolicies();
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box p={6}>
      {/* Header */}
      <VStack spacing={4} align="stretch" mb={8}>
        <Heading size="lg">Welcome, {user?.username}</Heading>
        <Text color="gray.500">
          {organization?.name} Dashboard
        </Text>
      </VStack>

      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          title="Total Members"
          value={stats?.totalMembers || 0}
          icon={FiUsers}
          change={stats?.memberChange}
          isLoading={statsLoading}
        />
        <StatCard
          title="Repositories"
          value={stats?.totalRepos || 0}
          icon={FiGitBranch}
          change={stats?.repoChange}
          isLoading={statsLoading}
        />
        <StatCard
          title="Active Policies"
          value={stats?.activePolicies || 0}
          icon={FiShield}
          change={stats?.policyChange}
          isLoading={statsLoading}
        />
        <StatCard
          title="Security Alerts"
          value={stats?.securityAlerts || 0}
          icon={FiAlertCircle}
          change={stats?.alertChange}
          isLoading={statsLoading}
          isAlert
        />
      </SimpleGrid>

      {/* Main Content */}
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        {/* Left Column */}
        <VStack spacing={6} align="stretch">
          {/* Recent Activity */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Recent Activity</Heading>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                {recentLogs?.map((log) => (
                  <ActivityItem key={log.id} log={log} />
                ))}
              </Stack>
            </CardBody>
          </Card>

          {/* Repository Access Overview */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Repository Access Overview</Heading>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                {stats?.repoAccess?.map((repo) => (
                  <RepoAccessItem key={repo.id} repo={repo} />
                ))}
              </Stack>
            </CardBody>
          </Card>
        </VStack>

        {/* Right Column */}
        <VStack spacing={6} align="stretch">
          {/* Active Policies */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Active Policies</Heading>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                {policies?.map((policy) => (
                  <PolicyItem key={policy.id} policy={policy} />
                ))}
              </Stack>
            </CardBody>
          </Card>

          {/* Security Status */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Security Status</Heading>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                {stats?.securityStatus?.map((status) => (
                  <SecurityStatusItem key={status.id} status={status} />
                ))}
              </Stack>
            </CardBody>
          </Card>
        </VStack>
      </Grid>
    </Box>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, change, isLoading, isAlert }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const alertColor = useColorModeValue('red.500', 'red.300');

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
      <CardBody>
        <HStack spacing={4}>
          <Icon
            as={icon}
            boxSize={8}
            color={isAlert ? alertColor : 'blue.500'}
          />
          <Stat>
            <StatLabel>{title}</StatLabel>
            <StatNumber>{isLoading ? '...' : value}</StatNumber>
            {change && (
              <StatHelpText>
                <StatArrow type={change > 0 ? 'increase' : 'decrease'} />
                {Math.abs(change)}%
              </StatHelpText>
            )}
          </Stat>
        </HStack>
      </CardBody>
    </Card>
  );
};

// Activity Item Component
const ActivityItem = ({ log }) => {
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <HStack spacing={4} p={2} borderRadius="md" _hover={{ bg: 'gray.50' }}>
      <Icon as={log.icon} boxSize={5} color="blue.500" />
      <VStack align="start" spacing={0}>
        <Text fontWeight="medium">{log.action}</Text>
        <Text fontSize="sm" color={textColor}>
          {log.timestamp} • {log.user}
        </Text>
      </VStack>
    </HStack>
  );
};

// Repo Access Item Component
const RepoAccessItem = ({ repo }) => {
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <HStack spacing={4} p={2} borderRadius="md" _hover={{ bg: 'gray.50' }}>
      <VStack align="start" spacing={0}>
        <Text fontWeight="medium">{repo.name}</Text>
        <Text fontSize="sm" color={textColor}>
          {repo.accessType} • {repo.memberCount} members
        </Text>
      </VStack>
    </HStack>
  );
};

// Policy Item Component
const PolicyItem = ({ policy }) => {
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <HStack spacing={4} p={2} borderRadius="md" _hover={{ bg: 'gray.50' }}>
      <Icon as={FiShield} boxSize={5} color="green.500" />
      <VStack align="start" spacing={0}>
        <Text fontWeight="medium">{policy.name}</Text>
        <Text fontSize="sm" color={textColor}>
          {policy.type} • {policy.status}
        </Text>
      </VStack>
    </HStack>
  );
};

// Security Status Item Component
const SecurityStatusItem = ({ status }) => {
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const statusColor = status.severity === 'high' ? 'red.500' : 
                     status.severity === 'medium' ? 'orange.500' : 'green.500';

  return (
    <HStack spacing={4} p={2} borderRadius="md" _hover={{ bg: 'gray.50' }}>
      <Icon as={FiAlertCircle} boxSize={5} color={statusColor} />
      <VStack align="start" spacing={0}>
        <Text fontWeight="medium">{status.title}</Text>
        <Text fontSize="sm" color={textColor}>
          {status.description}
        </Text>
      </VStack>
    </HStack>
  );
};

export default Dashboard; 