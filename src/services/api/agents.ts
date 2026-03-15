/**
 * Agent API
 * CRUD operations for AI agents
 */

import { apiRequest } from './client'

/**
 * Agent data structure (matches backend model)
 */
export interface Agent {
  id: string
  userId: string
  name: string
  aiModel: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet' | 'claude-3-haiku'
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  status: 'idle' | 'busy' | 'error'
  level: number
  experience: number
  tasksCompleted: number
  tokensUsed: number
  totalUptime: number
  avatar?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Agent creation data
 */
export interface CreateAgentData {
  name: string
  aiModel?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  avatar?: string
  tags?: string[]
}

/**
 * Agent update data
 */
export interface UpdateAgentData {
  name?: string
  aiModel?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  status?: 'idle' | 'busy' | 'error'
  avatar?: string
  tags?: string[]
}

/**
 * Agent statistics update
 */
export interface AgentStatsUpdate {
  experience?: number
  tasksCompleted?: number
  tokensUsed?: number
  totalUptime?: number
}

/**
 * Agent query parameters
 */
export interface AgentQueryParams {
  status?: 'idle' | 'busy' | 'error'
  sortBy?: string
  order?: 'asc' | 'desc'
}

/**
 * Agent API methods
 */
export const agentApi = {
  /**
   * Get all agents
   * GET /agents
   */
  getAll: async (params?: AgentQueryParams): Promise<Agent[]> => {
    return apiRequest.get<Agent[]>('/agents', params)
  },

  /**
   * Get single agent by ID
   * GET /agents/:id
   */
  getById: async (id: string): Promise<Agent> => {
    return apiRequest.get<Agent>(`/agents/${id}`)
  },

  /**
   * Create new agent
   * POST /agents
   */
  create: async (data: CreateAgentData): Promise<Agent> => {
    return apiRequest.post<Agent>('/agents', data)
  },

  /**
   * Update agent
   * PUT /agents/:id
   */
  update: async (id: string, data: UpdateAgentData): Promise<Agent> => {
    return apiRequest.put<Agent>(`/agents/${id}`, data)
  },

  /**
   * Delete agent
   * DELETE /agents/:id
   */
  delete: async (id: string): Promise<void> => {
    return apiRequest.delete(`/agents/${id}`)
  },

  /**
   * Update agent statistics
   * PATCH /agents/:id/stats
   */
  updateStats: async (id: string, stats: AgentStatsUpdate): Promise<Agent> => {
    return apiRequest.patch<Agent>(`/agents/${id}/stats`, stats)
  }
}
