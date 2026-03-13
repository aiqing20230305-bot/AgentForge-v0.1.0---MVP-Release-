import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AgentId = 'ATLAS' | 'CLIP' | 'ORACLE' | 'SENTINEL'
export type Gender = 'male' | 'female'
export type Style = 'realistic' | 'anime' | 'cyberpunk' | 'fantasy'

interface AgentImagePreference {
  gender: Gender
  style: Style
}

interface AgentImageStore {
  // 每个 Agent 的形象偏好设置
  preferences: Record<AgentId, AgentImagePreference>

  // 设置指定 Agent 的性别
  setGender: (agentId: AgentId, gender: Gender) => void

  // 设置指定 Agent 的风格
  setStyle: (agentId: AgentId, style: Style) => void

  // 获取指定 Agent 的当前图片路径
  getImagePath: (agentId: AgentId) => string

  // 重置所有偏好为默认值
  resetAll: () => void
}

const DEFAULT_PREFERENCES: Record<AgentId, AgentImagePreference> = {
  ATLAS: { gender: 'male', style: 'realistic' },
  CLIP: { gender: 'male', style: 'anime' },
  ORACLE: { gender: 'female', style: 'cyberpunk' },
  SENTINEL: { gender: 'male', style: 'realistic' }
}

export const useAgentImageStore = create<AgentImageStore>()(
  persist(
    (set, get) => ({
      preferences: DEFAULT_PREFERENCES,

      setGender: (agentId, gender) =>
        set(state => {
          const currentPref = state.preferences[agentId] ||
            DEFAULT_PREFERENCES[agentId] || { gender: 'male', style: 'realistic' }
          return {
            preferences: {
              ...state.preferences,
              [agentId]: { ...currentPref, gender }
            }
          }
        }),

      setStyle: (agentId, style) =>
        set(state => {
          const currentPref = state.preferences[agentId] ||
            DEFAULT_PREFERENCES[agentId] || { gender: 'male', style: 'realistic' }
          return {
            preferences: {
              ...state.preferences,
              [agentId]: { ...currentPref, style }
            }
          }
        }),

      getImagePath: agentId => {
        const preference = get().preferences[agentId]

        // 如果没有找到偏好设置，使用默认值
        if (!preference) {
          const defaultPref = DEFAULT_PREFERENCES[agentId] || { gender: 'male', style: 'realistic' }
          return `/images/agents/gallery/${agentId.toLowerCase()}_${defaultPref.gender}_${defaultPref.style}.png`
        }

        const { gender, style } = preference
        return `/images/agents/gallery/${agentId.toLowerCase()}_${gender}_${style}.png`
      },

      resetAll: () => set({ preferences: DEFAULT_PREFERENCES })
    }),
    {
      name: 'agent-image-preferences'
    }
  )
)
