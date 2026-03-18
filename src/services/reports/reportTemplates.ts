/**
 * Report Templates - 预定义报表模板
 *
 * 提供10个常用报表模板
 */

import type { ReportQuery } from './types';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'agent' | 'task' | 'team' | 'performance' | 'analytics' | 'gamification';
  icon: string;
  query: ReportQuery;
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'table';
  defaultFilters?: Record<string, any>;
}

export const reportTemplates: ReportTemplate[] = [
  // 1. Agent性能报表
  {
    id: 'agent-performance',
    name: 'Agent Performance Report',
    description: '分析Agent的执行性能和效率',
    category: 'agent',
    icon: '🤖',
    query: {
      collection: 'agents',
      fields: ['name', 'tasksCompleted', 'successRate', 'avgExecutionTime', 'energyLevel'],
      filters: [
        {
          field: 'status',
          operator: 'equals',
          value: 'active',
        },
      ],
      groupBy: ['status'],
      orderBy: [
        {
          field: 'tasksCompleted',
          direction: 'desc',
        },
      ],
      limit: 50,
    },
    chartType: 'bar',
    defaultFilters: {
      dateRange: '30days',
    },
  },

  // 2. 任务完成率报表
  {
    id: 'task-completion',
    name: 'Task Completion Report',
    description: '任务完成情况和趋势分析',
    category: 'task',
    icon: '✅',
    query: {
      collection: 'tasks',
      fields: ['status', 'priority', 'completedAt', 'duration'],
      aggregations: [
        {
          type: 'count',
          field: 'id',
          alias: 'total_tasks',
        },
        {
          type: 'avg',
          field: 'duration',
          alias: 'avg_duration',
        },
      ],
      groupBy: ['status', 'priority'],
      filters: [
        {
          field: 'createdAt',
          operator: 'gte',
          value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    chartType: 'pie',
  },

  // 3. 团队协作报表
  {
    id: 'team-collaboration',
    name: 'Team Collaboration Report',
    description: '团队协作效率和互动分析',
    category: 'team',
    icon: '👥',
    query: {
      collection: 'teams',
      fields: ['name', 'memberCount', 'activeProjects', 'messagesCount', 'collaborationScore'],
      aggregations: [
        {
          type: 'sum',
          field: 'activeProjects',
          alias: 'total_projects',
        },
        {
          type: 'avg',
          field: 'collaborationScore',
          alias: 'avg_collaboration',
        },
      ],
      groupBy: ['department'],
      orderBy: [
        {
          field: 'collaborationScore',
          direction: 'desc',
        },
      ],
    },
    chartType: 'bar',
  },

  // 4. 系统性能报表
  {
    id: 'system-performance',
    name: 'System Performance Report',
    description: '系统整体性能指标监控',
    category: 'performance',
    icon: '⚡',
    query: {
      collection: 'metrics',
      fields: ['timestamp', 'cpuUsage', 'memoryUsage', 'responseTime', 'requestCount'],
      aggregations: [
        {
          type: 'avg',
          field: 'responseTime',
          alias: 'avg_response_time',
        },
        {
          type: 'max',
          field: 'cpuUsage',
          alias: 'peak_cpu',
        },
        {
          type: 'max',
          field: 'memoryUsage',
          alias: 'peak_memory',
        },
      ],
      filters: [
        {
          field: 'timestamp',
          operator: 'gte',
          value: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      orderBy: [
        {
          field: 'timestamp',
          direction: 'asc',
        },
      ],
    },
    chartType: 'line',
  },

  // 5. 用户活跃度报表
  {
    id: 'user-activity',
    name: 'User Activity Report',
    description: '用户活跃度和行为分析',
    category: 'analytics',
    icon: '📊',
    query: {
      collection: 'users',
      fields: ['id', 'lastActiveAt', 'actionsCount', 'sessionsCount', 'totalTimeSpent'],
      aggregations: [
        {
          type: 'count',
          field: 'id',
          alias: 'total_users',
        },
        {
          type: 'avg',
          field: 'actionsCount',
          alias: 'avg_actions',
        },
        {
          type: 'sum',
          field: 'totalTimeSpent',
          alias: 'total_time',
        },
      ],
      filters: [
        {
          field: 'lastActiveAt',
          operator: 'gte',
          value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      groupBy: ['accountType'],
    },
    chartType: 'area',
  },

  // 6. 成就解锁报表
  {
    id: 'achievement-unlocks',
    name: 'Achievement Unlocks Report',
    description: '成就解锁统计和趋势',
    category: 'gamification',
    icon: '🏆',
    query: {
      collection: 'achievements',
      fields: ['name', 'category', 'tier', 'unlockedCount', 'rarity'],
      aggregations: [
        {
          type: 'sum',
          field: 'unlockedCount',
          alias: 'total_unlocks',
        },
        {
          type: 'avg',
          field: 'rarity',
          alias: 'avg_rarity',
        },
      ],
      groupBy: ['category', 'tier'],
      orderBy: [
        {
          field: 'unlockedCount',
          direction: 'desc',
        },
      ],
    },
    chartType: 'bar',
  },

  // 7. 收入分析报表
  {
    id: 'revenue-analysis',
    name: 'Revenue Analysis Report',
    description: '收入来源和增长分析',
    category: 'analytics',
    icon: '💰',
    query: {
      collection: 'transactions',
      fields: ['date', 'amount', 'type', 'source', 'currency'],
      aggregations: [
        {
          type: 'sum',
          field: 'amount',
          alias: 'total_revenue',
        },
        {
          type: 'avg',
          field: 'amount',
          alias: 'avg_transaction',
        },
        {
          type: 'count',
          field: 'id',
          alias: 'transaction_count',
        },
      ],
      groupBy: ['type', 'source'],
      filters: [
        {
          field: 'status',
          operator: 'equals',
          value: 'completed',
        },
        {
          field: 'date',
          operator: 'gte',
          value: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      orderBy: [
        {
          field: 'date',
          direction: 'asc',
        },
      ],
    },
    chartType: 'line',
  },

  // 8. 错误日志报表
  {
    id: 'error-logs',
    name: 'Error Logs Report',
    description: '系统错误和异常统计',
    category: 'performance',
    icon: '⚠️',
    query: {
      collection: 'logs',
      fields: ['timestamp', 'level', 'message', 'source', 'stackTrace'],
      aggregations: [
        {
          type: 'count',
          field: 'id',
          alias: 'error_count',
        },
      ],
      filters: [
        {
          field: 'level',
          operator: 'in',
          value: ['error', 'critical'],
        },
        {
          field: 'timestamp',
          operator: 'gte',
          value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      groupBy: ['source', 'level'],
      orderBy: [
        {
          field: 'timestamp',
          direction: 'desc',
        },
      ],
      limit: 100,
    },
    chartType: 'table',
  },

  // 9. Agent技能分布报表
  {
    id: 'agent-skills',
    name: 'Agent Skills Distribution Report',
    description: 'Agent技能分布和能力分析',
    category: 'agent',
    icon: '🎯',
    query: {
      collection: 'agents',
      fields: ['name', 'skills', 'level', 'specialization'],
      aggregations: [
        {
          type: 'count',
          field: 'id',
          alias: 'agent_count',
        },
      ],
      groupBy: ['specialization', 'level'],
      orderBy: [
        {
          field: 'level',
          direction: 'desc',
        },
      ],
    },
    chartType: 'pie',
  },

  // 10. 排行榜报表
  {
    id: 'leaderboard-summary',
    name: 'Leaderboard Summary Report',
    description: '排行榜排名和用户表现总结',
    category: 'gamification',
    icon: '🏅',
    query: {
      collection: 'users',
      fields: ['username', 'xp', 'level', 'rank', 'achievements', 'streak'],
      aggregations: [
        {
          type: 'avg',
          field: 'xp',
          alias: 'avg_xp',
        },
        {
          type: 'max',
          field: 'level',
          alias: 'max_level',
        },
      ],
      filters: [
        {
          field: 'status',
          operator: 'equals',
          value: 'active',
        },
      ],
      orderBy: [
        {
          field: 'xp',
          direction: 'desc',
        },
      ],
      limit: 100,
    },
    chartType: 'table',
  },
];

// 按类别分组的报表
export const reportsByCategory = reportTemplates.reduce((acc, template) => {
  if (!acc[template.category]) {
    acc[template.category] = [];
  }
  acc[template.category].push(template);
  return acc;
}, {} as Record<string, ReportTemplate[]>);

// 获取报表模板
export function getReportTemplate(id: string): ReportTemplate | undefined {
  return reportTemplates.find((template) => template.id === id);
}

// 获取类别下的所有报表
export function getReportsByCategory(category: ReportTemplate['category']): ReportTemplate[] {
  return reportsByCategory[category] || [];
}

// 搜索报表模板
export function searchReportTemplates(query: string): ReportTemplate[] {
  const lowerQuery = query.toLowerCase();
  return reportTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.category.toLowerCase().includes(lowerQuery)
  );
}
