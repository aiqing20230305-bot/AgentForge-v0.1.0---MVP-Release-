/**
 * 🚀 流行Agent模板库
 * 一键创建常见场景的Agent
 */

export interface AgentTemplate {
  id: string;
  name: string;
  avatar: string;
  category: 'development' | 'data' | 'content' | 'support' | 'devops';
  description: string;
  skills: string[];
  useCases: string[];
  setupTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  popular: boolean;
  tags: string[];
}

export const popularAgentTemplates: AgentTemplate[] = [
  // 开发工具
  {
    id: 'github-pr-reviewer',
    name: 'GitHub PR审查员',
    avatar: '🔍',
    category: 'development',
    description: '自动审查代码，检查测试覆盖，提供改进建议',
    skills: ['代码审查', '静态分析', '测试覆盖检查', '安全扫描'],
    useCases: ['自动审查Pull Request', '检查代码风格', '发现潜在bug'],
    setupTime: '5分钟',
    difficulty: 'easy',
    popular: true,
    tags: ['代码审查', 'CI/CD', '自动化']
  },
  {
    id: 'data-analyst',
    name: '数据分析师',
    avatar: '📊',
    category: 'data',
    description: '连接数据库，生成可视化，自动洞察',
    skills: ['SQL查询', '数据清洗', '统计分析', '可视化生成'],
    useCases: ['自动生成日报', '用户行为分析', 'KPI监控'],
    setupTime: '15分钟',
    difficulty: 'medium',
    popular: true,
    tags: ['数据分析', 'BI', '可视化']
  },
  {
    id: 'content-creator',
    name: '内容创作助手',
    avatar: '✍️',
    category: 'content',
    description: '博客写作，SEO优化，社交媒体内容',
    skills: ['博客写作', 'SEO优化', '标题生成', '社交媒体文案'],
    useCases: ['撰写技术博客', '生成社交媒体帖子', 'SEO优化'],
    setupTime: '5分钟',
    difficulty: 'easy',
    popular: true,
    tags: ['内容创作', 'SEO', '营销']
  },
  {
    id: 'customer-support-bot',
    name: '客服机器人',
    avatar: '💬',
    category: 'support',
    description: 'FAQ问答，工单管理，情感分析',
    skills: ['FAQ问答', '工单管理', '情感分析', '多语言支持'],
    useCases: ['自动回复常见问题', '工单分类', '客户情绪识别'],
    setupTime: '10分钟',
    difficulty: 'easy',
    popular: true,
    tags: ['客服', 'NLP', '自动化']
  },
  {
    id: 'devops-engineer',
    name: 'DevOps助手',
    avatar: '🔧',
    category: 'devops',
    description: '监控告警，日志分析，自动修复',
    skills: ['监控告警', '日志分析', '根因分析', '自动修复'],
    useCases: ['实时告警处理', '日志聚合分析', '故障自动修复'],
    setupTime: '20分钟',
    difficulty: 'hard',
    popular: false,
    tags: ['DevOps', '监控', '自动化']
  }
];

export function getPopularTemplates() {
  return popularAgentTemplates.filter(t => t.popular);
}
