/**
 * Type definitions for AgentForge Mobile
 * v2.2.0
 */

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  skills?: string[];
  isActive: boolean;
  tasksCompleted: number;
  successRate: number;
  level: number;
  experience: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  agentId: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface CreateAgentInput {
  name: string;
  description?: string;
  avatar?: string;
  skills?: string[];
}

export interface UpdateAgentInput extends Partial<CreateAgentInput> {}
