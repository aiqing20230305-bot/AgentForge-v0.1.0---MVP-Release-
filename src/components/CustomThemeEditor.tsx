/**
 * 自定义主题编辑器 (Pro功能)
 * 允许Pro用户完全自定义主题颜色
 */

import React, { useState } from 'react'
import { Palette, Download, Upload, RotateCcw, Save } from 'lucide-react'

export interface CustomTheme {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  border: string
}

const DEFAULT_THEME: CustomTheme = {
  primary: '#8b5cf6', // purple-600
  secondary: '#ec4899', // pink-600
  accent: '#f59e0b', // orange-500
  background: '#ffffff',
  surface: '#f9fafb',
  text: '#111827',
  border: '#e5e7eb',
}

export interface CustomThemeEditorProps {
  onSave: (theme: CustomTheme) => void
  initialTheme?: CustomTheme
}

export const CustomThemeEditor: React.FC<CustomThemeEditorProps> = ({
  onSave,
  initialTheme = DEFAULT_THEME,
}) => {
  const [theme, setTheme] = useState<CustomTheme>(initialTheme)
  const [previewMode, setPreviewMode] = useState(false)

  const updateColor = (key: keyof CustomTheme, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }))
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(theme, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
    const exportFileDefaultName = `agentforge-theme-${Date.now()}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string)
            setTheme(imported)
          } catch (error) {
            alert('导入失败：无效的主题文件')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleReset = () => {
    if (confirm('确定要重置为默认主题吗？')) {
      setTheme(DEFAULT_THEME)
    }
  }

  const handleSave = () => {
    onSave(theme)
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-6">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Palette className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            自定义主题编辑器
          </h2>
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded">
            Pro
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleImport}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="导入主题"
          >
            <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="导出主题"
          >
            <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="重置"
          >
            <RotateCcw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* 颜色选择器网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ColorPicker
          label="主色调"
          description="主要按钮和链接颜色"
          value={theme.primary}
          onChange={(val) => updateColor('primary', val)}
        />
        <ColorPicker
          label="次要色"
          description="次要按钮和强调色"
          value={theme.secondary}
          onChange={(val) => updateColor('secondary', val)}
        />
        <ColorPicker
          label="强调色"
          description="警告和高亮颜色"
          value={theme.accent}
          onChange={(val) => updateColor('accent', val)}
        />
        <ColorPicker
          label="背景色"
          description="页面主背景颜色"
          value={theme.background}
          onChange={(val) => updateColor('background', val)}
        />
        <ColorPicker
          label="表面色"
          description="卡片和面板背景"
          value={theme.surface}
          onChange={(val) => updateColor('surface', val)}
        />
        <ColorPicker
          label="文字颜色"
          description="主要文字颜色"
          value={theme.text}
          onChange={(val) => updateColor('text', val)}
        />
        <ColorPicker
          label="边框颜色"
          description="边框和分隔线颜色"
          value={theme.border}
          onChange={(val) => updateColor('border', val)}
        />
      </div>

      {/* 预览区域 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">预览</h3>
        <div
          className="p-6 rounded-xl border-2"
          style={{
            backgroundColor: theme.background,
            borderColor: theme.border,
          }}
        >
          <div
            className="p-4 rounded-lg mb-4"
            style={{ backgroundColor: theme.surface }}
          >
            <h4 style={{ color: theme.text }} className="font-semibold mb-2">
              示例卡片
            </h4>
            <p style={{ color: theme.text }} className="text-sm opacity-70 mb-4">
              这是自定义主题的预览效果
            </p>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: theme.primary }}
              >
                主要按钮
              </button>
              <button
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: theme.secondary }}
              >
                次要按钮
              </button>
              <button
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: theme.accent }}
              >
                强调按钮
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 保存按钮 */}
      <button
        onClick={handleSave}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-white hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        保存主题
      </button>
    </div>
  )
}

/**
 * 颜色选择器组件
 */
const ColorPicker: React.FC<{
  label: string
  description: string
  value: string
  onChange: (value: string) => void
}> = ({ label, description, value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </label>
      <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}
