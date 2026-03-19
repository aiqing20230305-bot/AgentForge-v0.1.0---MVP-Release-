/**
 * GitHub Sync Service
 * 处理 GitHub Issues/PRs 与本地任务的双向同步
 */

import { githubClient, GitHubIssue, GitHubPullRequest, CreateIssuePayload } from './githubClient';

export interface GitHubSyncConfig {
  enabled: boolean;
  syncInterval: number; // 分钟
  autoCreateIssues: boolean;
  autoCreateBranches: boolean;
  autoCloseTasks: boolean; // PR 合并时自动关闭任务
  branchPrefix: string;
  labelMapping: Record<string, string>; // 本地标签 -> GitHub 标签
}

export interface TaskGitHubMapping {
  taskId: string;
  issueNumber?: number;
  prNumber?: number;
  branchName?: string;
  lastSyncAt: string;
  syncDirection: 'push' | 'pull' | 'bidirectional';
}

export interface SyncResult {
  success: boolean;
  created: number;
  updated: number;
  errors: Array<{ taskId: string; error: string }>;
  timestamp: string;
}

export interface LocalTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assignee?: string;
  labels?: string[];
  type?: string;
  updatedAt: string;
}

class GitHubSyncService {
  private config: GitHubSyncConfig | null = null;
  private mappings: Map<string, TaskGitHubMapping> = new Map();
  private syncInterval: number | null = null;
  private syncInProgress: boolean = false;

  /**
   * 初始化同步服务
   */
  initialize(config: GitHubSyncConfig): void {
    this.config = config;
    this.loadMappings();

    if (config.enabled && config.syncInterval > 0) {
      this.startAutoSync();
    }
  }

