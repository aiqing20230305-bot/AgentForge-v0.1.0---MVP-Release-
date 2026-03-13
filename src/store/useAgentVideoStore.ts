import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AgentId = 'ATLAS' | 'CLIP' | 'ORACLE' | 'SENTINEL'
export type DisplayMode = 'image' | 'video'

interface AgentVideoPreference {
  displayMode: DisplayMode
  autoPlay: boolean
}

interface AgentVideoStore {
  // 每个 Agent 的视频偏好设置
  preferences: Record<AgentId, AgentVideoPreference>

  // 全局设置
  globalAutoPlay: boolean

  // 设置指定 Agent 的显示模式
  setDisplayMode: (agentId: AgentId, mode: DisplayMode) => void

  // 设置指定 Agent 的自动播放
  setAutoPlay: (agentId: AgentId, autoPlay: boolean) => void

  // 设置全局自动播放
  setGlobalAutoPlay: (autoPlay: boolean) => void

  // 获取指定 Agent 的视频路径
  getVideoPath: (agentId: AgentId) => string

  // 检查视频是否存在
  hasVideo: (agentId: AgentId) => boolean
}

const DEFAULT_PREFERENCES: Record<AgentId, AgentVideoPreference> = {
  ATLAS: { displayMode: 'video', autoPlay: true },
  CLIP: { displayMode: 'video', autoPlay: true },
  ORACLE: { displayMode: 'video', autoPlay: true },
  SENTINEL: { displayMode: 'video', autoPlay: true }
}

// 视频文件映射
const VIDEO_PATHS: Record<AgentId, string> = {
  ATLAS: '/videos/agents/atlas.mp4',
  CLIP: '/videos/agents/clip.mp4',
  ORACLE: '/videos/agents/oracle.mp4',
  SENTINEL: '/videos/agents/sentinel.mp4'
}

export const useAgentVideoStore = create<AgentVideoStore>()(
  persist(
    (set, get) => ({
      preferences: DEFAULT_PREFERENCES,
      globalAutoPlay: true,

      setDisplayMode: (agentId, mode) =>
        set(state => ({
          preferences: {
            ...state.preferences,
            [agentId]: { ...state.preferences[agentId], displayMode: mode }
          }
        })),

      setAutoPlay: (agentId, autoPlay) =>
        set(state => ({
          preferences: {
            ...state.preferences,
            [agentId]: { ...state.preferences[agentId], autoPlay }
          }
        })),

      setGlobalAutoPlay: autoPlay => {
        set({ globalAutoPlay: autoPlay })
        // 同时更新所有 Agent 的自动播放设置
        const preferences = get().preferences
        const updatedPreferences = Object.keys(preferences).reduce(
          (acc, key) => {
            acc[key as AgentId] = { ...preferences[key as AgentId], autoPlay }
            return acc
          },
          {} as Record<AgentId, AgentVideoPreference>
        )
        set({ preferences: updatedPreferences })
      },

      getVideoPath: agentId => VIDEO_PATHS[agentId],

      hasVideo: agentId => !!VIDEO_PATHS[agentId]
    }),
    {
      name: 'agent-video-preferences'
    }
  )
)
