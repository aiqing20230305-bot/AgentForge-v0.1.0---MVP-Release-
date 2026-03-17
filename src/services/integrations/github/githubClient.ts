/**
 * GitHub API Client
 * 提供与 GitHub REST API 的交互功能
 */

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  labels: Array<{
    name: string;
    color: string;
  }>;
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  milestone?: {
    title: string;
    number: number;
  };
  created_at: string;
  updated_at: string;
  closed_at?: string;
  html_url: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  merged: boolean;
  draft: boolean;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  reviewers: Array<{
    login: string;
    avatar_url: string;
  }>;
  created_at: string;
  updated_at: string;
  merged_at?: string;
  html_url: string;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface CreateIssuePayload {
  title: string;
  body?: string;
  assignees?: string[];
  labels?: string[];
  milestone?: number;
}

export interface UpdateIssuePayload {
  title?: string;
  body?: string;
  state?: 'open' | 'closed';
  assignees?: string[];
  labels?: string[];
  milestone?: number;
}

export interface CreatePRPayload {
  title: string;
  body?: string;
  head: string;
  base: string;
  draft?: boolean;
  assignees?: string[];
  reviewers?: string[];
  labels?: string[];
}

class GitHubClient {
  private config: GitHubConfig | null = null;
  private baseUrl: string = 'https://api.github.com';

  /**
   * 初始化 GitHub 客户端
   */
  initialize(config: GitHubConfig): void {
    this.config = config;
  }

  /**
   * 获取认证头
   */
  private getHeaders(): Record<string, string> {
    if (!this.config) {
      throw new Error('GitHub client not initialized');
    }

    return {
      'Authorization': `Bearer ${this.config.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
  }

  /**
   * 获取仓库路径
   */
  private getRepoPath(): string {
    if (!this.config) {
      throw new Error('GitHub client not initialized');
    }
    return `${this.config.owner}/${this.config.repo}`;
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: this.getHeaders()
      });
      return response.ok;
    } catch (error) {
      console.error('GitHub connection test failed:', error);
      return false;
    }
  }

  /**
   * 获取仓库信息
   */
  async getRepository(): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to get repository: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 创建 Issue
   */
  async createIssue(payload: CreateIssuePayload): Promise<GitHubIssue> {
    const response = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}/issues`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create issue: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  /**
   * 获取 Issue
   */
  async getIssue(issueNumber: number): Promise<GitHubIssue> {
    const response = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}/issues/${issueNumber}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to get issue: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 更新 Issue
   */
  async updateIssue(issueNumber: number, payload: UpdateIssuePayload): Promise<GitHubIssue> {
    const response = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}/issues/${issueNumber}`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update issue: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  /**
   * 列出 Issues
   */
  async listIssues(options: {
    state?: 'open' | 'closed' | 'all';
    labels?: string[];
    assignee?: string;
    since?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<GitHubIssue[]> {
    const params = new URLSearchParams();
    if (options.state) params.append('state', options.state);
    if (options.labels) params.append('labels', options.labels.join(','));
    if (options.assignee) params.append('assignee', options.assignee);
    if (options.since) params.append('since', options.since);
    if (options.page) params.append('page', String(options.page));
    if (options.per_page) params.append('per_page', String(options.per_page));

    const response = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}/issues?${params}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to list issues: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 添加评论
   */
  async addComment(issueNumber: number, body: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}/issues/${issueNumber}/comments`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ body })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.statusText}`);
    }
  }

  /**
   * 创建 Pull Request
   */
  async createPullRequest(payload: CreatePRPayload): Promise<GitHubPullRequest> {
    const response = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}/pulls`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create pull request: ${JSON.stringify(error)}`);
    }

    const pr = await response.json();

    // 添加标签
    if (payload.labels && payload.labels.length > 0) {
      await this.addLabels(pr.number, payload.labels);
    }

    // 请求审核者
    if (payload.reviewers && payload.reviewers.length > 0) {
      await this.requestReviewers(pr.number, payload.reviewers);
    }

    return this.getPullRequest(pr.number);
  }

  /**
   * 获取 Pull Request
   */
  async getPullRequest(prNumber: number): Promise<GitHubPullRequest> {
    const response = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}/pulls/${prNumber}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to get pull request: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 更新 Pull Request
   */
  async updatePullRequest(prNumber: number, payload: Partial<CreatePRPayload>): Promise<GitHubPullRequest> {
    const response = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}/pulls/${prNumber}`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update pull request: ${JSON.stringify(error)}`);
    }

    return response.json();
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
    const response = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}/pulls/${prNumber}/merge`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(options)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to merge pull request: ${JSON.stringify(error)}`);
    }
  }

  /**
   * 列出 Pull Requests
   */
  async listPullRequests(options: {
    state?: 'open' | 'closed' | 'all';
    head?: string;
    base?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<GitHubPullRequest[]> {
    const params = new URLSearchParams();
    if (options.state) params.append('state', options.state);
    if (options.head) params.append('head', options.head);
    if (options.base) params.append('base', options.base);
    if (options.page) params.append('page', String(options.page));
    if (options.per_page) params.append('per_page', String(options.per_page));

    const response = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}/pulls?${params}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to list pull requests: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 创建分支
   */
  async createBranch(branchName: string, fromBranch: string = 'main'): Promise<GitHubBranch> {
    // 获取源分支的 SHA
    const refResponse = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}/git/ref/heads/${fromBranch}`,
      { headers: this.getHeaders() }
    );

    if (!refResponse.ok) {
      throw new Error(`Failed to get reference: ${refResponse.statusText}`);
    }

    const ref = await refResponse.json();
    const sha = ref.object.sha;

    // 创建新分支
    const response = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}/git/refs`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create branch: ${JSON.stringify(error)}`);
    }

    return this.getBranch(branchName);
  }

  /**
   * 获取分支
   */
  async getBranch(branchName: string): Promise<GitHubBranch> {
    const response = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}/branches/${branchName}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to get branch: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 列出分支
   */
  async listBranches(): Promise<GitHubBranch[]> {
    const response = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}/branches`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to list branches: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 添加标签到 Issue/PR
   */
  async addLabels(issueNumber: number, labels: string[]): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}/issues/${issueNumber}/labels`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ labels })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to add labels: ${response.statusText}`);
    }
  }

  /**
   * 请求审核者
   */
  async requestReviewers(prNumber: number, reviewers: string[]): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}/pulls/${prNumber}/requested_reviewers`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ reviewers })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to request reviewers: ${response.statusText}`);
    }
  }

  /**
   * 获取仓库的标签
   */
  async getLabels(): Promise<Array<{ name: string; color: string }>> {
    const response = await fetch(
      `${this.baseUrl}/repos/${this.getRepoPath()}/labels`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to get labels: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 搜索 Issues/PRs
   */
  async search(query: string, type: 'issue' | 'pr' = 'issue'): Promise<any> {
    const q = `${query} repo:${this.getRepoPath()} type:${type}`;
    const response = await fetch(
      `${this.baseUrl}/search/issues?q=${encodeURIComponent(q)}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to search: ${response.statusText}`);
    }

    return response.json();
  }
}

export const githubClient = new GitHubClient();
