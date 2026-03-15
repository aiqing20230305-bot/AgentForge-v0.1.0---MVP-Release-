/**
 * Team API
 * CRUD operations for collaborative teams
 */

import { apiRequest } from './client'

/**
 * Team member structure
 */
export interface TeamMember {
  agentId: string
  agentName: string
  role: 'leader' | 'member'
  joinedAt: string
}

/**
 * Team data structure (matches backend model)
 */
export interface Team {
  id: string
  userId: string
  name: string
  description?: string
  members: TeamMember[]
  tasksCompleted: number
  totalTokensUsed: number
  isPublic: boolean
  maxMembers: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Team creation data
 */
export interface CreateTeamData {
  name: string
  description?: string
  isPublic?: boolean
  maxMembers?: number
  tags?: string[]
}

/**
 * Team update data
 */
export interface UpdateTeamData {
  name?: string
  description?: string
  isPublic?: boolean
  maxMembers?: number
  tags?: string[]
}

/**
 * Team member addition data
 */
export interface AddTeamMemberData {
  agentId: string
  role?: 'leader' | 'member'
}

/**
 * Team statistics update
 */
export interface TeamStatsUpdate {
  tasksCompleted?: number
  totalTokensUsed?: number
}

/**
 * Team query parameters
 */
export interface TeamQueryParams {
  isPublic?: boolean
  sortBy?: string
  order?: 'asc' | 'desc'
}

/**
 * Team API methods
 */
export const teamApi = {
  /**
   * Get all teams
   * GET /teams
   */
  getAll: async (params?: TeamQueryParams): Promise<Team[]> => {
    return apiRequest.get<Team[]>('/teams', params)
  },

  /**
   * Get single team by ID
   * GET /teams/:id
   */
  getById: async (id: string): Promise<Team> => {
    return apiRequest.get<Team>(`/teams/${id}`)
  },

  /**
   * Create new team
   * POST /teams
   */
  create: async (data: CreateTeamData): Promise<Team> => {
    return apiRequest.post<Team>('/teams', data)
  },

  /**
   * Update team
   * PUT /teams/:id
   */
  update: async (id: string, data: UpdateTeamData): Promise<Team> => {
    return apiRequest.put<Team>(`/teams/${id}`, data)
  },

  /**
   * Delete team
   * DELETE /teams/:id
   */
  delete: async (id: string): Promise<void> => {
    return apiRequest.delete(`/teams/${id}`)
  },

  /**
   * Add member to team
   * POST /teams/:id/members
   */
  addMember: async (teamId: string, data: AddTeamMemberData): Promise<Team> => {
    return apiRequest.post<Team>(`/teams/${teamId}/members`, data)
  },

  /**
   * Remove member from team
   * DELETE /teams/:id/members/:agentId
   */
  removeMember: async (teamId: string, agentId: string): Promise<Team> => {
    return apiRequest.delete<Team>(`/teams/${teamId}/members/${agentId}`)
  },

  /**
   * Update team statistics
   * PATCH /teams/:id/stats
   */
  updateStats: async (id: string, stats: TeamStatsUpdate): Promise<Team> => {
    return apiRequest.patch<Team>(`/teams/${id}/stats`, stats)
  }
}
