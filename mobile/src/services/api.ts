import { Agent, CreateAgentInput, UpdateAgentInput } from '../types';

/**
 * API Service for AgentForge Mobile
 * v2.2.0 - 连接后端API
 */

const API_BASE_URL = 'http://localhost:3000/api'; // 可从环境变量配置

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Agent API
export async function fetchAgents(): Promise<Agent[]> {
  const data = await apiCall<{ agents: Agent[] }>('/agents');
  return data.agents;
}

export async function fetchAgentById(id: string): Promise<Agent> {
  const data = await apiCall<{ agent: Agent }>(`/agents/${id}`);
  return data.agent;
}

export async function createAgent(input: CreateAgentInput): Promise<Agent> {
  const data = await apiCall<{ agent: Agent }>('/agents', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.agent;
}

export async function updateAgent(
  id: string,
  input: UpdateAgentInput
): Promise<Agent> {
  const data = await apiCall<{ agent: Agent }>(`/agents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return data.agent;
}

export async function deleteAgent(id: string): Promise<void> {
  await apiCall(`/agents/${id}`, { method: 'DELETE' });
}

// Mock data for offline development
const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Data Analyst',
    avatar: '📊',
    description: 'Specializes in data analysis and visualization',
    skills: ['Python', 'Data Analysis', 'SQL'],
    isActive: true,
    tasksCompleted: 42,
    successRate: 95,
    level: 5,
    experience: 1250,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'API Master',
    avatar: '🚀',
    description: 'Expert in API integration and development',
    skills: ['REST API', 'GraphQL', 'Node.js'],
    isActive: true,
    tasksCompleted: 28,
    successRate: 92,
    level: 4,
    experience: 890,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Enable mock mode for development
const USE_MOCK = false; // 设置为true启用mock数据

if (USE_MOCK) {
  Object.assign(window as any, {
    fetchAgents: async () => mockAgents,
    fetchAgentById: async (id: string) =>
      mockAgents.find(a => a.id === id) || mockAgents[0],
    createAgent: async (input: CreateAgentInput) => ({
      ...input,
      id: Date.now().toString(),
      isActive: true,
      tasksCompleted: 0,
      successRate: 0,
      level: 1,
      experience: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    updateAgent: async (id: string, input: UpdateAgentInput) => ({
      ...(mockAgents.find(a => a.id === id) || mockAgents[0]),
      ...input,
      updatedAt: new Date().toISOString(),
    }),
    deleteAgent: async () => {},
  });
}
