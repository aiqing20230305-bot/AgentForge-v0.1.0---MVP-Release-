/**
 * Integrations Index
 * Export all integration modules
 */

export * from './slack'
export * from './discord'
export * from './jira'
export * from './github'
export * from './IntegrationManager'
export { getIntegrationManager, resetIntegrationManager } from './IntegrationManager'

/**
 * 初始化所有集成
 */
export function initializeIntegrations(): void {
  // 从本地存储加载配置
  try {
    // Jira
    const jiraConfig = localStorage.getItem('jira_config');
    if (jiraConfig) {
      const { connection, sync } = JSON.parse(jiraConfig);
      const { jiraClient, jiraSyncService } = require('./jira');

      if (connection) {
        jiraClient.initialize(connection);
      }

      if (sync) {
        jiraSyncService.initialize(sync);
      }
    }

    // GitHub
    const githubConfig = localStorage.getItem('github_config');
    if (githubConfig) {
      const { connection, sync } = JSON.parse(githubConfig);
      const { githubClient, githubSyncService } = require('./github');

      if (connection) {
        githubClient.initialize(connection);
      }

      if (sync) {
        githubSyncService.initialize(sync);
      }
    }

    console.log('Integrations initialized successfully');
  } catch (error) {
    console.error('Failed to initialize integrations:', error);
  }
}

/**
 * 集成健康检查
 */
export async function checkIntegrationsHealth(): Promise<{
  jira: { connected: boolean; error?: string };
  github: { connected: boolean; error?: string };
}> {
  const { jiraClient } = require('./jira');
  const { githubClient } = require('./github');

  const result = {
    jira: { connected: false, error: undefined as string | undefined },
    github: { connected: false, error: undefined as string | undefined }
  };

  // Check Jira
  try {
    result.jira.connected = await jiraClient.testConnection();
  } catch (error) {
    result.jira.error = error instanceof Error ? error.message : 'Connection failed';
  }

  // Check GitHub
  try {
    result.github.connected = await githubClient.testConnection();
  } catch (error) {
    result.github.error = error instanceof Error ? error.message : 'Connection failed';
  }

  return result;
}
