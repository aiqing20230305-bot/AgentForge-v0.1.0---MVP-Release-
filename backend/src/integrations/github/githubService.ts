/**
 * Backend GitHub Integration Service
 * 后端 GitHub 集成服务
 */

import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  labels: any[];
  assignees: any[];
  created_at: string;
  updated_at: string;
}

interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  merged: boolean;
  head: any;
  base: any;
  created_at: string;
  updated_at: string;
}

export class GitHubService {
  private client: AxiosInstance | null = null;
  private config: GitHubConfig | null = null;
  private webhookSecret: string = '';

  /**
   * 初始化服务
   */
  initialize(config: GitHubConfig, webhookSecret?: string): void {
    this.config = config;
    this.webhookSecret = webhookSecret || '';

    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * 获取仓库路径
   */
  private getRepoPath(): string {
    if (!this.config) {
      throw new Error('Service not initialized');
    }
    return `${this.config.owner}/${this.config.repo}`;
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    try {
      await this.client.get('/user');
      return true;
    } catch (error) {
      console.error('GitHub connection test failed:', error);
      return false;
    }
  }

  /**
   * 创建 Issue
   */
  async createIssue(payload: {
    title: string;
    body?: string;
    assignees?: string[];
    labels?: string[];
  }): Promise<GitHubIssue> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    const response = await this.client.post(
      `/repos/${this.getRepoPath()}/issues`,
      payload
    );

    return response.data;
  }

  /**
   * 获取 Issue
   */
  async getIssue(issueNumber: number): Promise<GitHubIssue> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    const response = await this.client.get(
      `/repos/${this.getRepoPath()}/issues/${issueNumber}`
    );

    return response.data;
  }

  /**
   * 更新 Issue
   */
  async updateIssue(issueNumber: number, payload: any): Promise<GitHubIssue> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    const response = await this.client.patch(
      `/repos/${this.getRepoPath()}/issues/${issueNumber}`,
      payload
    );

    return response.data;
  }

  /**
   * 列出 Issues
   */
  async listIssues(options: {
    state?: 'open' | 'closed' | 'all';
    labels?: string;
    since?: string;
  } = {}): Promise<GitHubIssue[]> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    const response = await this.client.get(
      `/repos/${this.getRepoPath()}/issues`,
      { params: options }
    );

    return response.data;
  }

  /**
   * 创建 Pull Request
   */
  async createPullRequest(payload: {
    title: string;
    body?: string;
    head: string;
    base: string;
    draft?: boolean;
  }): Promise<GitHubPullRequest> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    const response = await this.client.post(
      `/repos/${this.getRepoPath()}/pulls`,
      payload
    );

    return response.data;
  }

  /**
   * 获取 Pull Request
   */
  async getPullRequest(prNumber: number): Promise<GitHubPullRequest> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    const response = await this.client.get(
      `/repos/${this.getRepoPath()}/pulls/${prNumber}`
    );

    return response.data;
  }

  /**
   * 合并 Pull Request
   */
  async mergePullRequest(
    prNumber: number,
    options: {
      commit_title?: string;
      commit_message?: string;
      merge_method?: 'merge' | 'squash' | 'rebase';
    } = {}
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    await this.client.put(
      `/repos/${this.getRepoPath()}/pulls/${prNumber}/merge`,
      options
    );
  }

  /**
   * 创建分支
   */
  async createBranch(branchName: string, fromBranch: string = 'main'): Promise<any> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    // 获取源分支的 SHA
    const refResponse = await this.client.get(
      `/repos/${this.getRepoPath()}/git/ref/heads/${fromBranch}`
    );

    const sha = refResponse.data.object.sha;

    // 创建新分支
    const response = await this.client.post(
      `/repos/${this.getRepoPath()}/git/refs`,
      {
        ref: `refs/heads/${branchName}`,
        sha
      }
    );

    return response.data;
  }

  /**
   * 添加评论
   */
  async addComment(issueNumber: number, body: string): Promise<void> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    await this.client.post(
      `/repos/${this.getRepoPath()}/issues/${issueNumber}/comments`,
      { body }
    );
  }

  /**
   * 验证 Webhook 签名
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      return true; // 如果没有配置密钥，跳过验证
    }

    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  }

  /**
   * 处理 Webhook 事件
   */
  async handleWebhook(eventType: string, payload: any): Promise<void> {
    switch (eventType) {
      case 'issues':
        await this.handleIssueEvent(payload);
        break;

      case 'pull_request':
        await this.handlePullRequestEvent(payload);
        break;

      case 'issue_comment':
        await this.handleCommentEvent(payload);
        break;

      case 'pull_request_review':
        await this.handleReviewEvent(payload);
        break;

      default:
        console.log('Unknown webhook event:', eventType);
    }
  }

  /**
   * 处理 Issue 事件
   */
  private async handleIssueEvent(payload: any): Promise<void> {
    const { action, issue } = payload;
    console.log(`Issue ${action}:`, issue.number);

    // 这里可以添加自定义逻辑
    // 例如：同步到本地数据库、发送通知等
  }

  /**
   * 处理 Pull Request 事件
   */
  private async handlePullRequestEvent(payload: any): Promise<void> {
    const { action, pull_request } = payload;
    console.log(`PR ${action}:`, pull_request.number);

    // 如果 PR 被合并，可以自动关闭相关任务
    if (action === 'closed' && pull_request.merged) {
      console.log('PR merged, closing related tasks...');
    }
  }

  /**
   * 处理评论事件
   */
  private async handleCommentEvent(payload: any): Promise<void> {
    const { action, issue, comment } = payload;
    console.log(`Comment ${action} on issue:`, issue.number);
  }

  /**
   * 处理 Review 事件
   */
  private async handleReviewEvent(payload: any): Promise<void> {
    const { action, pull_request, review } = payload;
    console.log(`Review ${action} on PR:`, pull_request.number);
  }

  /**
   * 搜索 Issues/PRs
   */
  async search(query: string, type: 'issue' | 'pr' = 'issue'): Promise<any> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    const q = `${query} repo:${this.getRepoPath()} type:${type}`;
    const response = await this.client.get('/search/issues', {
      params: { q }
    });

    return response.data;
  }

  /**
   * 获取仓库信息
   */
  async getRepository(): Promise<any> {
    if (!this.client) {
      throw new Error('Service not initialized');
    }

    const response = await this.client.get(`/repos/${this.getRepoPath()}`);
    return response.data;
  }
}

export const githubService = new GitHubService();
