import { toaster } from '@/components/ui/toaster';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Heading,
  Icon,
  Progress,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { FiActivity, FiAlertCircle, FiDatabase, FiLock, FiServer, FiShield, FiUser } from 'react-icons/fi';
import { useSecurityStats } from '../../hooks/useSecurityStats';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { ErrorAlert, ErrorInline } from '../common/ErrorMessage';
import { LoadingOverlay, LoadingSkeleton } from '../common/LoadingState';

const SecurityMonitor = () => {
  const { stats, isLoading, error, refreshStats, getThreatDetails, getVulnerabilityReport } = useSecurityStats();
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // 实时监控更新
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStats().catch(err => {
        setErrorMessage('Failed to refresh security stats');
        console.error('Refresh error:', err);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshStats]);

  // 处理安全警报
  useEffect(() => {
    if (stats?.activeThreats > 0) {
      toaster.create({
        title: 'Security Alert',
        description: `Detected ${stats.activeThreats} active threats`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  }, [stats?.activeThreats, toast]);

  // 处理错误
  useEffect(() => {
    if (error) {
      setErrorMessage(error.message);
      toaster.create({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  }, [error, toast]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'yellow';
      default:
        return 'green';
    }
  };

  if (error) {
    return (
      <ErrorAlert
        title='Failed to load security data'
        description={error.message}
        onClose={() => setErrorMessage(null)}
      />
    );
  }

  return (
    <ErrorBoundary>
      <Stack gap={6}>
        {/* 安全概览 */}
        <LoadingOverlay isLoading={isLoading}>
          <Card borderWidth='1px'>
            <Card.Header>
              <Stack justify='space-between'>
                <Heading size='md'>Security Overview</Heading>
                <Button
                  size='sm'
                  onClick={() => {
                    refreshStats().catch(err => {
                      setErrorMessage('Failed to refresh security stats');
                      console.error('Refresh error:', err);
                    });
                  }}
                  isLoading={isLoading}
                >
                  Refresh
                </Button>
              </Stack>
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <LoadingSkeleton count={4} height='60px' />
              ) : (
                <Stack gap={6}>
                  {/* 安全评分 */}
                  <Box>
                    <Stack justify='space-between' mb={2}>
                      <Text fontWeight='medium'>Security Score</Text>
                      <Badge colorScheme={stats?.score > 80 ? 'green' : stats?.score > 60 ? 'yellow' : 'red'}>
                        {stats?.score || 0}%
                      </Badge>
                    </Stack>
                    <Progress
                      value={stats?.score || 0}
                      colorScheme={stats?.score > 80 ? 'green' : stats?.score > 60 ? 'yellow' : 'red'}
                      borderRadius='full'
                    />
                  </Box>

                  {/* 安全指标 */}
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                    <SecurityMetric
                      title='Active Threats'
                      value={stats?.activeThreats || 0}
                      icon={FiAlertCircle}
                      color='red'
                    />
                    <SecurityMetric
                      title='Vulnerabilities'
                      value={stats?.vulnerabilities || 0}
                      icon={FiShield}
                      color='orange'
                    />
                    <SecurityMetric
                      title='Access Violations'
                      value={stats?.accessViolations || 0}
                      icon={FiLock}
                      color='yellow'
                    />
                    <SecurityMetric
                      title='Security Incidents'
                      value={stats?.securityIncidents || 0}
                      icon={FiActivity}
                      color='purple'
                    />
                  </SimpleGrid>

                  {/* 新增安全指标 */}
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                    <SecurityMetric
                      title='Failed Logins'
                      value={stats?.failedLogins || 0}
                      icon={FiUser}
                      color='red'
                    />
                    <SecurityMetric
                      title='API Attacks'
                      value={stats?.apiAttacks || 0}
                      icon={FiServer}
                      color='orange'
                    />
                    <SecurityMetric
                      title='Data Breaches'
                      value={stats?.dataBreaches || 0}
                      icon={FiDatabase}
                      color='red'
                    />
                    <SecurityMetric
                      title='Malware Detected'
                      value={stats?.malwareDetected || 0}
                      icon={FiAlertCircle}
                      color='red'
                    />
                  </SimpleGrid>
                </Stack>
              )}
            </Card.Body>
          </Card>
        </LoadingOverlay>

        {/* 错误提示 */}
        {errorMessage && (
          <ErrorInline
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        )}

        {/* 安全警报 */}
        {stats?.activeThreats > 0 && (
          <Alert.Root status='warning' variant='left-accent'>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Active Security Threats Detected!</Alert.Title>
              <Alert.Description>
                {stats?.activeThreats} threats require immediate attention.
              </Alert.Description>
            </Alert.Content>
            <Button size='sm' onClick={() => {/* 处理威胁 */
            }}>
              View Details
            </Button>
          </Alert.Root>
        )}

        {/* 最近安全事件 */}
        <LoadingOverlay isLoading={isLoading}>
          <Card borderWidth='1px'>
            <Card.Header>
              <Heading size='md'>Recent Security Events</Heading>
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <LoadingSkeleton count={3} height='40px' />
              ) : (
                <Stack gap={4}>
                  {stats?.recentEvents?.map((event) => (
                    <SecurityEvent
                      key={event.id}
                      event={event}
                      onViewDetails={() => setSelectedThreat(event)}
                    />
                  ))}
                </Stack>
              )}
            </Card.Body>
          </Card>
        </LoadingOverlay>

        {/* 安全建议 */}
        <LoadingOverlay isLoading={isLoading}>
          <Card borderWidth='1px'>
            <Card.Header>
              <Heading size='md'>Security Recommendations</Heading>
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <LoadingSkeleton count={3} height='40px' />
              ) : (
                <Stack gap={4}>
                  {stats?.recommendations?.map((rec) => (
                    <SecurityRecommendation
                      key={rec.id}
                      recommendation={rec}
                      onApply={() => {/* 应用建议 */
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Card.Body>
          </Card>
        </LoadingOverlay>

        {/* 威胁详情模态框 */}
        {selectedThreat && (
          <ThreatDetailsModal
            threat={selectedThreat}
            onClose={() => setSelectedThreat(null)}
          />
        )}
      </Stack>
    </ErrorBoundary>
  );
};

// 安全指标组件
const SecurityMetric = ({ title, value, icon, color }) => (
  <Stack gap={4} p={4} borderRadius='lg'>
    <Icon as={icon} boxSize={6} color={`${color}.500`} />
    <Stack direction='column' align='start' spacing={0}>
      <Text fontSize='sm' color='gray.500'>{title}</Text>
      <Text fontSize='2xl' fontWeight='bold'>{value}</Text>
    </Stack>
  </Stack>
);

// 安全事件组件
const SecurityEvent = ({ event, onViewDetails }) => {

  return (
    <Stack gap={4} p={3} borderRadius='md' _hover={{ bg: 'gray.50' }}>
      <Icon as={FiAlertCircle} boxSize={5} />
      <Stack direction='column' align='start' spacing={0} flex={1}>
        <Text fontWeight='medium'>{event.title}</Text>
        <Text fontSize='sm' color='gray.500'>
          {event.timestamp} • {event.description}
        </Text>
      </Stack>
      <Badge>{event.severity}</Badge>
      <Button size='sm' onClick={onViewDetails}>Details</Button>
    </Stack>
  );
};

// 安全建议组件
const SecurityRecommendation = ({ recommendation, onApply }) => (
  <Stack gap={4} p={3} borderRadius='md' _hover={{ bg: 'gray.50' }}>
    <Icon as={FiShield} boxSize={5} color='blue.500' />
    <Stack direction='column' align='start' spacing={0} flex={1}>
      <Text fontWeight='medium'>{recommendation.title}</Text>
      <Text fontSize='sm' color='gray.500'>{recommendation.description}</Text>
    </Stack>
    <Button size='sm' colorScheme='blue' onClick={onApply}>Apply</Button>
  </Stack>
);

// 威胁详情模态框组件
const ThreatDetailsModal = ({ threat, onClose }) => {
  return (
    <Dialog.Root open={true} onClose={onClose} size='xl'>
      <Dialog.Backdrop />
      <Dialog.Content>
        <Dialog.Header>Threat Details</Dialog.Header>
        <Dialog.CloseTrigger />
        <Dialog.Body pb={6}>
          <Stack gap={4}>
            <Box>
              <Text fontWeight='medium'>Threat Type</Text>
              <Text>{threat.type}</Text>
            </Box>
            <Box>
              <Text fontWeight='medium'>Description</Text>
              <Text>{threat.description}</Text>
            </Box>
            <Box>
              <Text fontWeight='medium'>Impact</Text>
              <Text>{threat.impact}</Text>
            </Box>
            <Box>
              <Text fontWeight='medium'>Recommended Actions</Text>
              <Text>{threat.recommendedActions}</Text>
            </Box>
          </Stack>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default SecurityMonitor;
