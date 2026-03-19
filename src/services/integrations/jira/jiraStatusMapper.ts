/**
 * Jira Status Mapper
 * 处理本地任务状态和 Jira Issue 状态之间的映射
 */

export interface StatusMapping {
  local: string;
  jira: string;
  description?: string;
}

export interface StatusMappingConfig {
  mappings: StatusMapping[];
  defaultLocalStatus: string;
  defaultJiraStatus: string;
}

class JiraStatusMapper {
  private config: StatusMappingConfig = {
    mappings: [
      { local: 'todo', jira: 'To Do', description: '待处理' },
      { local: 'in-progress', jira: 'In Progress', description: '进行中' },
      { local: 'in-review', jira: 'In Review', description: '审核中' },
      { local: 'done', jira: 'Done', description: '已完成' },
      { local: 'blocked', jira: 'Blocked', description: '阻塞' },
      { local: 'cancelled', jira: 'Cancelled', description: '已取消' }
    ],
    defaultLocalStatus: 'todo',
    defaultJiraStatus: 'To Do'
  };

  /**
   * 初始化映射配置
   */
  initialize(config?: Partial<StatusMappingConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.loadConfig();
  }

  /**
   * 从本地存储加载配置
   */
  private loadConfig(): void {
    try {
      const stored = localStorage.getItem('jira_status_mapping');
      if (stored) {
        const config = JSON.parse(stored);
        this.config = { ...this.config, ...config };
      }
    } catch (error) {
      console.error('Failed to load status mapping config:', error);
    }
  }

  /**
   * 保存配置到本地存储
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('jira_status_mapping', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save status mapping config:', error);
    }
  }

  /**
   * 映射本地状态到 Jira 状态
   */
  mapLocalToJira(localStatus: string): string {
    const mapping = this.config.mappings.find(m => m.local === localStatus);
    return mapping?.jira || this.config.defaultJiraStatus;
  }

  /**
   * 映射 Jira 状态到本地状态
   */
  mapJiraToLocal(jiraStatus: string): string {
    const mapping = this.config.mappings.find(m => m.jira === jiraStatus);
    return mapping?.local || this.config.defaultLocalStatus;
  }

  /**
   * 添加或更新映射
   */
  setMapping(local: string, jira: string, description?: string): void {
    const index = this.config.mappings.findIndex(m => m.local === local);
    const mapping: StatusMapping = { local, jira, description };

    if (index >= 0) {
      this.config.mappings[index] = mapping;
    } else {
      this.config.mappings.push(mapping);
    }

    this.saveConfig();
  }

  /**
   * 删除映射
   */
  removeMapping(local: string): void {
    this.config.mappings = this.config.mappings.filter(m => m.local !== local);
    this.saveConfig();
  }

  /**
   * 获取所有映射
   */
  getAllMappings(): StatusMapping[] {
    return [...this.config.mappings];
  }

  /**
   * 获取本地状态列表
   */
  getLocalStatuses(): string[] {
    return this.config.mappings.map(m => m.local);
  }

  /**
   * 获取 Jira 状态列表
   */
  getJiraStatuses(): string[] {
    return this.config.mappings.map(m => m.jira);
  }

  /**
   * 批量导入映射
   */
  importMappings(mappings: StatusMapping[]): void {
    this.config.mappings = mappings;
    this.saveConfig();
  }

  /**
   * 重置为默认映射
   */
  resetToDefaults(): void {
    this.config.mappings = [
      { local: 'todo', jira: 'To Do', description: '待处理' },
      { local: 'in-progress', jira: 'In Progress', description: '进行中' },
      { local: 'in-review', jira: 'In Review', description: '审核中' },
      { local: 'done', jira: 'Done', description: '已完成' },
      { local: 'blocked', jira: 'Blocked', description: '阻塞' },
      { local: 'cancelled', jira: 'Cancelled', description: '已取消' }
    ];
    this.saveConfig();
  }

  /**
   * 验证映射完整性
   */
  validateMappings(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 检查是否有重复的本地状态
    const localStatuses = this.config.mappings.map(m => m.local);
    const duplicateLocal = localStatuses.filter((item, index) => localStatuses.indexOf(item) !== index);
    if (duplicateLocal.length > 0) {
      errors.push(`Duplicate local statuses: ${duplicateLocal.join(', ')}`);
    }

    // 检查是否有重复的 Jira 状态
    const jiraStatuses = this.config.mappings.map(m => m.jira);
    const duplicateJira = jiraStatuses.filter((item, index) => jiraStatuses.indexOf(item) !== index);
    if (duplicateJira.length > 0) {
      errors.push(`Duplicate Jira statuses: ${duplicateJira.join(', ')}`);
    }

    // 检查是否有空映射
    const emptyMappings = this.config.mappings.filter(m => !m.local || !m.jira);
    if (emptyMappings.length > 0) {
      errors.push(`Empty mappings found: ${emptyMappings.length}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 获取映射建议（基于常见模式）
   */
  getSuggestedMappings(jiraStatuses: string[]): StatusMapping[] {
    const suggestions: StatusMapping[] = [];
    const patterns: Record<string, string[]> = {
      todo: ['to do', 'open', 'backlog', 'new'],
      'in-progress': ['in progress', 'working', 'doing'],
      'in-review': ['in review', 'review', 'code review', 'testing'],
      done: ['done', 'closed', 'resolved', 'completed'],
      blocked: ['blocked', 'on hold', 'waiting'],
      cancelled: ['cancelled', 'rejected', 'wont do']
    };

    for (const jiraStatus of jiraStatuses) {
      const normalized = jiraStatus.toLowerCase();
      let matched = false;

      for (const [localStatus, keywords] of Object.entries(patterns)) {
        if (keywords.some(keyword => normalized.includes(keyword))) {
          suggestions.push({
            local: localStatus,
            jira: jiraStatus,
            description: `Auto-suggested based on pattern matching`
          });
          matched = true;
          break;
        }
      }

      if (!matched) {
        // 如果没有匹配，使用默认映射
        suggestions.push({
          local: this.config.defaultLocalStatus,
          jira: jiraStatus,
          description: 'Default mapping'
        });
      }
    }

    return suggestions;
  }

  /**
   * 导出配置
   */
  exportConfig(): StatusMappingConfig {
    return { ...this.config };
  }
}

export const jiraStatusMapper = new JiraStatusMapper();
