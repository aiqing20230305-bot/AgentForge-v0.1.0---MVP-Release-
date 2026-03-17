/**
 * Jira Sync Service
 * 处理 Jira 与本地任务的双向同步
 */

import { jiraClient, JiraIssue, JiraCreateIssuePayload } from './jiraClient';
import { jiraStatusMapper } from './jiraStatusMapper';

export interface SyncConfig {
  enabled: boolean;
  syncInterval: number; // 分钟
  autoCreateIssues: boolean;
  autoUpdateIssues: boolean;
  projectKey: string;
  issueTypeMapping: Record<string, string>; // 本地任务类型 -> Jira Issue 类型
}

export interface TaskIssueMapping {
  taskId: string;
  issueKey: string;
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

class JiraSyncService {
  private config: SyncConfig | null = null;
  private mappings: Map<string, TaskIssueMapping> = new Map();
  private syncInterval: number | null = null;
  private syncInProgress: boolean = false;

  /**
   * 初始化同步服务
   */
  initialize(config: SyncConfig): void {
    this.config = config;
    this.loadMappings();

    if (config.enabled && config.syncInterval > 0) {
      this.startAutoSync();
    }
  }

  /**
   * 加载任务-Issue 映射关系
   */
  private loadMappings(): void {
    try {
      const stored = localStorage.getItem('jira_task_mappings');
      if (stored) {
        const data = JSON.parse(stored);
        this.mappings = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Failed to load Jira mappings:', error);
    }
  }

  /**
   * 保存映射关系
   */
  private saveMappings(): void {
    try {
      const data = Object.fromEntries(this.mappings);
      localStorage.setItem('jira_task_mappings', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save Jira mappings:', error);
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
      // 获取本地任务
      const localTasks = await this.getLocalTasks();

      // 同步每个任务
      for (const task of localTasks) {
        try {
          const mapping = this.mappings.get(task.id);

          if (mapping) {
            // 已映射，检查是否需要更新
            if (this.shouldUpdate(task, mapping)) {
              await this.updateIssue(task, mapping);
              result.updated++;
            }
          } else if (this.config?.autoCreateIssues) {
            // 未映射，创建新 Issue
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

      // 从 Jira 拉取更新
      if (this.config?.autoUpdateIssues) {
        await this.pullUpdatesFromJira(localTasks);
      }
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
   * 创建 Jira Issue
   */
  async createIssue(task: LocalTask): Promise<JiraIssue> {
    if (!this.config) {
      throw new Error('Sync service not initialized');
    }

    const issueType = this.config.issueTypeMapping[task.type || 'task'] || 'Task';

    const payload: JiraCreateIssuePayload = {
      projectKey: this.config.projectKey,
      summary: task.title,
      description: task.description,
      issueType,
      priority: task.priority,
      assignee: task.assignee,
      labels: task.labels
    };

    const issue = await jiraClient.createIssue(payload);

    // 保存映射
    this.mappings.set(task.id, {
      taskId: task.id,
      issueKey: issue.key,
      lastSyncAt: new Date().toISOString(),
      syncDirection: 'bidirectional'
    });
    this.saveMappings();

    return issue;
  }

  /**
   * 更新 Jira Issue
   */
  async updateIssue(task: LocalTask, mapping: TaskIssueMapping): Promise<void> {
    if (!this.config) {
      throw new Error('Sync service not initialized');
    }

    // 更新基本字段
    await jiraClient.updateIssue(mapping.issueKey, {
      summary: task.title,
      description: task.description,
      priority: task.priority,
      assignee: task.assignee,
      labels: task.labels
    });

    // 更新状态（如果需要）
    const currentIssue = await jiraClient.getIssue(mapping.issueKey);
    const targetStatus = jiraStatusMapper.mapLocalToJira(task.status);

    if (currentIssue.status.name !== targetStatus) {
      await this.transitionIssue(mapping.issueKey, targetStatus);
    }

    // 更新映射
    mapping.lastSyncAt = new Date().toISOString();
    this.saveMappings();
  }

  /**
   * 从 Jira 拉取更新
   */
  private async pullUpdatesFromJira(localTasks: LocalTask[]): Promise<void> {
    if (!this.config) return;

    // 获取所有已映射的 Issue
    const issueKeys = Array.from(this.mappings.values()).map(m => m.issueKey);
    if (issueKeys.length === 0) return;

    // 批量查询
    const jql = `key in (${issueKeys.join(',')}) AND updated > -${this.config.syncInterval}m`;
    const searchResult = await jiraClient.searchIssues({ jql });

    // 更新本地任务
    for (const issue of searchResult.issues) {
      const mapping = Array.from(this.mappings.values())
        .find(m => m.issueKey === issue.key);

      if (mapping) {
        await this.updateLocalTask(mapping.taskId, issue);
      }
    }
  }

  /**
   * 更新本地任务
   */
  private async updateLocalTask(taskId: string, issue: JiraIssue): Promise<void> {
    // 这里需要调用实际的任务更新 API
    const updateData = {
      title: issue.summary,
      description: issue.description,
      status: jiraStatusMapper.mapJiraToLocal(issue.status.name),
      priority: issue.priority?.name,
      assignee: issue.assignee?.accountId,
      labels: issue.labels,
      updatedAt: issue.updated
    };

    // 触发本地任务更新事件
    window.dispatchEvent(new CustomEvent('jira:task-update', {
      detail: { taskId, updateData }
    }));
  }

  /**
   * 转换 Issue 状态
   */
  private async transitionIssue(issueKey: string, targetStatus: string): Promise<void> {
    const transitions = await jiraClient.getTransitions(issueKey);
    const transition = transitions.find(t => t.to.name === targetStatus);

    if (transition) {
      await jiraClient.transitionIssue(issueKey, transition.id);
    } else {
      console.warn(`No transition found to status: ${targetStatus}`);
    }
  }

  /**
   * 判断是否需要更新
   */
  private shouldUpdate(task: LocalTask, mapping: TaskIssueMapping): boolean {
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
    // 暂时返回空数组
    return [];
  }

  /**
   * 关联任务和 Issue
   */
  linkTaskToIssue(taskId: string, issueKey: string, syncDirection: 'push' | 'pull' | 'bidirectional' = 'bidirectional'): void {
    this.mappings.set(taskId, {
      taskId,
      issueKey,
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
   * 获取任务的 Issue Key
   */
  getIssueKey(taskId: string): string | undefined {
    return this.mappings.get(taskId)?.issueKey;
  }

  /**
   * 获取所有映射
   */
  getAllMappings(): TaskIssueMapping[] {
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
      lastSyncAt: lastSync || undefined,
      syncEnabled: this.config?.enabled || false
    };
  }
}

export const jiraSyncService = new JiraSyncService();
