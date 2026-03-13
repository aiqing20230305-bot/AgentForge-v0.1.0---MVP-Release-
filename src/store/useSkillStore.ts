import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SkillCategory =
  | 'programming'
  | 'management'
  | 'research'
  | 'security'
  | 'design'
  | 'communication'

export interface Skill {
  id: string
  name: string
  category: SkillCategory
  level: number // 1-10
  exp: number // 当前经验值
  maxExp: number // 升级所需经验值
  description: string
  icon: string // emoji 图标
  agentId: string // 拥有此技能的 Agent ID
  createdAt: string
  updatedAt: string
}

interface SkillStore {
  // 技能列表
  skills: Skill[]

  // 添加技能
  addSkill: (skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>) => void

  // 移除技能
  removeSkill: (skillId: string) => void

  // 更新技能
  updateSkill: (skillId: string, updates: Partial<Skill>) => void

  // 获取 Agent 的所有技能
  getAgentSkills: (agentId: string) => Skill[]

  // 获取指定分类的技能
  getSkillsByCategory: (agentId: string, category: SkillCategory) => Skill[]

  // 技能升级
  levelUpSkill: (skillId: string) => void

  // 增加技能经验
  addSkillExp: (skillId: string, exp: number) => void

  // 批量导入技能（用于初始化）
  importSkills: (skills: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>[]) => void

  // 清空所有技能
  clearAll: () => void
}

// 技能分类配置
export const SKILL_CATEGORY_CONFIG = {
  programming: {
    label: '编程',
    color: '#3b82f6',
    icon: '💻'
  },
  management: {
    label: '管理',
    color: '#8b5cf6',
    icon: '📊'
  },
  research: {
    label: '研究',
    color: '#10b981',
    icon: '🔬'
  },
  security: {
    label: '安全',
    color: '#ef4444',
    icon: '🛡️'
  },
  design: {
    label: '设计',
    color: '#f59e0b',
    icon: '🎨'
  },
  communication: {
    label: '沟通',
    color: '#06b6d4',
    icon: '💬'
  }
}

// 预定义技能库
export const SKILL_LIBRARY: Omit<Skill, 'id' | 'agentId' | 'createdAt' | 'updatedAt'>[] = [
  // 编程技能
  {
    name: 'Python',
    category: 'programming',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: 'Python 编程语言',
    icon: '🐍'
  },
  {
    name: 'JavaScript',
    category: 'programming',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: 'JavaScript/TypeScript 编程',
    icon: '⚡'
  },
  {
    name: 'React',
    category: 'programming',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: 'React 前端框架',
    icon: '⚛️'
  },
  {
    name: 'Node.js',
    category: 'programming',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: 'Node.js 后端开发',
    icon: '🟢'
  },
  {
    name: 'Database',
    category: 'programming',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '数据库设计与管理',
    icon: '🗄️'
  },
  {
    name: 'DevOps',
    category: 'programming',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: 'CI/CD 与运维',
    icon: '🔧'
  },

  // 管理技能
  {
    name: 'Project Management',
    category: 'management',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '项目管理',
    icon: '📋'
  },
  {
    name: 'Team Leadership',
    category: 'management',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '团队领导力',
    icon: '👥'
  },
  {
    name: 'Strategy Planning',
    category: 'management',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '战略规划',
    icon: '🎯'
  },
  {
    name: 'Resource Allocation',
    category: 'management',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '资源分配',
    icon: '⚖️'
  },

  // 研究技能
  {
    name: 'Data Analysis',
    category: 'research',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '数据分析',
    icon: '📈'
  },
  {
    name: 'Machine Learning',
    category: 'research',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '机器学习',
    icon: '🤖'
  },
  {
    name: 'Research Methods',
    category: 'research',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '研究方法论',
    icon: '🔍'
  },
  {
    name: 'Documentation',
    category: 'research',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '文档撰写',
    icon: '📝'
  },

  // 安全技能
  {
    name: 'Cybersecurity',
    category: 'security',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '网络安全',
    icon: '🔐'
  },
  {
    name: 'Penetration Testing',
    category: 'security',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '渗透测试',
    icon: '🎯'
  },
  {
    name: 'Security Audit',
    category: 'security',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '安全审计',
    icon: '🔍'
  },
  {
    name: 'Encryption',
    category: 'security',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '加密技术',
    icon: '🔒'
  },

  // 设计技能
  {
    name: 'UI Design',
    category: 'design',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: 'UI 界面设计',
    icon: '🎨'
  },
  {
    name: 'UX Research',
    category: 'design',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '用户体验研究',
    icon: '👁️'
  },
  {
    name: 'Prototyping',
    category: 'design',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '原型设计',
    icon: '✏️'
  },

  // 沟通技能
  {
    name: 'Presentation',
    category: 'communication',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '演讲展示',
    icon: '🎤'
  },
  {
    name: 'Technical Writing',
    category: 'communication',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '技术写作',
    icon: '📄'
  },
  {
    name: 'Negotiation',
    category: 'communication',
    level: 1,
    exp: 0,
    maxExp: 100,
    description: '谈判协商',
    icon: '🤝'
  }
]

export const useSkillStore = create<SkillStore>()(
  persist(
    (set, get) => ({
      skills: [],

      addSkill: skill => {
        const newSkill: Skill = {
          ...skill,
          id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        set(state => ({
          skills: [...state.skills, newSkill]
        }))
      },

      removeSkill: skillId => {
        set(state => ({
          skills: state.skills.filter(s => s.id !== skillId)
        }))
      },

      updateSkill: (skillId, updates) => {
        set(state => ({
          skills: state.skills.map(s =>
            s.id === skillId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
          )
        }))
      },

      getAgentSkills: agentId => {
        return get().skills.filter(s => s.agentId === agentId)
      },

      getSkillsByCategory: (agentId, category) => {
        return get().skills.filter(s => s.agentId === agentId && s.category === category)
      },

      levelUpSkill: skillId => {
        const skill = get().skills.find(s => s.id === skillId)
        if (!skill) return

        if (skill.exp >= skill.maxExp) {
          get().updateSkill(skillId, {
            level: skill.level + 1,
            exp: 0,
            maxExp: Math.floor(skill.maxExp * 1.5)
          })
        }
      },

      addSkillExp: (skillId, exp) => {
        const skill = get().skills.find(s => s.id === skillId)
        if (!skill) return

        const newExp = skill.exp + exp

        if (newExp >= skill.maxExp) {
          // 自动升级
          get().updateSkill(skillId, {
            level: skill.level + 1,
            exp: 0,
            maxExp: Math.floor(skill.maxExp * 1.5)
          })
        } else {
          get().updateSkill(skillId, {
            exp: newExp
          })
        }
      },

      importSkills: skills => {
        const newSkills: Skill[] = skills.map(skill => ({
          ...skill,
          id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))

        set(state => ({
          skills: [...state.skills, ...newSkills]
        }))
      },

      clearAll: () => {
        set({ skills: [] })
      }
    }),
    {
      name: 'agent-skill-store'
    }
  )
)
