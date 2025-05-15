import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  SimpleGrid,
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { FiAlertCircle, FiGitPullRequest, FiRefreshCw, FiShield, FiUsers } from 'react-icons/fi';
import ActivityFeed from '../components/ActivityFeed';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../hooks/useDashboard';

// Placeholder component for stats card
const StatsCard = ({ title, stat, icon, description }) => {
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py="5"
      shadow="base"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      rounded="lg"
      borderWidth="1px"
      bg={useColorModeValue('white', 'gray.700')}
    >
      <Flex justifyContent="space-between">
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight="medium">{title}</StatLabel>
          <StatNumber fontSize="2xl" fontWeight="medium">
            {stat}
          </StatNumber>
          <StatHelpText>{description}</StatHelpText>
        </Box>
        <Box my="auto" color={useColorModeValue('gray.800', 'gray.200')} alignContent="center">
          <Icon as={icon} w={8} h={8} />
        </Box>
      </Flex>
    </Stat>
  );
};

// Activity Feed Item
const ActivityItem = ({ activity }) => {
  return (
    <Box
      p={3}
      bg={useColorModeValue('white', 'gray.700')}
      shadow="sm"
      rounded="md"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      mb={3}
    >
      <Flex align="center" gap={2}>
        <Icon as={FiAlertCircle} color={activity.type === 'policy_violation' ? 'red.500' : 'green.500'} />
        <Text fontSize="sm" fontWeight="medium">
          {activity.title}
        </Text>
      </Flex>
      <Text fontSize="xs" color="gray.500" mt={1}>
        {activity.timestamp}
      </Text>
    </Box>
  );
};

const DashboardPage = () => {
  const { organization, user } = useAuth();
  const {
    stats,
    recentActivities,
    isLoading,
    error,
    fetchDashboardData,
  } = useDashboard();

  // 页面加载时获取数据
  useEffect(() => {
    fetchDashboardData();
  }, [organization?.id]);

  // 定义视图中使用的统计数据
  const displayStats = stats || {
    users: 0,
    repositories: 0,
    policies: 0,
    violations: 0
  };

  return (
    <Box>
      <Heading as="h1" size="lg" mb={6}>
        Dashboard
      </Heading>

      <Box bg={useColorModeValue('gray.50', 'gray.700')} p={5} rounded="md" mb={6}>
        <Heading as="h2" size="md" mb={2}>
          Welcome, {user?.username}!
        </Heading>
        <Text mb={4} color={useColorModeValue('gray.600', 'gray.300')}>
          You're viewing the access control dashboard for {organization?.name || 'your organization'}.
        </Text>
      </Box>

      {isLoading ? (
        <Center p={10}>
          <Spinner size="xl" color="brand.500" />
        </Center>
      ) : error ? (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={8}>
            <StatsCard
              title="Users"
              stat={displayStats.users}
              icon={FiUsers}
              description="Total organization users"
            />
            <StatsCard
              title="Repositories"
              stat={displayStats.repositories}
              icon={FiGitPullRequest}
              description="Managed repositories"
            />
            <StatsCard
              title="Policies"
              stat={displayStats.policies}
              icon={FiShield}
              description="Active access policies"
            />
            <StatsCard
              title="Policy Violations"
              stat={displayStats.violations}
              icon={FiAlertCircle}
              description="Last 7 days"
            />
          </SimpleGrid>

          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
            <GridItem>
              <Box
                bg={useColorModeValue('white', 'gray.700')}
                shadow="sm"
                rounded="lg"
                p={5}
                borderWidth="1px"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
              >
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md">Recent Activity</Heading>
                  <Button
                    leftIcon={<FiRefreshCw />}
                    size="sm"
                    onClick={fetchDashboardData}
                    isLoading={isLoading}
                  >
                    Refresh
                  </Button>
                </Flex>
                <ActivityFeed activities={recentActivities} />
              </Box>
            </GridItem>

            <GridItem>
              <Box
                bg={useColorModeValue('white', 'gray.700')}
                shadow="sm"
                rounded="lg"
                p={5}
                borderWidth="1px"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                height="100%"
              >
                <Heading as="h3" size="md" mb={4}>
                  Quick Tips
                </Heading>
                <Box>
                  <Text fontSize="sm" mb={3}>
                    • Review your access policies regularly to ensure compliance
                  </Text>
                  <Text fontSize="sm" mb={3}>
                    • Check audit logs for any unauthorized access attempts
                  </Text>
                  <Text fontSize="sm" mb={3}>
                    • Create dedicated teams for different project responsibilities
                  </Text>
                  <Text fontSize="sm" mb={3}>
                    • Limit direct repository access to essential personnel only
                  </Text>
                  <Text fontSize="sm" mb={3}>
                    • Enable branch protection on all production repositories
                  </Text>
                </Box>
              </Box>
            </GridItem>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default DashboardPage;
