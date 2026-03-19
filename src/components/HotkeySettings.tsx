/**
 * 快捷键配置界面
 * HotkeySettings - Visual hotkey editor and configuration
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Keyboard, RotateCcw, Check, X, AlertCircle } from 'lucide-react'
import { getHotkeyManager, HotkeyDefinition, HotkeyCategory } from '../services/hotkeyManager'
import {
  allPresets,
  PresetName,
  getCurrentPresetName,
  savePresetSelection,
  getPresetByName,
} from '../config/hotkeyPresets'
import { HotkeyCard } from './HotkeyTooltip'

interface HotkeySettingsProps {
  onClose?: () => void
}

/**
 * HotkeySettings - 快捷键配置界面
 */
export const HotkeySettings: React.FC<HotkeySettingsProps> = ({ onClose }) => {
  const hotkeyManager = getHotkeyManager()
  const [hotkeys, setHotkeys] = useState<Map<string, HotkeyDefinition>>(new Map())
  const [selectedPreset, setSelectedPreset] = useState<PresetName>(getCurrentPresetName())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  // 加载快捷键
  useEffect(() => {
    setHotkeys(hotkeyManager.getAllHotkeys())
  }, [])

  // 切换预设方案
  const handlePresetChange = (presetName: PresetName) => {
    const preset = getPresetByName(presetName)
    if (!preset) return

    setSelectedPreset(presetName)
    savePresetSelection(presetName)

    // 重新注册所有快捷键
    // 注意：这里需要实际的action回调，暂时保留原有的
    // 在实际应用中，需要从应用层传入action映射

    window.location.reload() // 简化处理：刷新页面重新加载
  }

  // 开始编辑快捷键
  const handleStartEdit = (id: string, currentKey: string) => {
    setEditingId(id)
    setEditingKey(currentKey)
    setError(null)
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingKey('')
    setError(null)
  }

  // 保存快捷键
  const handleSaveEdit = (id: string) => {
    if (!editingKey) {
      setError('快捷键不能为空')
      return
    }

    // 检查冲突
    if (hotkeyManager.hasConflict(editingKey, id)) {
      setError('此快捷键已被使用')
      return
    }

    // 自定义快捷键
    const success = hotkeyManager.customize(id, editingKey)
    if (success) {
      setHotkeys(new Map(hotkeyManager.getAllHotkeys()))
      setEditingId(null)
      setEditingKey('')
      setError(null)
    } else {
      setError('无法保存快捷键')
    }
  }

  // 重置为默认
  const handleResetToDefault = (id: string) => {
    hotkeyManager.resetToDefault(id)
    setHotkeys(new Map(hotkeyManager.getAllHotkeys()))
  }

  // 重置所有快捷键
  const handleResetAll = () => {
    if (confirm('确定要重置所有快捷键为默认设置吗？')) {
      hotkeyManager.resetAllToDefault()
      window.location.reload()
    }
  }

  // 切换启用/禁用
  const handleToggleEnabled = (id: string, enabled: boolean) => {
    hotkeyManager.setEnabled(id, enabled)
    setHotkeys(new Map(hotkeyManager.getAllHotkeys()))
  }

  // 按分类过滤
  const filteredHotkeys = Array.from(hotkeys.entries()).filter(([, definition]) => {
    if (!filterCategory) return true
    return definition.category === filterCategory
  })

  // 分类列表
  const categories = [
    { value: null, label: '全部' },
    { value: HotkeyCategory.NAVIGATION, label: '导航' },
    { value: HotkeyCategory.EDITING, label: '编辑' },
    { value: HotkeyCategory.VIEW, label: '视图' },
    { value: HotkeyCategory.SYSTEM, label: '系统' },
    { value: HotkeyCategory.CUSTOM, label: '自定义' },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Keyboard className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            快捷键设置
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* 预设方案选择 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          预设方案
        </label>
        <div className="grid grid-cols-3 gap-3">
          {allPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetChange(preset.name)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedPreset === preset.name
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white">
                {preset.displayName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 分类过滤 */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">分类:</span>
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setFilterCategory(cat.value)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filterCategory === cat.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 快捷键列表 */}
      <div className="space-y-2 mb-6">
        {filteredHotkeys.map(([id, definition]) => (
          <motion.div
            key={id}
            layout
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              {/* 左侧：描述和分类 */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {definition.description}
                  </h3>
                  {definition.category && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      {definition.category}
                    </span>
                  )}
                </div>
              </div>

              {/* 右侧：快捷键编辑器 */}
              <div className="flex items-center gap-2">
                {editingId === id ? (
                  // 编辑模式
                  <>
                    <input
                      type="text"
                      value={editingKey}
                      onChange={(e) => setEditingKey(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(id)
                        } else if (e.key === 'Escape') {
                          handleCancelEdit()
                        }
                      }}
                      placeholder="输入快捷键..."
                      className="px-3 py-1.5 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(id)}
                      className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                      title="保存"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                      title="取消"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  // 显示模式
                  <>
                    <kbd className="px-3 py-1.5 text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded border border-gray-300 dark:border-gray-600 min-w-[100px] text-center">
                      {hotkeyManager.getDisplayKey(definition.key)}
                    </kbd>
                    <button
                      onClick={() => handleStartEdit(id, definition.key)}
                      className="px-3 py-1.5 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleResetToDefault(id)}
                      className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      title="重置为默认"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={definition.enabled !== false}
                        onChange={(e) => handleToggleEnabled(id, e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-5 rounded-full transition-colors ${
                          definition.enabled !== false
                            ? 'bg-blue-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                            definition.enabled !== false
                              ? 'translate-x-5'
                              : 'translate-x-0.5'
                          } mt-0.5`}
                        />
                      </div>
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* 错误提示 */}
            {editingId === id && error && (
              <div className="mt-2 flex items-center gap-2 text-xs text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* 重置所有按钮 */}
      <div className="flex justify-end">
        <button
          onClick={handleResetAll}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>重置所有快捷键</span>
        </button>
      </div>
    </div>
  )
}

export default HotkeySettings
