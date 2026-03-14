/**
 * 设置面板组件
 * 集成useSettingsStore，提供完整的用户偏好配置
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Bell,
  Eye,
  Zap,
  Download,
  Upload,
  RotateCcw,
  Check,
  Sparkles
} from 'lucide-react'
import { useSettingsStore } from '../store/useSettingsStore'
import { audioSystem } from '../services/audioSystem'
import type { UserSettings } from '../store/useSettingsStore'
import { slideUpVariants, transitions } from '../utils/animations'

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, resetSettings, exportSettings, importSettings } =
    useSettingsStore()

  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'ui' | 'performance'>('general')
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // 更新单个设置
  const handleUpdate = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    updateSettings({ [key]: value })
    audioSystem.play('click')
  }

  // 导出设置
  const handleExport = () => {
    const json = exportSettings()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `agentforge-settings-${Date.now()}.json`
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    audioSystem.play('success')
  }

  // 导入设置
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const success = importSettings(text)
        if (success) {
          audioSystem.play('success')
          alert('✅ 设置导入成功！')
        } else {
          audioSystem.play('error')
          alert('❌ 设置导入失败，请检查文件格式')
        }
      } catch (error) {
        audioSystem.play('error')
        alert('❌ 设置导入失败')
      }
    }
    input.click()
  }

  // 重置设置
  const handleReset = () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true)
      return
    }

    resetSettings()
    setShowResetConfirm(false)
    audioSystem.play('success')
    alert('✅ 设置已重置为默认值')
  }

  const tabs = [
    { id: 'general' as const, label: '通用', icon: Settings },
    { id: 'audio' as const, label: '音效', icon: Volume2 },
    { id: 'ui' as const, label: 'UI', icon: Eye },
    { id: 'performance' as const, label: '性能', icon: Zap }
  ]

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="w-7 h-7 text-cyan-400" />
              <span>设置</span>
            </h2>
            <p className="text-sm text-gray-400 mt-1">自定义你的 AgentForge 体验</p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              title="导出设置"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">导出</span>
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              title="导入设置"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">导入</span>
            </button>
            <button
              onClick={handleReset}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showResetConfirm
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
              title={showResetConfirm ? '再次点击确认' : '重置设置'}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">
                {showResetConfirm ? '确认重置?' : '重置'}
              </span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  audioSystem.play('click')
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <motion.div
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            transition={transitions.fast}
            className="space-y-6"
          >
            {/* Theme */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-400" />
                主题设置
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {(['dark', 'light', 'auto'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleUpdate('theme', theme)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      settings.theme === theme
                        ? 'border-cyan-500 bg-cyan-500/20'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {theme === 'dark' && <Moon className="w-6 h-6" />}
                      {theme === 'light' && <Sun className="w-6 h-6" />}
                      {theme === 'auto' && <Sparkles className="w-6 h-6" />}
                      <span className="text-sm font-medium">
                        {theme === 'dark' && '深色'}
                        {theme === 'light' && '浅色'}
                        {theme === 'auto' && '自动'}
                      </span>
                      {settings.theme === theme && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">语言设置</h3>
              <div className="grid grid-cols-2 gap-3">
                {(['zh-CN', 'en-US'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleUpdate('language', lang)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      settings.language === lang
                        ? 'border-cyan-500 bg-cyan-500/20'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {lang === 'zh-CN' ? '简体中文' : 'English'}
                      </span>
                      {settings.language === lang && <Check className="w-5 h-5 text-cyan-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-400" />
                通知设置
              </h3>
              <div className="space-y-3">
                <SettingToggle
                  label="启用通知"
                  description="接收任务完成、升级等通知"
                  value={settings.notificationsEnabled}
                  onChange={(value) => handleUpdate('notificationsEnabled', value)}
                />
                <SettingToggle
                  label="桌面通知"
                  description="在系统托盘显示通知"
                  value={settings.desktopNotifications}
                  onChange={(value) => handleUpdate('desktopNotifications', value)}
                  disabled={!settings.notificationsEnabled}
                />
                <SettingToggle
                  label="音效通知"
                  description="通知时播放提示音"
                  value={settings.soundNotifications}
                  onChange={(value) => handleUpdate('soundNotifications', value)}
                  disabled={!settings.notificationsEnabled}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Audio Settings */}
        {activeTab === 'audio' && (
          <motion.div
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            transition={transitions.fast}
            className="space-y-6"
          >
            {/* Master Audio Toggle */}
            <div className="p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-lg">
              <SettingToggle
                label="启用音效"
                description="开启/关闭所有音效"
                value={settings.audioEnabled}
                onChange={(value) => handleUpdate('audioEnabled', value)}
                icon={settings.audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              />
            </div>

            {/* Volume Sliders */}
            <div className="space-y-4">
              <VolumeSlider
                label="主音量"
                value={settings.masterVolume}
                onChange={(value) => handleUpdate('masterVolume', value)}
                disabled={!settings.audioEnabled}
              />
              <VolumeSlider
                label="音效音量"
                value={settings.sfxVolume}
                onChange={(value) => handleUpdate('sfxVolume', value)}
                disabled={!settings.audioEnabled}
              />
              <VolumeSlider
                label="背景音乐"
                value={settings.musicVolume}
                onChange={(value) => handleUpdate('musicVolume', value)}
                disabled={!settings.audioEnabled}
              />
            </div>

            {/* Test Audio Button */}
            <button
              onClick={() => audioSystem.play('success')}
              disabled={!settings.audioEnabled}
              className="w-full p-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 rounded-lg font-bold text-white transition-all"
            >
              🔊 测试音效
            </button>
          </motion.div>
        )}

        {/* UI Settings */}
        {activeTab === 'ui' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Panel Layout */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">面板布局</h3>
              <div className="grid grid-cols-3 gap-3">
                {(['default', 'compact', 'expanded'] as const).map((layout) => (
                  <button
                    key={layout}
                    onClick={() => handleUpdate('panelLayout', layout)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      settings.panelLayout === layout
                        ? 'border-cyan-500 bg-cyan-500/20'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-medium mb-2">
                        {layout === 'default' && '默认'}
                        {layout === 'compact' && '紧凑'}
                        {layout === 'expanded' && '扩展'}
                      </div>
                      {settings.panelLayout === layout && (
                        <Check className="w-5 h-5 text-cyan-400 mx-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Default Tab */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">默认标签页</h3>
              <select
                value={settings.defaultTab}
                onChange={(e) =>
                  handleUpdate('defaultTab', e.target.value as UserSettings['defaultTab'])
                }
                className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="tasks">📋 任务管理</option>
                <option value="energy">⚡ 能耗管理</option>
                <option value="skills">🌟 技能树</option>
                <option value="achievements">🏆 成就</option>
                <option value="battle">⚔️ 战斗</option>
                <option value="leaderboard">🏅 排行榜</option>
                <option value="invite">🎁 邀请</option>
              </select>
            </div>

            {/* UI Toggles */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">显示选项</h3>
              <div className="space-y-3">
                <SettingToggle
                  label="每日任务自动显示"
                  description="启动时自动展开每日任务"
                  value={settings.dailyQuestAutoShow}
                  onChange={(value) => handleUpdate('dailyQuestAutoShow', value)}
                />
                <SettingToggle
                  label="显示经验条"
                  description="在顶部显示经验进度条"
                  value={settings.expBarVisible}
                  onChange={(value) => handleUpdate('expBarVisible', value)}
                />
                <SettingToggle
                  label="粒子特效"
                  description="显示装饰性粒子效果"
                  value={settings.particlesEnabled}
                  onChange={(value) => handleUpdate('particlesEnabled', value)}
                />
                <SettingToggle
                  label="减少动画"
                  description="减少界面动画效果（提升性能）"
                  value={settings.reducedMotion}
                  onChange={(value) => handleUpdate('reducedMotion', value)}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Performance Settings */}
        {activeTab === 'performance' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* FPS Limit */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                帧率限制
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {([30, 60] as const).map((fps) => (
                  <button
                    key={fps}
                    onClick={() => handleUpdate('fps', fps)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      settings.fps === fps
                        ? 'border-cyan-500 bg-cyan-500/20'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{fps} FPS</span>
                      {settings.fps === fps && <Check className="w-5 h-5 text-cyan-400" />}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                💡 60 FPS提供更流畅体验，30 FPS节省资源
              </p>
            </div>

            {/* Optimization Toggles */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">性能优化</h3>
              <div className="space-y-3">
                <SettingToggle
                  label="虚拟滚动"
                  description="长列表使用虚拟滚动（推荐）"
                  value={settings.virtualScrollEnabled}
                  onChange={(value) => handleUpdate('virtualScrollEnabled', value)}
                />
                <SettingToggle
                  label="懒加载图片"
                  description="延迟加载图片资源"
                  value={settings.lazyLoadImages}
                  onChange={(value) => handleUpdate('lazyLoadImages', value)}
                />
              </div>
            </div>

            {/* Performance Info */}
            <div className="p-4 bg-gradient-to-r from-green-900/30 to-cyan-900/30 border border-green-700/50 rounded-lg">
              <div className="text-sm font-bold text-green-300 mb-2">
                ⚡ 性能提示
              </div>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 减少动画可提升低配设备性能</li>
                <li>• 虚拟滚动在处理大量数据时必不可少</li>
                <li>• 关闭粒子特效可节省GPU资源</li>
                <li>• 30 FPS适合省电模式</li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

/**
 * 设置开关组件
 */
interface SettingToggleProps {
  label: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  icon?: React.ReactNode
}

const SettingToggle: React.FC<SettingToggleProps> = ({
  label,
  description,
  value,
  onChange,
  disabled = false,
  icon
}) => {
  return (
    <div
      className={`flex items-center justify-between p-4 bg-gray-800/50 rounded-lg ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-3 flex-1">
        {icon && <div className="text-gray-400 mt-0.5">{icon}</div>}
        <div className="flex-1">
          <div className="font-medium text-white">{label}</div>
          <div className="text-sm text-gray-400 mt-1">{description}</div>
        </div>
      </div>
      <button
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          disabled
            ? 'bg-gray-700 cursor-not-allowed'
            : value
            ? 'bg-cyan-600'
            : 'bg-gray-600'
        }`}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 bg-white rounded-full"
          animate={{ left: value ? '1.75rem' : '0.25rem' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
}

/**
 * 音量滑块组件
 */
interface VolumeSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

const VolumeSlider: React.FC<VolumeSliderProps> = ({
  label,
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className={`space-y-2 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="font-medium text-white">{label}</span>
        <span className="text-sm text-gray-400">{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
      />
    </div>
  )
}
