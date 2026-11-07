/**
 * Agent shape used by the recommendation and analysis services.
 * Skills may be plain names (store agents) or objects with a name.
 */
export interface AgentSkill {
  name: string
  level?: number
  category?: string
}

export interface Agent {
  id: string
  name: string
  level: number
  status: string
  skills?: Array<string | AgentSkill>
  description?: string
  role?: string
  avatar?: string
}
