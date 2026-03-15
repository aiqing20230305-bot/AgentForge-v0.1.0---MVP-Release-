import { AgentData, Skill, TaskData, TaskStatus } from '../types'

/**
 * Mock Agent data for testing
 */
export const mockAgent: AgentData = {
  id: 'test-agent-1',
  name: 'Test Agent',
  avatar: '🤖',
  skills: [],
  level: 5,
  exp: 1200,
  completedTasks: 10,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  status: 'active',
  description: 'A test agent for unit testing',
  currentTask: null,
  energyStats: {
    totalTokensUsed: 5000,
    totalCostUSD: 0.25,
    averageTokensPerTask: 500,
    lastUpdated: new Date('2024-01-01').toISOString(),
  },
  energyBudget: {
    dailyLimit: 10000,
    monthlyLimit: 300000,
    alertThreshold: 0.8,
    autoPauseOnLimit: true,
  },
  levelSystem: {
    level: 5,
    currentExp: 1200,
    expToNextLevel: 1500,
    totalExp: 4200,
    skillPoints: 3,
  },
  achievements: [],
  pvpStats: {
    wins: 5,
    losses: 3,
    draws: 1,
    rating: 1250,
    rank: 'Silver',
  },
}

/**
 * Mock Skill data
 */
export const mockSkill: Skill = {
  id: 'skill-1',
  name: 'Token Efficiency',
  description: 'Reduces token cost by 10%',
  category: 'passive',
  level: 1,
  maxLevel: 5,
  cost: 1,
  requiredLevel: 1,
  dependencies: [],
  effects: {
    tokenCostMultiplier: 0.9,
  },
}

/**
 * Mock Task data
 */
export const mockTask: TaskData = {
  id: 'task-1',
  title: 'Test Task',
  description: 'A test task',
  status: 'pending' as TaskStatus,
  priority: 'medium',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  assignedTo: 'test-agent-1',
  tags: ['test'],
  estimatedDuration: 30,
}

/**
 * Create multiple mock agents
 */
export function createMockAgents(count: number): AgentData[] {
  return Array.from({ length: count }, (_, i) => ({
    ...mockAgent,
    id: `test-agent-${i + 1}`,
    name: `Test Agent ${i + 1}`,
    avatar: ['🤖', '🦾', '🧠', '⚡', '🔮'][i % 5],
  }))
}

/**
 * Create multiple mock tasks
 */
export function createMockTasks(count: number): TaskData[] {
  return Array.from({ length: count }, (_, i) => ({
    ...mockTask,
    id: `task-${i + 1}`,
    title: `Test Task ${i + 1}`,
    status: (['pending', 'in-progress', 'completed'] as TaskStatus[])[i % 3],
  }))
}

/**
 * Mock localStorage
 */
export const mockLocalStorage = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()
