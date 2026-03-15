/**
 * Task API
 * CRUD operations for tasks
 */

import { apiRequest } from './client'

/**
 * Task data structure (matches backend model)
 */
export interface Task {
  id: string
  userId: string
  agentId: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  result?: string
  errorMessage?: string
  executionLog: string[]
  estimatedDuration?: number
  actualDuration?: number
  tokensUsed?: number
  retryCount: number
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Task creation data
 */
export interface CreateTaskData {
  agentId: string
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  estimatedDuration?: number
  scheduledAt?: string
  tags?: string[]
}

/**
 * Task update data
 */
export interface UpdateTaskData {
  title?: string
  description?: string
  status?: 'pending' | 'in_progress' | 'completed' | 'failed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  result?: string
  errorMessage?: string
  actualDuration?: number
  tokensUsed?: number
  tags?: string[]
}

/**
 * Task query parameters
 */
export interface TaskQueryParams {
  status?: 'pending' | 'in_progress' | 'completed' | 'failed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  agentId?: string
  sortBy?: string
  order?: 'asc' | 'desc'
}

/**
 * Task statistics
 */
export interface TaskStats {
  totalTasks: number
  byStatus: Array<{
    _id: string
    count: number
    totalTokens: number
    avgDuration: number | null
  }>
}

/**
 * Task API methods
 */
export const taskApi = {
  /**
   * Get all tasks
   * GET /tasks
   */
  getAll: async (params?: TaskQueryParams): Promise<Task[]> => {
    return apiRequest.get<Task[]>('/tasks', params)
  },

  /**
   * Get single task by ID
   * GET /tasks/:id
   */
  getById: async (id: string): Promise<Task> => {
    return apiRequest.get<Task>(`/tasks/${id}`)
  },

  /**
   * Get task statistics
   * GET /tasks/stats
   */
  getStats: async (): Promise<TaskStats> => {
    return apiRequest.get<TaskStats>('/tasks/stats')
  },

  /**
   * Create new task
   * POST /tasks
   */
  create: async (data: CreateTaskData): Promise<Task> => {
    return apiRequest.post<Task>('/tasks', data)
  },

  /**
   * Update task
   * PUT /tasks/:id
   */
  update: async (id: string, data: UpdateTaskData): Promise<Task> => {
    return apiRequest.put<Task>(`/tasks/${id}`, data)
  },

  /**
   * Delete task
   * DELETE /tasks/:id
   */
  delete: async (id: string): Promise<void> => {
    return apiRequest.delete(`/tasks/${id}`)
  },

  /**
   * Add execution log entry
   * POST /tasks/:id/logs
   */
  addLog: async (id: string, logEntry: string): Promise<Task> => {
    return apiRequest.post<Task>(`/tasks/${id}/logs`, { logEntry })
  }
}
