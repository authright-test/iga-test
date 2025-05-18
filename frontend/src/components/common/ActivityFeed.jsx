import { Box, Chip, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';
import {
  FiAlertTriangle,
  FiCheck,
  FiFileText,
  FiGitPullRequest,
  FiInfo,
  FiUsers,
} from 'react-icons/fi';

// 根据活动类型获取图标和颜色
const getActivityIconAndColor = (activity) => {
  const action = activity.action || '';

  // 根据活动类型选择图标和颜色
  if (action.includes('policy_violated') || action.includes('violated')) {
    return {
      icon: FiAlertTriangle,
      color: 'error',
      badgeColor: 'error'
    };
  } else if (action.includes('created') || action.includes('added')) {
    return {
      icon: FiCheck,
      color: 'success',
      badgeColor: 'success'
    };
  } else if (action.includes('deleted') || action.includes('removed')) {
    return {
      icon: FiAlertTriangle,
      color: 'warning',
      badgeColor: 'warning'
    };
  } else if (action.includes('repository') || action.includes('branch')) {
    return {
      icon: FiGitPullRequest,
      color: 'secondary',
      badgeColor: 'secondary'
    };
  } else if (action.includes('user') || action.includes('member')) {
    return {
      icon: FiUsers,
      color: 'info',
      badgeColor: 'info'
    };
  } else if (action.includes('policy') || action.includes('role')) {
    return {
      icon: FiFileText,
      color: 'primary',
      badgeColor: 'primary'
    };
  } else {
    return {
      icon: FiInfo,
      color: 'default',
      badgeColor: 'default'
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
  const theme = useTheme();
  const { icon: Icon, color, badgeColor } = getActivityIconAndColor(activity);

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 1,
        transition: 'background-color 0.2s',
        '&:hover': {
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
        },
        width: '100%',
      }}
    >
      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Box
          sx={{
            p: 2,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon color={theme.palette[color].main} size={20} />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Typography variant="body1" fontWeight="medium">
              {createActivityDescription(activity)}
            </Typography>

            <Chip
              label={activity.action?.replace(/_/g, ' ')}
              color={badgeColor}
              size="small"
            />
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">
              {activity.User?.username || 'System'}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {formatTimeAgo(activity.createdAt)}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

// 活动提要组件
const ActivityFeed = ({ activities }) => {
  return (
    <Stack spacing={2}>
      {activities?.map((activity, index) => (
        <React.Fragment key={activity.id}>
          <ActivityItem activity={activity} />
        </React.Fragment>
      ))}
    </Stack>
  );
};

export default ActivityFeed;
