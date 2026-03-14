import { create } from 'zustand'
import type { Task, Project, TaskStatus } from '../types/task'

interface TaskState {
  // 数据
  tasks: Task[]
  projects: Project[]
  selectedAgentId: string | null
  selectedTask: Task | null

  // 过滤器
  filterStatus: TaskStatus | 'all'
  filterTimeRange: 'today' | 'week' | 'month' | 'all'
  searchTerm: string

  // Actions
  setSelectedAgent: (agentId: string | null) => void
  setSelectedTask: (task: Task | null) => void
  setFilterStatus: (status: TaskStatus | 'all') => void
  setFilterTimeRange: (range: 'today' | 'week' | 'month' | 'all') => void
  setSearchTerm: (term: string) => void

  // Task CRUD
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void

  // Project CRUD
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => void
  updateProject: (projectId: string, updates: Partial<Project>) => void
  deleteProject: (projectId: string) => void

  // 获取过滤后的任务
  getFilteredTasks: () => Task[]

  // 获取统计信息
  getTaskStats: (agentId?: string) => {
    total: number
    pending: number
    in_progress: number
    completed: number
    failed: number
  }
}

// 示例数据 - 展示用
const SAMPLE_TASKS: Task[] = [
  // ATLAS - Team Leader 的任务
  {
    id: 'task-atlas-1',
    title: '👑 制定Q2季度战略规划',
    description: '规划第二季度团队目标，协调4个Agent的工作分配和资源调度',
    status: 'completed',
    priority: 'urgent',
    agentId: 'atlas',
    agentName: 'ATLAS',
    createdAt: '2026-03-10T09:00:00Z',
    startedAt: '2026-03-10T09:30:00Z',
    completedAt: '2026-03-11T18:00:00Z',
    result: '✅ Q2战略规划完成，明确了3大目标和12个里程碑。团队资源分配方案获得批准。',
    tags: ['战略', '规划', '领导力']
  },
  {
    id: 'task-atlas-2',
    title: '🎯 协调跨团队技术攻坚',
    description: '统筹CLIP和ORACLE的协作，解决分布式系统架构难题',
    status: 'in_progress',
    priority: 'high',
    agentId: 'atlas',
    agentName: 'ATLAS',
    createdAt: '2026-03-13T08:00:00Z',
    startedAt: '2026-03-13T08:30:00Z',
    tags: ['协调', '架构', '团队']
  },
  {
    id: 'task-atlas-3',
    title: '📊 优化团队工作流程',
    description: '分析当前工作瓶颈，设计新的任务分配算法提升效率20%',
    status: 'pending',
    priority: 'medium',
    agentId: 'atlas',
    agentName: 'ATLAS',
    createdAt: '2026-03-13T14:00:00Z',
    tags: ['优化', '流程', '效率']
  },

  // CLIP - Full Stack Dev 的任务
  {
    id: 'task-clip-1',
    title: '💻 重构用户认证系统',
    description: '将认证系统从JWT迁移到OAuth 2.0，提升安全性',
    status: 'completed',
    priority: 'high',
    agentId: 'clip',
    agentName: 'CLIP',
    createdAt: '2026-03-09T10:00:00Z',
    startedAt: '2026-03-09T11:00:00Z',
    completedAt: '2026-03-12T16:00:00Z',
    result: '✅ OAuth 2.0认证系统上线，通过全部安全测试。迁移过程零停机。',
    tags: ['开发', '安全', '认证']
  },
  {
    id: 'task-clip-2',
    title: '🏗️ 设计微服务架构',
    description: '将单体应用拆分为5个微服务，实现独立部署和扩展',
    status: 'in_progress',
    priority: 'urgent',
    agentId: 'clip',
    agentName: 'CLIP',
    createdAt: '2026-03-12T09:00:00Z',
    startedAt: '2026-03-12T10:00:00Z',
    tags: ['架构', '微服务', '开发']
  },
  {
    id: 'task-clip-3',
    title: '🧪 编写E2E测试套件',
    description: '使用Playwright构建端到端测试，覆盖核心业务流程',
    status: 'completed',
    priority: 'medium',
    agentId: 'clip',
    agentName: 'CLIP',
    createdAt: '2026-03-08T14:00:00Z',
    startedAt: '2026-03-08T15:00:00Z',
    completedAt: '2026-03-09T12:00:00Z',
    result: '✅ E2E测试套件完成，覆盖率达85%。发现并修复3个边缘案例bug。',
    tags: ['测试', '质量', 'E2E']
  },
  {
    id: 'task-clip-4',
    title: '⚡ API性能优化',
    description: '优化数据库查询和缓存策略，将API响应时间降低50%',
    status: 'pending',
    priority: 'high',
    agentId: 'clip',
    agentName: 'CLIP',
    createdAt: '2026-03-13T16:00:00Z',
    tags: ['性能', '优化', 'API']
  },

  // ORACLE - Knowledge Keeper 的任务
  {
    id: 'task-oracle-1',
    title: '🔬 研究AGI前沿技术',
    description: '调研最新的AGI论文和技术突破，撰写技术报告',
    status: 'completed',
    priority: 'high',
    agentId: 'oracle',
    agentName: 'ORACLE',
    createdAt: '2026-03-07T08:00:00Z',
    startedAt: '2026-03-07T09:00:00Z',
    completedAt: '2026-03-10T20:00:00Z',
    result: '✅ 完成《AGI技术发展趋势2026》报告，总结12个关键突破，提出3个研究方向。',
    tags: ['研究', 'AGI', '前沿']
  },
  {
    id: 'task-oracle-2',
    title: '📚 构建知识图谱系统',
    description: '整合公司内部文档，构建智能知识检索系统',
    status: 'in_progress',
    priority: 'medium',
    agentId: 'oracle',
    agentName: 'ORACLE',
    createdAt: '2026-03-11T10:00:00Z',
    startedAt: '2026-03-11T11:00:00Z',
    tags: ['知识', '图谱', 'AI']
  },
  {
    id: 'task-oracle-3',
    title: '🧠 分析用户行为数据',
    description: '挖掘用户使用模式，发现产品改进机会',
    status: 'completed',
    priority: 'medium',
    agentId: 'oracle',
    agentName: 'ORACLE',
    createdAt: '2026-03-06T09:00:00Z',
    startedAt: '2026-03-06T10:00:00Z',
    completedAt: '2026-03-08T17:00:00Z',
    result: '✅ 用户行为分析报告完成，识别出5个高频使用场景和3个痛点。提出8条优化建议。',
    tags: ['数据', '分析', '洞察']
  },
  {
    id: 'task-oracle-4',
    title: '🎓 开发AI培训课程',
    description: '为团队成员设计AI技术培训课程，提升整体技术能力',
    status: 'pending',
    priority: 'low',
    agentId: 'oracle',
    agentName: 'ORACLE',
    createdAt: '2026-03-13T15:00:00Z',
    tags: ['培训', '教育', 'AI']
  },

  // SENTINEL - Security Chief 的任务
  {
    id: 'task-sentinel-1',
    title: '🛡️ 执行安全漏洞扫描',
    description: '对整个系统进行全面安全审计，识别潜在漏洞',
    status: 'completed',
    priority: 'urgent',
    agentId: 'sentinel',
    agentName: 'SENTINEL',
    createdAt: '2026-03-09T08:00:00Z',
    startedAt: '2026-03-09T09:00:00Z',
    completedAt: '2026-03-10T22:00:00Z',
    result: '✅ 安全扫描完成，发现7个中危漏洞已全部修复。系统安全评级提升至A+。',
    tags: ['安全', '扫描', '审计']
  },
  {
    id: 'task-sentinel-2',
    title: '🔐 升级加密协议',
    description: '将数据传输加密从AES-256升级到量子安全算法',
    status: 'in_progress',
    priority: 'high',
    agentId: 'sentinel',
    agentName: 'SENTINEL',
    createdAt: '2026-03-12T10:00:00Z',
    startedAt: '2026-03-12T11:00:00Z',
    tags: ['加密', '安全', '量子']
  },
  {
    id: 'task-sentinel-3',
    title: '👁️ 部署实时威胁监测',
    description: '建立24/7安全监控系统，实时检测异常访问行为',
    status: 'completed',
    priority: 'urgent',
    agentId: 'sentinel',
    agentName: 'SENTINEL',
    createdAt: '2026-03-08T09:00:00Z',
    startedAt: '2026-03-08T10:00:00Z',
    completedAt: '2026-03-09T16:00:00Z',
    result: '✅ 威胁监测系统上线，已拦截12次可疑访问。告警机制运行正常。',
    tags: ['监控', '威胁', '实时']
  },
  {
    id: 'task-sentinel-4',
    title: '📋 制定安全应急预案',
    description: '编写数据泄露、DDoS攻击等场景的应急响应流程',
    status: 'pending',
    priority: 'medium',
    agentId: 'sentinel',
    agentName: 'SENTINEL',
    createdAt: '2026-03-13T11:00:00Z',
    tags: ['应急', '预案', '安全']
  },

  // 一些早期的历史任务
  {
    id: 'task-atlas-old-1',
    title: '🚀 启动OpenClaw项目',
    description: '组建团队，制定项目路线图和开发计划',
    status: 'completed',
    priority: 'urgent',
    agentId: 'atlas',
    agentName: 'ATLAS',
    createdAt: '2026-02-15T09:00:00Z',
    startedAt: '2026-02-15T10:00:00Z',
    completedAt: '2026-02-18T18:00:00Z',
    result: '✅ OpenClaw项目启动，团队组建完成。制定了6个月开发路线图。',
    tags: ['启动', '规划', '项目']
  },
  {
    id: 'task-clip-old-1',
    title: '⚙️ 搭建开发环境',
    description: '配置CI/CD流水线，Docker容器化，K8s部署环境',
    status: 'completed',
    priority: 'high',
    agentId: 'clip',
    agentName: 'CLIP',
    createdAt: '2026-02-20T09:00:00Z',
    startedAt: '2026-02-20T10:00:00Z',
    completedAt: '2026-02-23T16:00:00Z',
    result: '✅ 开发环境就绪，CI/CD流水线上线。部署时间从1小时缩短至5分钟。',
    tags: ['DevOps', '基础设施', '部署']
  },
  {
    id: 'task-oracle-old-1',
    title: '📖 建立技术文档库',
    description: '收集整理技术文档，建立统一的知识管理平台',
    status: 'completed',
    priority: 'medium',
    agentId: 'oracle',
    agentName: 'ORACLE',
    createdAt: '2026-02-25T09:00:00Z',
    startedAt: '2026-02-25T10:00:00Z',
    completedAt: '2026-03-01T17:00:00Z',
    result: '✅ 技术文档库建成，收录300+篇文档。接入AI搜索，查询效率提升10倍。',
    tags: ['文档', '知识库', '管理']
  },
  {
    id: 'task-sentinel-old-1',
    title: '🔒 建立安全基线',
    description: '制定安全标准和最佳实践，建立安全审查流程',
    status: 'completed',
    priority: 'urgent',
    agentId: 'sentinel',
    agentName: 'SENTINEL',
    createdAt: '2026-02-28T09:00:00Z',
    startedAt: '2026-02-28T10:00:00Z',
    completedAt: '2026-03-05T18:00:00Z',
    result: '✅ 安全基线发布v1.0，包含50条安全规范。通过ISO 27001审核。',
    tags: ['安全', '标准', '合规']
  },

  // NEXUS - System Architect 的任务
  {
    id: 'task-nexus-1',
    title: '🏗️ 设计实时数据流架构',
    description: '构建低延迟数据处理管道，支持每秒100万事件处理',
    status: 'in_progress',
    priority: 'urgent',
    agentId: 'nexus',
    agentName: 'NEXUS',
    createdAt: '2026-03-12T09:00:00Z',
    startedAt: '2026-03-12T10:00:00Z',
    tags: ['架构', '实时', '性能']
  },
  {
    id: 'task-nexus-2',
    title: '☁️ 云原生架构升级',
    description: '将现有系统迁移到Kubernetes，实现弹性伸缩',
    status: 'completed',
    priority: 'high',
    agentId: 'nexus',
    agentName: 'NEXUS',
    createdAt: '2026-03-05T09:00:00Z',
    startedAt: '2026-03-05T10:00:00Z',
    completedAt: '2026-03-10T20:00:00Z',
    result: '✅ K8s集群上线，服务可用性99.99%。资源利用率提升40%，成本降低30%。',
    tags: ['云原生', 'K8s', '迁移']
  },
  {
    id: 'task-nexus-3',
    title: '🔄 设计服务网格架构',
    description: '引入Istio实现微服务治理，提升系统可观测性',
    status: 'pending',
    priority: 'medium',
    agentId: 'nexus',
    agentName: 'NEXUS',
    createdAt: '2026-03-13T16:00:00Z',
    tags: ['服务网格', '微服务', '治理']
  },
  {
    id: 'task-nexus-4',
    title: '📐 制定架构设计规范',
    description: '编写架构设计文档模板和评审标准，建立架构委员会',
    status: 'completed',
    priority: 'medium',
    agentId: 'nexus',
    agentName: 'NEXUS',
    createdAt: '2026-02-22T09:00:00Z',
    startedAt: '2026-02-22T10:00:00Z',
    completedAt: '2026-02-28T18:00:00Z',
    result: '✅ 架构设计规范v1.0发布，包含模板、checklist和评审流程。已完成5次架构评审。',
    tags: ['规范', '文档', '流程']
  },

  // ECHO - Data Analyst 的任务
  {
    id: 'task-echo-1',
    title: '📊 分析用户增长趋势',
    description: '分析过去6个月的用户数据，预测未来增长曲线',
    status: 'in_progress',
    priority: 'high',
    agentId: 'echo',
    agentName: 'ECHO',
    createdAt: '2026-03-11T09:00:00Z',
    startedAt: '2026-03-11T10:00:00Z',
    tags: ['增长', '预测', '分析']
  },
  {
    id: 'task-echo-2',
    title: '💹 构建实时数据看板',
    description: '使用Grafana搭建实时业务监控大屏，可视化核心指标',
    status: 'completed',
    priority: 'urgent',
    agentId: 'echo',
    agentName: 'ECHO',
    createdAt: '2026-03-07T09:00:00Z',
    startedAt: '2026-03-07T10:00:00Z',
    completedAt: '2026-03-09T18:00:00Z',
    result: '✅ 实时数据看板上线，展示20+核心指标。管理层满意度100%。',
    tags: ['可视化', 'Grafana', '监控']
  },
  {
    id: 'task-echo-3',
    title: '🔍 用户画像建模',
    description: '基于行为数据构建用户画像模型，支持精准营销',
    status: 'completed',
    priority: 'high',
    agentId: 'echo',
    agentName: 'ECHO',
    createdAt: '2026-03-01T09:00:00Z',
    startedAt: '2026-03-01T10:00:00Z',
    completedAt: '2026-03-06T17:00:00Z',
    result: '✅ 用户画像模型上线，识别出8个用户群体。营销转化率提升25%。',
    tags: ['建模', '用户画像', '营销']
  },
  {
    id: 'task-echo-4',
    title: '⚠️ 异常数据检测',
    description: '开发数据质量监控系统，及时发现数据异常',
    status: 'pending',
    priority: 'medium',
    agentId: 'echo',
    agentName: 'ECHO',
    createdAt: '2026-03-13T17:00:00Z',
    tags: ['监控', '数据质量', '告警']
  },

  // NOVA - Innovation Specialist 的任务
  {
    id: 'task-nova-1',
    title: '🚀 探索AI Agent自主协作',
    description: '研究Multi-Agent协作框架，实现Agent之间的自主通信和任务分配',
    status: 'in_progress',
    priority: 'high',
    agentId: 'nova',
    agentName: 'NOVA',
    createdAt: '2026-03-10T09:00:00Z',
    startedAt: '2026-03-10T10:00:00Z',
    tags: ['AI', 'Multi-Agent', '创新']
  },
  {
    id: 'task-nova-2',
    title: '🧪 技术预研：量子计算应用',
    description: '调研量子计算在密码学和优化问题中的应用场景',
    status: 'completed',
    priority: 'medium',
    agentId: 'nova',
    agentName: 'NOVA',
    createdAt: '2026-03-03T09:00:00Z',
    startedAt: '2026-03-03T10:00:00Z',
    completedAt: '2026-03-08T18:00:00Z',
    result: '✅ 量子计算预研报告完成，评估了3个应用场景。建议在加密领域先行试点。',
    tags: ['量子', '预研', '密码学']
  },
  {
    id: 'task-nova-3',
    title: '💡 创新项目孵化：智能代码助手',
    description: '开发AI驱动的代码补全和重构工具原型',
    status: 'completed',
    priority: 'high',
    agentId: 'nova',
    agentName: 'NOVA',
    createdAt: '2026-02-20T09:00:00Z',
    startedAt: '2026-02-20T10:00:00Z',
    completedAt: '2026-03-02T18:00:00Z',
    result: '✅ 智能代码助手MVP完成，提升开发效率30%。已有50+开发者试用，反馈积极。',
    tags: ['AI', '代码助手', '原型']
  },
  {
    id: 'task-nova-4',
    title: '🌐 Web3技术可行性分析',
    description: '研究区块链和去中心化技术在产品中的应用潜力',
    status: 'pending',
    priority: 'low',
    agentId: 'nova',
    agentName: 'NOVA',
    createdAt: '2026-03-13T18:00:00Z',
    tags: ['Web3', '区块链', '研究']
  },

  // AEGIS - Quality Assurance 的任务
  {
    id: 'task-aegis-1',
    title: '🎯 执行全链路压测',
    description: '模拟100万并发用户，验证系统极限性能',
    status: 'in_progress',
    priority: 'urgent',
    agentId: 'aegis',
    agentName: 'AEGIS',
    createdAt: '2026-03-12T09:00:00Z',
    startedAt: '2026-03-12T10:00:00Z',
    tags: ['压测', '性能', '测试']
  },
  {
    id: 'task-aegis-2',
    title: '🤖 自动化测试框架升级',
    description: '引入AI辅助测试，实现智能用例生成和自愈能力',
    status: 'completed',
    priority: 'high',
    agentId: 'aegis',
    agentName: 'AEGIS',
    createdAt: '2026-03-05T09:00:00Z',
    startedAt: '2026-03-05T10:00:00Z',
    completedAt: '2026-03-11T18:00:00Z',
    result: '✅ AI测试框架上线，用例生成效率提升5倍。测试覆盖率从70%提升到95%。',
    tags: ['自动化', 'AI', '测试框架']
  },
  {
    id: 'task-aegis-3',
    title: '📈 建立质量度量体系',
    description: '定义代码质量、测试质量、产品质量的量化指标',
    status: 'completed',
    priority: 'medium',
    agentId: 'aegis',
    agentName: 'AEGIS',
    createdAt: '2026-02-25T09:00:00Z',
    startedAt: '2026-02-25T10:00:00Z',
    completedAt: '2026-03-04T18:00:00Z',
    result: '✅ 质量度量体系建立，包含30+指标。已接入CI/CD流水线，实时监控质量趋势。',
    tags: ['质量', '度量', '指标']
  },
  {
    id: 'task-aegis-4',
    title: '🐛 Bug修复质量审查',
    description: '回顾近期修复的bug，分析根因并制定预防措施',
    status: 'pending',
    priority: 'medium',
    agentId: 'aegis',
    agentName: 'AEGIS',
    createdAt: '2026-03-13T19:00:00Z',
    tags: ['Bug', '根因分析', '质量改进']
  }
]

