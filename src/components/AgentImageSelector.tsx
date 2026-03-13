import { useState } from 'react'
import { X, User, Sparkles } from 'lucide-react'
import { useAgentImageStore, AgentId, Gender, Style } from '../store/useAgentImageStore'

interface AgentImageSelectorProps {
  agentId: AgentId
  agentName: string
  onClose: () => void
}

const GENDER_OPTIONS: { value: Gender; label: string; icon: string }[] = [
  { value: 'male', label: '男性', icon: '👨' },
  { value: 'female', label: '女性', icon: '👩' }
]

const STYLE_OPTIONS: { value: Style; label: string; description: string }[] = [
  { value: 'realistic', label: '写实风格', description: '照片级真实感' },
  { value: 'anime', label: '动漫风格', description: '二次元动漫' },
  { value: 'cyberpunk', label: '赛博朋克', description: '未来科技感' },
  { value: 'fantasy', label: '奇幻风格', description: '魔法幻想' }
]

export default function AgentImageSelector({
  agentId,
  agentName,
  onClose
}: AgentImageSelectorProps) {
  const { preferences, setGender, setStyle } = useAgentImageStore()
  const currentPreference = preferences[agentId] || {
    gender: 'male' as Gender,
    style: 'realistic' as Style
  }

  const [previewGender, setPreviewGender] = useState<Gender>(currentPreference.gender)
  const [previewStyle, setPreviewStyle] = useState<Style>(currentPreference.style)

  const previewImagePath = `/images/agents/gallery/${agentId.toLowerCase()}_${previewGender}_${previewStyle}.png`

  const handleApply = () => {
    setGender(agentId, previewGender)
    setStyle(agentId, previewStyle)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">自定义 {agentName} 形象</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 预览区 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                预览
              </h3>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
                <img
                  src={previewImagePath}
                  alt={`${agentName} Preview`}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.currentTarget.src = '/placeholder-agent.png'
                  }}
                />
                {/* 标签 */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white border border-white/20">
                    {GENDER_OPTIONS.find(g => g.value === previewGender)?.label}
                  </span>
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white border border-white/20">
                    {STYLE_OPTIONS.find(s => s.value === previewStyle)?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* 选择区 */}
            <div className="space-y-6">
              {/* 性别选择 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    性别
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {GENDER_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setPreviewGender(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        previewGender === option.value
                          ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-3xl mb-2">{option.icon}</div>
                      <div className="text-sm font-medium text-white">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 风格选择 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    风格
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {STYLE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setPreviewStyle(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        previewStyle === option.value
                          ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-sm font-medium text-white mb-1">{option.label}</div>
                      <div className="text-xs text-slate-400">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium transition-all shadow-lg hover:shadow-purple-500/50"
          >
            应用
          </button>
        </div>
      </div>
    </div>
  )
}
