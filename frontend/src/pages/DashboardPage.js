import React from 'react';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUsers, FiGitPullRequest, FiShield, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

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
  
  // Mock data - in a real app, this would come from API
  const mockStats = {
    users: 34,
    repositories: 78,
    policies: 12,
    violations: 3,
  };
  
  const mockActivities = [
    { id: 1, title: 'Repository "backend" was made public', timestamp: 'Today, 10:30 AM', type: 'policy_violation' },
    { id: 2, title: 'New policy "No Public Repos" created', timestamp: 'Yesterday, 2:15 PM', type: 'info' },
    { id: 3, title: 'User john.doe added to admin team', timestamp: 'Yesterday, 11:45 AM', type: 'info' },
    { id: 4, title: 'Policy violation: Direct commit to main branch', timestamp: '2 days ago', type: 'policy_violation' },
  ];

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
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={8}>
        <StatsCard
          title="Users"
          stat={mockStats.users}
          icon={FiUsers}
          description="Total organization users"
        />
        <StatsCard
          title="Repositories"
          stat={mockStats.repositories}
          icon={FiGitPullRequest}
          description="Managed repositories"
        />
        <StatsCard
          title="Policies"
          stat={mockStats.policies}
          icon={FiShield}
          description="Active access policies"
        />
        <StatsCard
          title="Policy Violations"
          stat={mockStats.violations}
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
            <Heading as="h3" size="md" mb={4}>
              Recent Activity
            </Heading>
            <Box maxH="400px" overflowY="auto">
              {mockActivities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </Box>
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
            </Box>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 