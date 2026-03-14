/**
 * 音效设置模态框
 * 控制音效音量、开关等
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Music, Bell, Zap, X } from 'lucide-react'
import { audioSystem } from '../services/audioSystem'
import { useInstantFeedback } from '../hooks/useInstantFeedback'

interface AudioSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({ isOpen, onClose }) => {
  const feedback = useInstantFeedback()

  // 音量设置（0-100）
  const [masterVolume, setMasterVolume] = useState(100)
  const [sfxVolume, setSfxVolume] = useState(100)
  const [musicVolume, setMusicVolume] = useState(100)

  // 开关设置
  const [sfxEnabled, setSfxEnabled] = useState(true)
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(true)

  // 从localStorage加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('audio-settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setMasterVolume(settings.masterVolume ?? 100)
        setSfxVolume(settings.sfxVolume ?? 100)
        setMusicVolume(settings.musicVolume ?? 100)
        setSfxEnabled(settings.sfxEnabled ?? true)
        setMusicEnabled(settings.musicEnabled ?? true)
        setNotificationSoundEnabled(settings.notificationSoundEnabled ?? true)

        // 应用到音效系统
        audioSystem.setVolume((settings.masterVolume ?? 100) / 100)
      } catch (e) {
        console.error('[AudioSettings] Failed to load settings:', e)
      }
    }
  }, [])

  // 保存设置到localStorage
  const saveSettings = () => {
    const settings = {
      masterVolume,
      sfxVolume,
      musicVolume,
      sfxEnabled,
      musicEnabled,
      notificationSoundEnabled
    }
    localStorage.setItem('audio-settings', JSON.stringify(settings))

    // 应用主音量到音效系统
    audioSystem.setVolume(masterVolume / 100)
  }

  // 音量变化时自动保存
  useEffect(() => {
    saveSettings()
  }, [masterVolume, sfxVolume, musicVolume, sfxEnabled, musicEnabled, notificationSoundEnabled])

  const handleMasterVolumeChange = (value: number) => {
    setMasterVolume(value)
    audioSystem.setVolume(value / 100)

    // 播放测试音效
    if (value > 0 && sfxEnabled) {
      audioSystem.play('click')
    }
  }

  const handleSfxVolumeChange = (value: number) => {
    setSfxVolume(value)

    // 播放测试音效
    if (value > 0 && sfxEnabled && masterVolume > 0) {
      audioSystem.play('success')
    }
  }

  const handleTestSound = (type: 'click' | 'success' | 'error' | 'levelup' | 'achievement') => {
    if (sfxEnabled && masterVolume > 0) {
      audioSystem.play(type)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-black border-2 border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* 头部 */}
          <div className="bg-gradient-to-r from-cyan-900 to-blue-900 p-6 border-b border-cyan-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">音效设置</h2>
              </div>
              <button
                onClick={(e) => {
                  feedback.onClick(e)
                  audioSystem.play('click')
                  onClose()
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-all feedback-button-scale"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* 内容 */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* 主音量 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                  <label className="text-white font-medium">主音量</label>
                </div>
                <span className="text-cyan-400 font-mono font-bold">{masterVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={masterVolume}
                onChange={(e) => handleMasterVolumeChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${masterVolume}%, #374151 ${masterVolume}%, #374151 100%)`
                }}
              />
              <p className="text-xs text-gray-400">
                控制所有音效的整体音量
              </p>
            </div>

            {/* 音效音量 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <label className="text-white font-medium">音效音量</label>
                  <button
                    onClick={() => {
                      setSfxEnabled(!sfxEnabled)
                      audioSystem.play('click')
                    }}
                    className={`ml-2 px-2 py-1 text-xs rounded transition-all ${
                      sfxEnabled
                        ? 'bg-green-500/20 text-green-400 border border-green-500'
                        : 'bg-gray-700/50 text-gray-500 border border-gray-600'
                    }`}
                  >
                    {sfxEnabled ? '✓ 已启用' : '✗ 已禁用'}
                  </button>
                </div>
                <span className="text-yellow-400 font-mono font-bold">{sfxVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={sfxVolume}
                onChange={(e) => handleSfxVolumeChange(parseInt(e.target.value))}
                disabled={!sfxEnabled}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #eab308 0%, #eab308 ${sfxVolume}%, #374151 ${sfxVolume}%, #374151 100%)`,
                  opacity: sfxEnabled ? 1 : 0.5
                }}
              />

              {/* 音效测试按钮 */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={(e) => {
                    feedback.onClick(e)
                    handleTestSound('click')
                  }}
                  disabled={!sfxEnabled}
                  className="px-3 py-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500 text-blue-400 rounded transition-all disabled:opacity-50 feedback-button-scale"
                >
                  测试：点击音效
                </button>
                <button
                  onClick={(e) => {
                    feedback.onClick(e)
                    handleTestSound('success')
                  }}
                  disabled={!sfxEnabled}
                  className="px-3 py-1.5 text-xs bg-green-500/20 hover:bg-green-500/30 border border-green-500 text-green-400 rounded transition-all disabled:opacity-50 feedback-button-scale"
                >
                  测试：成功音效
                </button>
                <button
                  onClick={(e) => {
                    feedback.onClick(e)
                    handleTestSound('error')
                  }}
                  disabled={!sfxEnabled}
                  className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 border border-red-500 text-red-400 rounded transition-all disabled:opacity-50 feedback-button-scale"
                >
                  测试：错误音效
                </button>
                <button
                  onClick={(e) => {
                    feedback.onClick(e)
                    handleTestSound('levelup')
                  }}
                  disabled={!sfxEnabled}
                  className="px-3 py-1.5 text-xs bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500 text-purple-400 rounded transition-all disabled:opacity-50 feedback-button-scale"
                >
                  测试：升级音效
                </button>
                <button
                  onClick={(e) => {
                    feedback.onClick(e)
                    handleTestSound('achievement')
                  }}
                  disabled={!sfxEnabled}
                  className="px-3 py-1.5 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500 text-yellow-400 rounded transition-all disabled:opacity-50 feedback-button-scale"
                >
                  测试：成就音效
                </button>
              </div>
            </div>

            {/* 背景音乐（预留） */}
            <div className="space-y-3 opacity-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-purple-400" />
                  <label className="text-white font-medium">背景音乐</label>
                  <button
                    onClick={() => setMusicEnabled(!musicEnabled)}
                    className={`ml-2 px-2 py-1 text-xs rounded transition-all ${
                      musicEnabled
                        ? 'bg-green-500/20 text-green-400 border border-green-500'
                        : 'bg-gray-700/50 text-gray-500 border border-gray-600'
                    }`}
                  >
                    {musicEnabled ? '✓ 已启用' : '✗ 已禁用'}
                  </button>
                </div>
                <span className="text-purple-400 font-mono font-bold">{musicVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                disabled={!musicEnabled}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${musicVolume}%, #374151 ${musicVolume}%, #374151 100%)`,
                  opacity: musicEnabled ? 1 : 0.5
                }}
              />
              <p className="text-xs text-gray-400">
                🚧 背景音乐功能即将推出
              </p>
            </div>

            {/* 通知音效 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-400" />
                  <label className="text-white font-medium">通知音效</label>
                </div>
                <button
                  onClick={() => {
                    setNotificationSoundEnabled(!notificationSoundEnabled)
                    audioSystem.play('click')
                  }}
                  className={`px-3 py-1.5 text-xs rounded transition-all ${
                    notificationSoundEnabled
                      ? 'bg-green-500/20 text-green-400 border border-green-500'
                      : 'bg-gray-700/50 text-gray-500 border border-gray-600'
                  }`}
                >
                  {notificationSoundEnabled ? '✓ 已启用' : '✗ 已禁用'}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                任务完成、成就解锁等系统通知时播放音效
              </p>
            </div>

            {/* 分隔线 */}
            <div className="border-t border-gray-700"></div>

            {/* 快捷预设 */}
            <div className="space-y-3">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                快捷预设
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={(e) => {
                    feedback.onClick(e)
                    audioSystem.play('click')
                    setMasterVolume(0)
                    audioSystem.setVolume(0)
                  }}
                  className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-lg transition-all feedback-button-scale"
                >
                  <VolumeX className="w-5 h-5 text-red-400 mx-auto mb-1" />
                  <div className="text-xs text-white">静音</div>
                </button>
                <button
                  onClick={(e) => {
                    feedback.onClick(e)
                    audioSystem.play('click')
                    setMasterVolume(50)
                    audioSystem.setVolume(0.5)
                  }}
                  className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-lg transition-all feedback-button-scale"
                >
                  <Volume2 className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <div className="text-xs text-white">中等音量</div>
                </button>
                <button
                  onClick={(e) => {
                    feedback.onClick(e)
                    audioSystem.play('click')
                    setMasterVolume(100)
                    audioSystem.setVolume(1)
                  }}
                  className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-lg transition-all feedback-button-scale"
                >
                  <Volume2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <div className="text-xs text-white">最大音量</div>
                </button>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="p-6 bg-gray-900/50 border-t border-gray-700 flex justify-end gap-3">
            <button
              onClick={(e) => {
                feedback.onClick(e)
                audioSystem.play('click')
                onClose()
              }}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-cyan-500/50 feedback-button-scale feedback-button-glow"
            >
              完成
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
