import { useState } from 'react'

export type AIPlatform = 'claude' | 'openai' | 'gemini' | 'openclaw' | 'custom'

interface PlatformSelectorProps {
  selectedPlatform: AIPlatform
  onSelectPlatform: (platform: AIPlatform) => void
}

const PLATFORMS = [
  {
    id: 'claude' as AIPlatform,
    name: 'Claude',
    icon: '🤖',
    color: 'amber',
    description: 'Anthropic Claude Agents'
  },
  {
    id: 'openai' as AIPlatform,
    name: 'OpenAI',
    icon: '⚡',
    color: 'green',
    description: 'GPT-4 / GPT-3.5 智能体'
  },
  {
    id: 'gemini' as AIPlatform,
    name: 'Gemini',
    icon: '✨',
    color: 'blue',
    description: 'Google Gemini 智能体'
  },
  {
    id: 'openclaw' as AIPlatform,
    name: 'OpenClaw',
    icon: '🦞',
    color: 'red',
    description: 'OpenClaw 飞书机器人'
  },
  {
    id: 'custom' as AIPlatform,
    name: '自定义',
    icon: '🔧',
    color: 'purple',
    description: '自定义平台格式'
  }
]

export default function PlatformSelector({
  selectedPlatform,
  onSelectPlatform
}: PlatformSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selected = PLATFORMS.find(p => p.id === selectedPlatform) || PLATFORMS[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] border-2 border-[#4a4a4a] rounded hover:border-amber-600 transition-colors"
      >
        <span className="text-lg">{selected.icon}</span>
        <span className="text-xs font-bold text-amber-100">{selected.name}</span>
        <span className="text-amber-100/60 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 w-64 bg-[#2a2a2a] border-2 border-[#4a4a4a] rounded shadow-xl z-50">
          {PLATFORMS.map(platform => (
            <button
              key={platform.id}
              onClick={() => {
                onSelectPlatform(platform.id)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-left hover:bg-[#3a3a3a] transition-colors border-b border-[#3a3a3a] last:border-b-0 ${
                selectedPlatform === platform.id ? 'bg-[#3a3a3a]' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{platform.icon}</span>
                <div className="flex-1">
                  <div className="text-xs font-bold text-amber-100">{platform.name}</div>
                  <div className="text-[10px] text-amber-100/60">{platform.description}</div>
                </div>
                {selectedPlatform === platform.id && <span className="text-amber-600">✓</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
