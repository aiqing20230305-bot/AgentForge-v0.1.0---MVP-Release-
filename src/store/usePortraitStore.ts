import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GALLERY_PORTRAITS, EMOJI_PORTRAITS } from './portraitData'

// 形象类型
export type PortraitType = 'preset' | 'uploaded'

// 媒体类型
export type MediaType = 'image' | 'video'

// 形象数据
export interface Portrait {
  id: string
  name: string
  type: PortraitType
  mediaType: MediaType // 图片还是视频
  path: string // 图片/视频路径或base64
  thumbnail?: string // 视频缩略图
  tags?: string[] // 标签：male, female, realistic, anime, cyberpunk等
  uploadedAt?: string
}

// Agent的形象选择
export interface AgentPortraitSelection {
  agentId: string
  portraitId: string
}

interface PortraitStore {
  // 形象库（公共，所有agent共享）
  portraits: Portrait[]

  // Agent的形象选择
  selections: Record<string, string> // agentId -> portraitId

  // 添加预设形象
  addPresetPortrait: (portrait: Portrait) => void

  // 上传自定义形象
  uploadPortrait: (name: string, imageData: string, tags?: string[]) => string

  // 删除形象
  deletePortrait: (portraitId: string) => void

  // 设置Agent形象
  setAgentPortrait: (agentId: string, portraitId: string) => void

  // 获取Agent当前形象
  getAgentPortrait: (agentId: string) => Portrait | null

  // 获取所有形象（按类型筛选）
  getPortraits: (type?: PortraitType) => Portrait[]

  // 搜索形象（按标签）
  searchPortraits: (tags: string[]) => Portrait[]
}

// 预设形象列表（从已有资源加载 + Emoji选项）
const PRESET_PORTRAITS: Portrait[] = [
  ...GALLERY_PORTRAITS, // 32张图片 + 5个视频
  ...EMOJI_PORTRAITS // Emoji选项
]

export const usePortraitStore = create<PortraitStore>()(
  persist(
    (set, get) => ({
      portraits: PRESET_PORTRAITS,
      selections: {},

      addPresetPortrait: portrait =>
        set(state => ({
          portraits: [...state.portraits, portrait]
        })),

      uploadPortrait: (name, imageData, tags = []) => {
        const id = `uploaded_${Date.now()}`
        // 判断是图片还是视频
        const mediaType: MediaType = imageData.startsWith('data:video/') ? 'video' : 'image'
        const portrait: Portrait = {
          id,
          name,
          type: 'uploaded',
          mediaType,
          path: imageData, // base64 data URL
          tags: ['uploaded', ...tags],
          uploadedAt: new Date().toISOString()
        }
        set(state => ({
          portraits: [...state.portraits, portrait]
        }))
        return id
      },

      deletePortrait: portraitId =>
        set(state => ({
          portraits: state.portraits.filter(p => p.id !== portraitId),
          // 清理使用了该形象的agent选择
          selections: Object.fromEntries(
            Object.entries(state.selections).filter(([_, pId]) => pId !== portraitId)
          )
        })),

      setAgentPortrait: (agentId, portraitId) =>
        set(state => ({
          selections: {
            ...state.selections,
            [agentId]: portraitId
          }
        })),

      getAgentPortrait: agentId => {
        const portraitId = get().selections[agentId]
        if (!portraitId) return null
        return get().portraits.find(p => p.id === portraitId) || null
      },

      getPortraits: type => {
        const portraits = get().portraits
        if (!type) return portraits
        return portraits.filter(p => p.type === type)
      },

      searchPortraits: tags => {
        return get().portraits.filter(portrait => tags.every(tag => portrait.tags?.includes(tag)))
      }
    }),
    {
      name: 'agent-portrait-library'
    }
  )
)
