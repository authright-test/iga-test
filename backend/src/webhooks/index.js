const { Webhooks } = await import('@octokit/webhooks');
import logger from '../utils/logger.js';
import { handleMemberAdded, handleMemberRemoved, handleMemberUpdated } from './handlers/memberHandler.js';
import {
  handleRepositoryCreated,
  handleRepositoryDeleted,
  handleRepositoryVisibilityChanged
} from './handlers/repositoryHandler.js';
import {
  handleInstallationCreated,
  handleInstallationDeleted
} from './handlers/installationHandler.js';

// Use Webhooks here
const webhooks = new Webhooks({
  secret: process.env.GITHUB_APP_WEBHOOK_SECRET
});

// Handle installation events
webhooks.on('installation.created', async ({ payload }) => {
  await handleInstallationCreated(payload);
});

webhooks.on('installation.deleted', async ({ payload }) => {
  await handleInstallationDeleted(payload);
});

// Handle member events
webhooks.on('member.added', async ({ payload }) => {
  await handleMemberAdded(payload);
});

webhooks.on('member.removed', async ({ payload }) => {
  await handleMemberRemoved(payload);
});

webhooks.on('member.updated', async ({ payload }) => {
  await handleMemberUpdated(payload);
});

// Handle repository events
webhooks.on('repository.created', async ({ payload }) => {
  await handleRepositoryCreated(payload);
});

webhooks.on('repository.deleted', async ({ payload }) => {
  await handleRepositoryDeleted(payload);
});

webhooks.on('repository.visibility_changed', async ({ payload }) => {
  await handleRepositoryVisibilityChanged(payload);
});

// Handle team events
webhooks.on('team.created', async ({ payload }) => {
  logger.info('Team created:', payload);
  // TODO: Implement team created logic
});

webhooks.on('team.deleted', async ({ payload }) => {
  logger.info('Team deleted:', payload);
  // TODO: Implement team deleted logic
});

webhooks.on('team.edited', async ({ payload }) => {
  logger.info('Team edited:', payload);
  // TODO: Implement team edited logic
});

// Handle organization events
webhooks.on('organization.member_added', async ({ payload }) => {
  logger.info('Organization member added:', payload);
  // TODO: Implement organization member added logic
});

webhooks.on('organization.member_removed', async ({ payload }) => {
  logger.info('Organization member removed:', payload);
  // TODO: Implement organization member removed logic
});

// Handle any errors
webhooks.onError((error) => {
  logger.error('Webhook error:', error);
});

export const setupWebhooks = (app) => {
  app.post('/webhook', async (req, res) => {
    try {
      await webhooks.verifyAndReceive({
        id: req.headers['x-github-delivery'],
        name: req.headers['x-github-event'],
        payload: req.body,
        signature: req.headers['x-hub-signature-256']
      });
      res.status(200).send('Webhook received');
    } catch (error) {
      logger.error('Webhook error:', error);
      res.status(400).send('Webhook error');
    }
  });
};