  /**
   * 加载映射关系
   */
  private loadMappings(): void {
    try {
      const stored = localStorage.getItem('github_task_mappings');
      if (stored) {
        const data = JSON.parse(stored);
        this.mappings = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Failed to load GitHub mappings:', error);
    }
  }

  /**
   * 保存映射关系
   */
  private saveMappings(): void {
    try {
      const data = Object.fromEntries(this.mappings);
      localStorage.setItem('github_task_mappings', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save GitHub mappings:', error);
    }
  }

  /**
   * 开始自动同步
   */
  private startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    if (!this.config || !this.config.enabled) return;

    this.syncInterval = window.setInterval(() => {
      this.performSync().catch(console.error);
    }, this.config.syncInterval * 60 * 1000);
  }

  /**
   * 停止自动同步
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * 手动触发同步
   */
  async manualSync(): Promise<SyncResult> {
    return this.performSync();
  }

  /**
   * 执行同步
   */
  private async performSync(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return {
        success: false,
        created: 0,
        updated: 0,
        errors: [{ taskId: 'system', error: 'Sync already in progress' }],
        timestamp: new Date().toISOString()
      };
    }

    this.syncInProgress = true;
    const result: SyncResult = {
      success: true,
      created: 0,
      updated: 0,
      errors: [],
      timestamp: new Date().toISOString()
    };

    try {
      const localTasks = await this.getLocalTasks();

      for (const task of localTasks) {
        try {
          const mapping = this.mappings.get(task.id);

          if (mapping) {
            if (this.shouldUpdate(task, mapping)) {
              await this.updateGitHubItems(task, mapping);
              result.updated++;
            }
          } else if (this.config?.autoCreateIssues) {
            await this.createIssue(task);
            result.created++;
          }
        } catch (error) {
          result.errors.push({
            taskId: task.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // 从 GitHub 拉取更新
      await this.pullUpdatesFromGitHub();
    } catch (error) {
      result.success = false;
      result.errors.push({
        taskId: 'system',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  /**
   * 创建 GitHub Issue
   */
  async createIssue(task: LocalTask): Promise<GitHubIssue> {
    if (!this.config) {
      throw new Error('Sync service not initialized');
    }

    const labels = this.mapLabels(task.labels || []);

    const payload: CreateIssuePayload = {
      title: task.title,
      body: task.description,
      labels,
      assignees: task.assignee ? [task.assignee] : undefined
    };

    const issue = await githubClient.createIssue(payload);

    // 如果需要，创建分支
    let branchName: string | undefined;
    if (this.config.autoCreateBranches && task.status !== 'done') {
      branchName = await this.createBranch(task, issue.number);
    }

    // 保存映射
    this.mappings.set(task.id, {
      taskId: task.id,
      issueNumber: issue.number,
      branchName,
      lastSyncAt: new Date().toISOString(),
      syncDirection: 'bidirectional'
    });
    this.saveMappings();

    return issue;
  }

  /**
   * 创建分支
   */
  private async createBranch(task: LocalTask, issueNumber: number): Promise<string> {
    if (!this.config) {
      throw new Error('Sync service not initialized');
    }

    const branchName = `${this.config.branchPrefix}${issueNumber}-${this.sanitizeBranchName(task.title)}`;

    try {
      await githubClient.createBranch(branchName);
      return branchName;
    } catch (error) {
      console.error('Failed to create branch:', error);
      throw error;
    }
  }

  /**
   * 清理分支名称
   */
  private sanitizeBranchName(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  /**
   * 更新 GitHub Items
   */
  private async updateGitHubItems(task: LocalTask, mapping: TaskGitHubMapping): Promise<void> {
    if (!mapping.issueNumber) return;

    const labels = this.mapLabels(task.labels || []);

    await githubClient.updateIssue(mapping.issueNumber, {
      title: task.title,
      body: task.description,
      state: task.status === 'done' ? 'closed' : 'open',
      labels,
      assignees: task.assignee ? [task.assignee] : undefined
    });

    mapping.lastSyncAt = new Date().toISOString();
    this.saveMappings();
  }

  /**
   * 映射标签
   */
  private mapLabels(localLabels: string[]): string[] {
    if (!this.config?.labelMapping) return localLabels;

    return localLabels.map(label => this.config!.labelMapping[label] || label);
  }

  /**
   * 从 GitHub 拉取更新
   */
  private async pullUpdatesFromGitHub(): Promise<void> {
    if (!this.config) return;

    // 计算上次同步时间
    const since = new Date(Date.now() - this.config.syncInterval * 60 * 1000).toISOString();

    // 获取最近更新的 Issues
    const issues = await githubClient.listIssues({
      state: 'all',
      since
    });

    // 更新本地任务
    for (const issue of issues) {
      const mapping = Array.from(this.mappings.values())
        .find(m => m.issueNumber === issue.number);

      if (mapping) {
        await this.updateLocalTaskFromIssue(mapping.taskId, issue);
      }
    }

    // 检查 PR 的合并状态
    await this.checkPRMergeStatus();
  }

  /**
   * 从 Issue 更新本地任务
   */
  private async updateLocalTaskFromIssue(taskId: string, issue: GitHubIssue): Promise<void> {
    const updateData = {
      title: issue.title,
      description: issue.body,
      status: issue.state === 'closed' ? 'done' : 'in-progress',
      labels: issue.labels.map(l => l.name),
      assignee: issue.assignees[0]?.login,
      updatedAt: issue.updated_at
    };

    window.dispatchEvent(new CustomEvent('github:task-update', {
      detail: { taskId, updateData }
    }));
  }

  /**
   * 检查 PR 合并状态
   */
  private async checkPRMergeStatus(): Promise<void> {
    if (!this.config?.autoCloseTasks) return;

    const mappingsWithPR = Array.from(this.mappings.values())
      .filter(m => m.prNumber);

    for (const mapping of mappingsWithPR) {
      try {
        const pr = await githubClient.getPullRequest(mapping.prNumber!);

        if (pr.merged) {
          // PR 已合并，关闭任务
          window.dispatchEvent(new CustomEvent('github:pr-merged', {
            detail: {
              taskId: mapping.taskId,
              prNumber: pr.number,
              mergedAt: pr.merged_at
            }
          }));
        }
      } catch (error) {
        console.error('Failed to check PR status:', error);
      }
    }
  }

  /**
   * 创建 Pull Request
   */
  async createPullRequest(
    taskId: string,
    title: string,
    description?: string,
    targetBranch: string = 'main'
  ): Promise<GitHubPullRequest> {
    const mapping = this.mappings.get(taskId);
    if (!mapping || !mapping.branchName) {
      throw new Error('No branch associated with task');
    }

    const pr = await githubClient.createPullRequest({
      title,
      body: description,
      head: mapping.branchName,
      base: targetBranch,
      draft: false
    });

    // 更新映射
    mapping.prNumber = pr.number;
    mapping.lastSyncAt = new Date().toISOString();
    this.saveMappings();

    return pr;
  }

  /**
   * 判断是否需要更新
   */
  private shouldUpdate(task: LocalTask, mapping: TaskGitHubMapping): boolean {
    if (!mapping.lastSyncAt) return true;

    const taskUpdated = new Date(task.updatedAt);
    const lastSync = new Date(mapping.lastSyncAt);

    return taskUpdated > lastSync;
  }

  /**
   * 获取本地任务
   */
  private async getLocalTasks(): Promise<LocalTask[]> {
    // 这里需要从实际的任务存储中获取
    return [];
  }

  /**
   * 关联任务和 GitHub Items
   */
  linkTaskToGitHub(
    taskId: string,
    options: {
      issueNumber?: number;
      prNumber?: number;
      branchName?: string;
    },
    syncDirection: 'push' | 'pull' | 'bidirectional' = 'bidirectional'
  ): void {
    const existing = this.mappings.get(taskId);
    this.mappings.set(taskId, {
      taskId,
      issueNumber: options.issueNumber || existing?.issueNumber,
      prNumber: options.prNumber || existing?.prNumber,
      branchName: options.branchName || existing?.branchName,
      lastSyncAt: new Date().toISOString(),
      syncDirection
    });
    this.saveMappings();
  }

  /**
   * 取消关联
   */
  unlinkTask(taskId: string): void {
    this.mappings.delete(taskId);
    this.saveMappings();
  }

  /**
   * 获取任务的 GitHub 信息
   */
  getGitHubInfo(taskId: string): TaskGitHubMapping | undefined {
    return this.mappings.get(taskId);
  }

  /**
   * 获取所有映射
   */
  getAllMappings(): TaskGitHubMapping[] {
    return Array.from(this.mappings.values());
  }

  /**
   * 清除所有映射
   */
  clearAllMappings(): void {
    this.mappings.clear();
    this.saveMappings();
  }

  /**
   * 获取同步统计
   */
  getSyncStats(): {
    totalMappings: number;
    withIssues: number;
    withPRs: number;
    withBranches: number;
    lastSyncAt?: string;
    syncEnabled: boolean;
  } {
    const mappings = Array.from(this.mappings.values());
    const lastSync = mappings.reduce((latest, mapping) => {
      if (!latest || mapping.lastSyncAt > latest) {
        return mapping.lastSyncAt;
      }
      return latest;
    }, '');

    return {
      totalMappings: mappings.length,
      withIssues: mappings.filter(m => m.issueNumber).length,
      withPRs: mappings.filter(m => m.prNumber).length,
      withBranches: mappings.filter(m => m.branchName).length,
      lastSyncAt: lastSync || undefined,
      syncEnabled: this.config?.enabled || false
    };
  }
}

export const githubSyncService = new GitHubSyncService();
