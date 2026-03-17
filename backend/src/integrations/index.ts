/**
 * Backend Integrations Index
 */

export { jiraService, JiraService } from './jira/jiraService';
export { githubService, GitHubService } from './github/githubService';

/**
 * 初始化所有后端集成
 */
export function initializeBackendIntegrations(config: {
  jira?: {
    host: string;
    email: string;
    apiToken: string;
  };
  github?: {
    token: string;
    owner: string;
    repo: string;
    webhookSecret?: string;
  };
}): void {
  if (config.jira) {
    jiraService.initialize(config.jira);
    console.log('Jira service initialized');
  }

  if (config.github) {
    githubService.initialize(config.github, config.github.webhookSecret);
    console.log('GitHub service initialized');
  }
}
