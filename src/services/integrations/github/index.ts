/**
 * GitHub Integration Exports
 */

export { githubClient } from './githubClient';
export type { GitHubConfig, GitHubIssue, GitHubPullRequest, GitHubBranch } from './githubClient';

export { githubSyncService } from './githubSyncService';
export type { GitHubSyncConfig, TaskGitHubMapping, SyncResult } from './githubSyncService';

export { githubWebhookHandler } from './githubWebhookHandler';
export type { GitHubWebhookEvent, WebhookEventType } from './githubWebhookHandler';
