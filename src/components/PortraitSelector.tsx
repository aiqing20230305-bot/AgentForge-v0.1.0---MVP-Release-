import { useState, useRef } from 'react'
import { X, Upload, Search, Filter, Trash2, Image as ImageIcon } from 'lucide-react'
import { usePortraitStore } from '../store/usePortraitStore'

interface PortraitSelectorProps {
  agentId: string
  agentName: string
  onClose: () => void
}

const TAG_FILTERS = [
  { label: '全部', tags: [] },
  { label: '图片', tags: ['图片'] },
  { label: '视频', tags: ['视频'] },
  { label: '三国', tags: ['三国'] },
  { label: '科幻', tags: ['科幻'] },
  { label: '男性', tags: ['male'] },
  { label: '女性', tags: ['female'] },
  { label: '已上传', tags: ['uploaded'] }
]

export default function PortraitSelector({ agentId, agentName, onClose }: PortraitSelectorProps) {
  const {
    portraits,
    selections,
    setAgentPortrait,
    uploadPortrait,
    deletePortrait,
    searchPortraits
  } = usePortraitStore()

  const currentPortraitId = selections[agentId]
  const [selectedPortraitId, setSelectedPortraitId] = useState(currentPortraitId || '')
  const [activeFilter, setActiveFilter] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 过滤形象
  const filteredPortraits = (() => {
    let result = portraits

    // 按标签过滤
    if (activeFilter.length > 0) {
      result = searchPortraits(activeFilter)
    }

    // 按名称搜索
    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    return result
  })()

  const handleApply = () => {
    if (selectedPortraitId) {
      setAgentPortrait(agentId, selectedPortraitId)
    }
    onClose()
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型（支持图片和视频）
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      alert('请选择图片或视频文件')
      return
    }

    // 验证文件大小 (图片限制5MB, 视频限制20MB)
    const maxSize = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert(`${isVideo ? '视频' : '图片'}大小不能超过${isVideo ? '20' : '5'}MB`)
      return
    }

    // 读取文件为base64
    const reader = new FileReader()
    reader.onload = event => {
      const mediaData = event.target?.result as string
      const fileName = file.name.replace(/\.[^/.]+$/, '') // 去除扩展名
      const portraitId = uploadPortrait(fileName, mediaData)
      setSelectedPortraitId(portraitId)
    }
    reader.readAsDataURL(file)
  }

  const handleDelete = (portraitId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('确定要删除这个形象吗？')) {
      deletePortrait(portraitId)
      if (selectedPortraitId === portraitId) {
        setSelectedPortraitId('')
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">选择 {agentName} 的形象</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* 搜索和过滤 */}
          <div className="mb-6 space-y-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索形象名称..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* 标签过滤 */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-400" />
              {TAG_FILTERS.map(filter => (
                <button
                  key={filter.label}
                  onClick={() => setActiveFilter(filter.tags)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    JSON.stringify(activeFilter) === JSON.stringify(filter.tags)
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* 上传按钮 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              上传形象（图片或视频，9:16竖版）
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleUpload}
              className="hidden"
            />
          </div>

          {/* 形象网格 - 9:16竖版 */}
          <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {filteredPortraits.map(portrait => {
              const isSelected = selectedPortraitId === portrait.id

              return (
                <div
                  key={portrait.id}
                  onClick={() => setSelectedPortraitId(portrait.id)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer transition-all group ${
                    isSelected
                      ? 'ring-4 ring-purple-500 scale-105'
                      : 'hover:ring-2 hover:ring-purple-400 hover:scale-105'
                  }`}
                  style={{ aspectRatio: '9 / 16' }}
                >
                  {/* 图片/视频 */}
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    {portrait.mediaType === 'video' ? (
                      <video
                        src={portrait.path}
                        poster={portrait.thumbnail}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        onError={e => {
                          // 视频加载失败，显示缩略图
                          if (portrait.thumbnail) {
                            const img = document.createElement('img')
                            img.src = portrait.thumbnail
                            img.className = 'w-full h-full object-cover'
                            e.currentTarget.replaceWith(img)
                          }
                        }}
                      />
                    ) : (
                      <img
                        src={portrait.path}
                        alt={portrait.name}
                        className="w-full h-full object-cover"
                        onError={e => {
                          e.currentTarget.src =
                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="180"><rect fill="%23374151"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="40">?</text></svg>'
                        }}
                      />
                    )}
                  </div>

                  {/* 选中标记 */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* 删除按钮 (仅上传的形象) */}
                  {portrait.type === 'uploaded' && (
                    <button
                      onClick={e => handleDelete(portrait.id, e)}
                      className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  )}

                  {/* 名称 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                    <p className="text-[9px] text-white text-center truncate font-medium">
                      {portrait.name}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 无结果 */}
          {filteredPortraits.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>未找到匹配的形象</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-900/50">
          <div className="text-sm text-slate-400">{filteredPortraits.length} 个形象可选</div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleApply}
              disabled={!selectedPortraitId}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              应用
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
