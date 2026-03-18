/**
 * 预加载的示例Agent
 * 让新用户看到丰富的内容，理解产品功能
 */

export interface DemoAgent {
  id: string;
  name: string;
  avatar: string;
  level: number;
  vitality: number;
  skills: string[];
  evolution: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  tasks: {
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
    completedAt?: string;
  }[];
  metrics?: {
    totalTasks: number;
    successRate: number;
    avgResponseTime: string;
  };
  tags?: string[];
}

export const demoAgents: DemoAgent[] = [
  {
    id: 'demo-atlas-001',
    name: 'ATLAS',
    avatar: '🤖',
    level: 15,
    vitality: 85,
    skills: ['代码审查', '自动测试', '文档生成', 'Bug检测'],
    evolution: 'rare',
    description: '专注于代码质量的AI助手，帮助团队提升开发效率',
    tags: ['开发', '代码审查', 'CI/CD'],
    metrics: {
      totalTasks: 127,
      successRate: 94,
      avgResponseTime: '2.3s'
    },
    tasks: [
      {
        id: 'task-atlas-1',
        title: '审查Pull Request #123',
        status: 'completed',
        completedAt: '2小时前'
      },
      {
        id: 'task-atlas-2',
        title: '生成API文档',
        status: 'in_progress'
      },
      {
        id: 'task-atlas-3',
        title: '运行单元测试套件',
        status: 'completed',
        completedAt: '4小时前'
      }
    ]
  },
  {
    id: 'demo-nexus-002',
    name: 'NEXUS',
    avatar: '🧠',
    level: 22,
    vitality: 92,
    skills: ['数据分析', '可视化', '预测分析', '报表生成'],
    evolution: 'epic',
    description: '数据洞察专家，将复杂数据转化为可操作的见解',
    tags: ['数据', '分析', 'BI'],
    metrics: {
      totalTasks: 203,
      successRate: 97,
      avgResponseTime: '1.8s'
    },
    tasks: [
      {
        id: 'task-nexus-1',
        title: '分析用户行为趋势',
        status: 'completed',
        completedAt: '1天前'
      },
      {
        id: 'task-nexus-2',
        title: '生成月度运营报表',
        status: 'completed',
        completedAt: '3天前'
      },
      {
        id: 'task-nexus-3',
        title: '预测下季度增长',
        status: 'in_progress'
      }
    ]
  },
  {
    id: 'demo-echo-003',
    name: 'ECHO',
    avatar: '💬',
    level: 8,
    vitality: 78,
    skills: ['客服', '问答', '情感分析', '自动回复'],
    evolution: 'common',
    description: '友好的客服机器人，7x24小时响应用户咨询',
    tags: ['客服', '对话', 'NLP'],
    metrics: {
      totalTasks: 456,
      successRate: 88,
      avgResponseTime: '0.5s'
    },
    tasks: [
      {
        id: 'task-echo-1',
        title: '回复客户咨询 #789',
        status: 'completed',
        completedAt: '10分钟前'
      },
      {
        id: 'task-echo-2',
        title: '更新FAQ知识库',
        status: 'pending'
      }
    ]
  }
];

/**
 * 检查是否是演示Agent
 */
export function isDemoAgent(agentId: string): boolean {
  return agentId.startsWith('demo-');
}

/**
 * 获取演示Agent提示文本
 */
export function getDemoAgentLabel(): string {
  return '示例Agent';
}

/**
 * 加载演示数据到Store
 * 仅在首次启动时调用
 */
export function shouldLoadDemoAgents(): boolean {
  // 检查localStorage，如果已经有数据就不加载demo
  const hasExistingData = localStorage.getItem('agentforge_has_data');
  return !hasExistingData;
}

/**
 * 标记已加载数据
 */
export function markDataLoaded(): void {
  localStorage.setItem('agentforge_has_data', 'true');
}

/**
 * 重置演示数据（用于测试）
 */
export function resetDemoData(): void {
  localStorage.removeItem('agentforge_has_data');
}
