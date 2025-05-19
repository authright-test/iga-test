import express from 'express';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { checkPermission } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GitHub App Authentication
const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
  clientId: process.env.GITHUB_APP_CLIENT_ID,
  clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
});

// Get security overview statistics
router.get('/overview', checkPermission('stats.view'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const org = req.query.organization;

    // Get repository list
    const { data: repos } = await octokit.repos.listForOrg({
      org,
    });

    // Get security alerts
    const securityAlerts = await Promise.all(
      repos.map(repo =>
        octokit.securityAdvisories.listRepositoryAdvisories({
          owner: org,
          repo: repo.name,
        })
      )
    );

    // Get dependency updates
    const dependencyUpdates = await Promise.all(
      repos.map(repo =>
        octokit.dependabot.listAlertsForRepo({
          owner: org,
          repo: repo.name,
        })
      )
    );

    // Get code scanning results
    const codeScanning = await Promise.all(
      repos.map(repo =>
        octokit.codeScanning.listAlertsForRepo({
          owner: org,
          repo: repo.name,
        })
      )
    );

    // Statistics results
    const stats = {
      repositories: {
        total: repos.length,
        public: repos.filter(r => !r.private).length,
        private: repos.filter(r => r.private).length,
      },
      security: {
        advisories: securityAlerts.reduce((acc, curr) => acc + curr.data.length, 0),
        dependencyAlerts: dependencyUpdates.reduce((acc, curr) => acc + curr.data.length, 0),
        codeScanningAlerts: codeScanning.reduce((acc, curr) => acc + curr.data.length, 0),
      },
      access: {
        teams: (await octokit.teams.list({ org })).data.length,
        members: (await octokit.orgs.listMembers({ org })).data.length,
      },
    };

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching security overview:', error);
    res.status(500).json({ error: 'Failed to fetch security overview' });
  }
});

// Get security trends
router.get('/trends', checkPermission('stats.view'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const org = req.query.organization;
    const { data: repos } = await octokit.repos.listForOrg({
      org,
    });

    // Get security events from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const securityEvents = await Promise.all(
      repos.map(repo =>
        octokit.activity.listRepoEvents({
          owner: org,
          repo: repo.name,
          per_page: 100,
        })
      )
    );

    // Group statistics by date
    const trends = securityEvents.reduce((acc, events) => {
      events.data.forEach(event => {
        const date = event.created_at.split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            securityAdvisories: 0,
            dependencyUpdates: 0,
            codeScanning: 0,
            accessChanges: 0,
          };
        }

        switch (event.type) {
          case 'SecurityAdvisoryEvent':
            acc[date].securityAdvisories++;
            break;
          case 'DependabotAlertEvent':
            acc[date].dependencyUpdates++;
            break;
          case 'CodeScanningAlertEvent':
            acc[date].codeScanning++;
            break;
          case 'MemberEvent':
          case 'TeamEvent':
            acc[date].accessChanges++;
            break;
        }
      });
      return acc;
    }, {});

    res.json(trends);
  } catch (error) {
    logger.error('Error fetching security trends:', error);
    res.status(500).json({ error: 'Failed to fetch security trends' });
  }
});

// Get repository security scores
router.get('/repositories/security-scores', checkPermission('stats.view'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const org = req.query.organization;
    const { data: repos } = await octokit.repos.listForOrg({
      org,
    });

    const securityScores = await Promise.all(
      repos.map(async repo => {
        const [
          { data: advisories },
          { data: dependencyAlerts },
          { data: codeScanningAlerts },
        ] = await Promise.all([
          octokit.securityAdvisories.listRepositoryAdvisories({
            owner: org,
            repo: repo.name,
          }),
          octokit.dependabot.listAlertsForRepo({
            owner: org,
            repo: repo.name,
          }),
          octokit.codeScanning.listAlertsForRepo({
            owner: org,
            repo: repo.name,
          }),
        ]);

        // Calculate security score (0-100)
        const score = Math.max(
          0,
          100 -
          (advisories.length * 10 +
            dependencyAlerts.length * 5 +
            codeScanningAlerts.length * 5)
        );

        return {
          repository: repo.name,
          score,
          details: {
            securityAdvisories: advisories.length,
            dependencyAlerts: dependencyAlerts.length,
            codeScanningAlerts: codeScanningAlerts.length,
          },
        };
      })
    );

    res.json(securityScores);
  } catch (error) {
    logger.error('Error fetching repository security scores:', error);
    res.status(500).json({ error: 'Failed to fetch repository security scores' });
  }
});

// Get team security statistics
router.get('/teams/security-stats', checkPermission('stats.view'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const org = req.query.organization;
    const { data: teams } = await octokit.teams.list({ org });

    const teamStats = await Promise.all(
      teams.map(async team => {
        const { data: members } = await octokit.teams.listMembers({
          org,
          team_slug: team.slug,
        });

        const { data: repos } = await octokit.teams.listRepos({
          org,
          team_slug: team.slug,
        });

        // Get security alerts for team repositories
        const securityAlerts = await Promise.all(
          repos.map(repo =>
            octokit.securityAdvisories.listRepositoryAdvisories({
              owner: org,
              repo: repo.name,
            })
          )
        );

        return {
          team: team.name,
          members: members.length,
          repositories: repos.length,
          securityAlerts: securityAlerts.reduce((acc, curr) => acc + curr.data.length, 0),
        };
      })
    );

    res.json(teamStats);
  } catch (error) {
    logger.error('Error fetching team security stats:', error);
    res.status(500).json({ error: 'Failed to fetch team security stats' });
  }
});

export default router;
