import { Badge, Box, Icon, Separator, Stack, Text, } from '@chakra-ui/react';
import React from 'react';
import { FiActivity, FiAlertTriangle, FiCheck, FiFileText, FiGitPullRequest, FiInfo, FiUsers, } from 'react-icons/fi';

// 根据活动类型获取图标和颜色
const getActivityIconAndColor = (activity) => {
  const action = activity.action || '';

  // 根据活动类型选择图标和颜色
  if (action.includes('policy_violated') || action.includes('violated')) {
    return {
      icon: FiAlertTriangle,
      color: 'red.500',
      badgeColor: 'red'
    };
  } else if (action.includes('created') || action.includes('added')) {
    return {
      icon: FiCheck,
      color: 'green.500',
      badgeColor: 'green'
    };
  } else if (action.includes('deleted') || action.includes('removed')) {
    return {
      icon: FiAlertTriangle,
      color: 'orange.500',
      badgeColor: 'orange'
    };
  } else if (action.includes('repository') || action.includes('branch')) {
    return {
      icon: FiGitPullRequest,
      color: 'purple.500',
      badgeColor: 'purple'
    };
  } else if (action.includes('user') || action.includes('member')) {
    return {
      icon: FiUsers,
      color: 'blue.500',
      badgeColor: 'blue'
    };
  } else if (action.includes('policy') || action.includes('role')) {
    return {
      icon: FiFileText,
      color: 'cyan.500',
      badgeColor: 'cyan'
    };
  } else {
    return {
      icon: FiInfo,
      color: 'gray.500',
      badgeColor: 'gray'
    };
  }
};

// 创建一个可读的活动描述
const createActivityDescription = (activity) => {
  const action = activity.action || '';
  const resourceType = activity.resourceType || '';
  const details = activity.details || {};

  // 根据活动类型生成描述
  if (action.includes('repository_created')) {
    return `Repository "${details.repositoryName || details.name || activity.resourceId}" was created`;
  } else if (action.includes('repository_deleted')) {
    return `Repository "${details.repositoryName || details.name || activity.resourceId}" was deleted`;
  } else if (action.includes('repository_visibility_changed')) {
    return `Repository "${details.repositoryName || activity.resourceId}" visibility changed to ${details.visibility || 'new setting'}`;
  } else if (action.includes('member_added')) {
    return `User ${details.username || details.email || activity.resourceId} was added to ${details.teamName || 'the organization'}`;
  } else if (action.includes('member_removed')) {
    return `User ${details.username || details.email || activity.resourceId} was removed from ${details.teamName || 'the organization'}`;
  } else if (action.includes('policy_enforced')) {
    return `Policy "${details.policyName || activity.resourceId}" was enforced`;
  } else if (action.includes('policy_violated')) {
    return `Policy violation: ${details.message || details.policyName || 'Access policy violated'}`;
  } else if (action.includes('policy_created')) {
    return `Policy "${details.policyName || activity.resourceId}" was created`;
  } else if (action.includes('role_created')) {
    return `Role "${details.roleName || activity.resourceId}" was created`;
  } else if (action.includes('role_updated')) {
    return `Role "${details.roleName || activity.resourceId}" was updated`;
  } else if (action.includes('user_login')) {
    return `User ${details.username || activity.resourceId} logged in`;
  } else if (action.includes('user_logout')) {
    return `User ${details.username || activity.resourceId} logged out`;
  } else {
    // 默认情况：尝试构造一个合理的描述
    const actionVerb = action.replace(/_/g, ' ');
    return `${resourceType} ${activity.resourceId} was ${actionVerb}`;
  }
};

// 格式化时间
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// 单个活动项
const ActivityItem = ({ activity }) => {
  const { icon, color, badgeColor } = getActivityIconAndColor(activity);
  return (
    <Box
      p={3}
      borderRadius='md'
      transition='background-color 0.2s'
      _hover={{ bg: bgHover }}
      width='100%'
    >
      <Stack align='flex-start' spacing={3}>
        <Box
          p={2}
          borderRadius='full'>
          <Icon as={icon} color={color} boxSize={5} />
        </Box>

        <Box flex='1'>
          <Stack justifyContent='space-between' mb={1}>
            <Text fontWeight='medium'>
              {createActivityDescription(activity)}
            </Text>

            <Badge colorScheme={badgeColor} fontSize='xs'>
              {activity.action?.replace(/_/g, ' ')}
            </Badge>
          </Stack>

          <Stack justifyContent='space-between'>
            <Stack>
              <Text fontSize='sm'>
                {activity.User?.username || 'System'}
              </Text>
            </Stack>

            <Text fontSize='xs'>
              {formatTimeAgo(activity.createdAt)}
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

// 活动提要组件
const ActivityFeed = ({ activities }) => {

  const getActivityIcon = (type) => {
    switch (type) {
      case 'policy':
        return FiFileText;
      case 'role':
        return FiUsers;
      case 'access':
        return FiGitPullRequest;
      case 'system':
        return FiActivity;
      default:
        return FiInfo;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'success':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <Stack direction='column' gap={4} align='stretch'>
      {activities?.map((activity, index) => (
        <React.Fragment key={activity.id}>
          <Stack gap={4} align='start'>
            <Icon
              as={getActivityIcon(activity.type)}
              boxSize={5}
              color={getActivityColor(activity.status)}
            />
            <Box flex={1}>
              <Text fontWeight='medium' lineClamp={2}>
                {activity.description}
              </Text>
              <Stack gap={2} mt={1}>
                <Badge colorScheme={getActivityColor(activity.status)}>
                  {activity.status}
                </Badge>
                <Text fontSize='sm'>
                  {new Date(activity.timestamp).toLocaleString()}
                </Text>
              </Stack>
            </Box>
          </Stack>
          {index < activities.length - 1 && (
            <Separator />
          )}
        </React.Fragment>
      ))}
    </Stack>
  );
};

export default ActivityFeed;
