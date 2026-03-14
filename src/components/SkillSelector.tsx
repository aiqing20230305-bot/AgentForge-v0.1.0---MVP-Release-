import { useState } from 'react'
import { X, Plus, Check, Search, TrendingUp } from 'lucide-react'
import {
  useSkillStore,
  SKILL_CATEGORY_CONFIG,
  SKILL_LIBRARY,
  type SkillCategory
} from '../store/useSkillStore'

interface SkillSelectorProps {
  agentId: string
  agentName: string
  onClose: () => void
}

export default function SkillSelector({ agentId, agentName, onClose }: SkillSelectorProps) {
  const { addSkill, removeSkill, getAgentSkills } = useSkillStore()
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const agentSkills = getAgentSkills(agentId)
  const agentSkillNames = new Set(agentSkills.map(s => s.name))

  // 过滤技能库
  const filteredLibrary = SKILL_LIBRARY.filter(skill => {
    const matchCategory = selectedCategory === 'all' || skill.category === selectedCategory
    const matchSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  const handleAddSkill = (skill: (typeof SKILL_LIBRARY)[0]) => {
    if (agentSkillNames.has(skill.name)) return

    addSkill({
      ...skill,
      agentId,
      level: 1,
      exp: 0,
      maxExp: 100
    })
  }

  const handleRemoveSkill = (skillId: string) => {
    removeSkill(skillId)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full h-[700px] flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{agentName} 的技能库</h3>
              <p className="text-xs text-slate-400">已拥有 {agentSkills.length} 个技能</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs + Search */}
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-900/30 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              全部
            </button>
            {Object.entries(SKILL_CATEGORY_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as SkillCategory)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === key
                    ? 'bg-gradient-to-r shadow-lg text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
                style={
                  selectedCategory === key
                    ? {
                        background: `linear-gradient(135deg, ${config.color}dd, ${config.color}88)`,
                        boxShadow: `0 4px 12px ${config.color}40`
                      }
                    : {}
                }
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索技能..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Current Skills */}
        {agentSkills.length > 0 && (
          <div className="px-6 py-3 border-b border-slate-700 bg-slate-900/20 flex-shrink-0">
            <div className="text-xs font-semibold text-slate-400 mb-2">当前技能</div>
            <div className="flex flex-wrap gap-2">
              {agentSkills.map(skill => {
                const config = SKILL_CATEGORY_CONFIG[skill.category]
                return (
                  <div
                    key={skill.id}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all hover:shadow-lg"
                    style={{
                      backgroundColor: `${config.color}15`,
                      borderColor: `${config.color}50`
                    }}
                  >
                    <span className="text-sm">{skill.icon}</span>
                    <span className="text-sm font-medium text-white">{skill.name}</span>
                    <span className="text-xs text-slate-400">Lv.{skill.level}</span>
                    <button
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="ml-1 p-0.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="移除技能"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Skill Library */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredLibrary.map((skill, index) => {
              const config = SKILL_CATEGORY_CONFIG[skill.category]
              const hasSkill = agentSkillNames.has(skill.name)

              return (
                <div
                  key={index}
                  className={`group relative p-4 rounded-xl border-2 transition-all ${
                    hasSkill
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:shadow-lg'
                  }`}
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.03}s both`
                  }}
                >
                  {/* Category Badge */}
                  <div
                    className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${config.color}20`,
                      color: config.color
                    }}
                  >
                    {config.icon}
                  </div>

                  {/* Skill Icon & Name */}
                  <div className="mb-2">
                    <div className="text-3xl mb-2">{skill.icon}</div>
                    <div className="font-semibold text-white text-sm mb-1">{skill.name}</div>
                    <div className="text-xs text-slate-400 line-clamp-2">{skill.description}</div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => (hasSkill ? null : handleAddSkill(skill))}
                    disabled={hasSkill}
                    className={`mt-2 w-full py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                      hasSkill
                        ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30 hover:scale-105'
                    }`}
                  >
                    {hasSkill ? (
                      <>
                        <Check className="w-3 h-3" />
                        已拥有
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        添加技能
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          {filteredLibrary.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>没有找到匹配的技能</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-900/50 flex-shrink-0 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            共 {SKILL_LIBRARY.length} 个技能可选 · 已选 {agentSkills.length} 个
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-amber-500/30"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  )
}
