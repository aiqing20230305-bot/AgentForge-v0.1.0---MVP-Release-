/**
 * Notification Settings Panel
 * Configure desktop notifications, browser notifications, and sound effects
 */

import React, { useState, useEffect } from 'react'
import { notificationService, type NotificationSettings } from '../services/notificationService'
import { notify } from '../services/notificationService'

export const NotificationSettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>(
    notificationService.getSettings()
  )
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    // Load current settings
    setSettings(notificationService.getSettings())
  }, [])

  const handleToggle = (key: keyof NotificationSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key]
    }
    setSettings(newSettings)
    notificationService.updateSettings(newSettings)
  }

  const handleVolumeChange = (volume: number) => {
    const newSettings = {
      ...settings,
      soundVolume: volume
    }
    setSettings(newSettings)
    notificationService.updateSettings(newSettings)
  }

  const handleTestNotification = async () => {
    setTestResult('发送中...')
    await notify.taskComplete('测试任务', 'AgentForge')
    setTestResult('✅ 测试通知已发送')
    setTimeout(() => setTestResult(''), 3000)
  }

  const handleTestSound = async () => {
    setTestResult('播放中...')
    await notify.levelUp('测试Agent', 10)
    setTestResult('🔊 测试音效已播放')
    setTimeout(() => setTestResult(''), 3000)
  }

  const isElectron = typeof window !== 'undefined' && 'electronAPI' in window

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">通知设置</h2>
        <p className="text-gray-400">配置桌面通知、浏览器通知和音效反馈</p>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        {/* Desktop Notifications */}
        {isElectron && (
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">桌面通知</h3>
                <p className="text-sm text-gray-400">
                  通过 Electron 显示原生系统通知
                </p>
              </div>
              <button
                onClick={() => handleToggle('desktopEnabled')}
                className={`
                  relative inline-flex h-8 w-14 items-center rounded-full transition-colors
                  ${settings.desktopEnabled ? 'bg-blue-500' : 'bg-gray-600'}
                `}
              >
                <span
                  className={`
                    inline-block h-6 w-6 transform rounded-full bg-white transition-transform
                    ${settings.desktopEnabled ? 'translate-x-7' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        )}

        {/* Browser Notifications */}
        {!isElectron && (
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">浏览器通知</h3>
                <p className="text-sm text-gray-400">
                  通过浏览器 Notification API 显示通知
                </p>
              </div>
              <button
                onClick={() => handleToggle('browserEnabled')}
                className={`
                  relative inline-flex h-8 w-14 items-center rounded-full transition-colors
                  ${settings.browserEnabled ? 'bg-blue-500' : 'bg-gray-600'}
                `}
              >
                <span
                  className={`
                    inline-block h-6 w-6 transform rounded-full bg-white transition-transform
                    ${settings.browserEnabled ? 'translate-x-7' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        )}

        {/* Sound Effects */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">音效反馈</h3>
              <p className="text-sm text-gray-400">
                为任务完成、失败、升级播放音效
              </p>
            </div>
            <button
              onClick={() => handleToggle('soundEnabled')}
              className={`
                relative inline-flex h-8 w-14 items-center rounded-full transition-colors
                ${settings.soundEnabled ? 'bg-blue-500' : 'bg-gray-600'}
              `}
            >
              <span
                className={`
                  inline-block h-6 w-6 transform rounded-full bg-white transition-transform
                  ${settings.soundEnabled ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Volume Slider */}
          {settings.soundEnabled && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-300">音量</label>
                <span className="text-sm text-gray-400">
                  {Math.round(settings.soundVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-blue-500
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-4
                  [&::-moz-range-thumb]:h-4
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-blue-500
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Test Buttons */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">测试通知</h3>
        <div className="flex gap-3">
          <button
            onClick={handleTestNotification}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
              transition-colors font-medium"
          >
            测试通知
          </button>
          <button
            onClick={handleTestSound}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg
              transition-colors font-medium"
          >
            测试音效
          </button>
        </div>
        {testResult && (
          <div className="text-center text-sm text-green-400 py-2">
            {testResult}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-blue-400 font-semibold mb-2">💡 提示</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• 音效文件位于 <code className="text-blue-400">public/sounds/</code></li>
          <li>• 如果音效文件不存在，会自动使用合成音效</li>
          <li>• 通知历史保存最近 50 条记录</li>
          {!isElectron && (
            <li>• 浏览器通知需要授予权限才能显示</li>
          )}
        </ul>
      </div>
    </div>
  )
}