const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'project-1',
    name: '飞书机器人 v2.0',
    description: '升级飞书机器人，增加多模型支持和高级功能',
    status: 'active',
    agentId: 'atlas',
    agentName: 'ATLAS',
    tasks: [],
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-11T00:00:00Z'
  },
  {
    id: 'project-2',
    name: 'AI 性能优化',
    description: '优化 AI 调用性能，降低响应延迟',
    status: 'active',
    agentId: 'clip',
    agentName: 'CLIP',
    tasks: [],
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-03-11T00:00:00Z'
  }
]

export const useTaskStore = create<TaskState>((set, get) => ({
  // 初始数据
  tasks: SAMPLE_TASKS,
  projects: SAMPLE_PROJECTS,
  selectedAgentId: null,
  selectedTask: null,
  filterStatus: 'all',
  filterTimeRange: 'all',
  searchTerm: '',

  // Setters
  setSelectedAgent: agentId => set({ selectedAgentId: agentId }),
  setSelectedTask: task => set({ selectedTask: task }),
  setFilterStatus: status => set({ filterStatus: status }),
  setFilterTimeRange: range => set({ filterTimeRange: range }),
  setSearchTerm: term => set({ searchTerm: term }),

  // Task CRUD
  addTask: taskData => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    set(state => ({
      tasks: [newTask, ...state.tasks]
    }))
  },

  updateTask: (taskId, updates) => {
    set(state => ({
      tasks: state.tasks.map(task => (task.id === taskId ? { ...task, ...updates } : task))
    }))
  },

  deleteTask: taskId => {
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== taskId)
    }))
  },

  // Project CRUD
  addProject: projectData => {
    const newProject: Project = {
      ...projectData,
      id: `project-${Date.now()}`,
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    set(state => ({
      projects: [newProject, ...state.projects]
    }))
  },

  updateProject: (projectId, updates) => {
    set(state => ({
      projects: state.projects.map(project =>
        project.id === projectId
          ? { ...project, ...updates, updatedAt: new Date().toISOString() }
          : project
      )
    }))
  },

  deleteProject: projectId => {
    set(state => ({
      projects: state.projects.filter(project => project.id !== projectId)
    }))
  },

  // 获取过滤后的任务
  getFilteredTasks: () => {
    const { tasks, selectedAgentId, filterStatus, filterTimeRange, searchTerm } = get()
    let filtered = tasks

    // 按 Agent 过滤
    if (selectedAgentId) {
      filtered = filtered.filter(task => task.agentId === selectedAgentId.toLowerCase())
    }

    // 按状态过滤
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus)
    }

    // 按时间过滤
    if (filterTimeRange !== 'all') {
      const now = new Date()
      const timeRanges = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000
      }
      const range = timeRanges[filterTimeRange]
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.createdAt)
        return now.getTime() - taskDate.getTime() <= range
      })
    }

    // 按搜索词过滤 (搜索标题、描述、标签、Agent名称)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(term) ||
          task.description.toLowerCase().includes(term) ||
          task.agentName.toLowerCase().includes(term) ||
          (task.tags && task.tags.some(tag => tag.toLowerCase().includes(term)))
      )
    }

    // 按创建时间倒序排序
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  // 获取统计信息
  getTaskStats: agentId => {
    const { tasks } = get()
    const filtered = agentId ? tasks.filter(task => task.agentId === agentId.toLowerCase()) : tasks

    return {
      total: filtered.length,
      pending: filtered.filter(t => t.status === 'pending').length,
      in_progress: filtered.filter(t => t.status === 'in_progress').length,
      completed: filtered.filter(t => t.status === 'completed').length,
      failed: filtered.filter(t => t.status === 'failed').length
    }
  }
}))
