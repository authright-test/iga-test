import { Alert, Box, Button, Center, Grid, Heading, SimpleGrid, Spinner, Stack, Text, } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import ActivityFeed from '../components/ActivityFeed';
import StatCard from '../components/dashboard/StatCard';
import { useAuth } from '../contexts/AuthContext';
import useDashboard from '../hooks/useDashboard';
import { usePermissions } from '../hooks/usePermissions';

const DashboardPage = () => {
  const { organization, user } = useAuth();
  const {
    stats,
    recentActivities,
    isLoading,
    error,
    fetchDashboardData,
  } = useDashboard();
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchDashboardData();
  }, [organization?.id]);

  if (!hasPermission('dashboard.view')) {
    return (
      <Box p={4}>
        <Heading size='lg' mb={4}>
          Access Denied
        </Heading>
        <Text>
          You do not have permission to view the dashboard.
        </Text>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Center p={10}>
        <Spinner size='xl' color='brand.500' />
      </Center>
    );
  }

  // {
  //   error && (
  //     <Alert.Root status='error' mb={4}>
  //       <Alert.Indicator />
  //       <Alert.Title>
  //         {error}
  //       </Alert.Title>
  //     </Alert.Root>
  //   )
  // }

  return (
    <Box p={4}>
      <Stack gap={8}>
        <Box>
          <Heading size='lg' mb={2}>
            Dashboard
          </Heading>
          <Text>
            Welcome to your GitHub Access Control dashboard
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
          {stats?.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
            />
          ))}
        </SimpleGrid>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          <Box>
            <Heading size='md' mb={4}>
              Recent Activity
            </Heading>
            <ActivityFeed activities={recentActivities} />
          </Box>
          <Stack direction='column' align='stretch' gap={4}>
            <Box>
              <Heading size='md' mb={4}>
                Quick Actions
              </Heading>
              <Button
                leftIcon={<FiRefreshCw />}
                size='sm'
                onClick={fetchDashboardData}
                isLoading={isLoading}
              >
                Refresh
              </Button>
            </Box>
          </Stack>
        </Grid>
      </Stack>
    </Box>
  );
};

export default DashboardPage;
