/**
 * 语音设置面板组件
 * 控制 TTS 和语音识别设置
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, Play, Square, Settings as SettingsIcon } from 'lucide-react'
import { voiceService, type VoiceSettings } from '../services/voiceService'
import { audioSystem } from '../services/audioSystem'

export const VoiceSettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<VoiceSettings>(voiceService.getSettings())
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)

  // 加载可用语音
  useEffect(() => {
    const voices = voiceService.getAvailableVoices()
    setAvailableVoices(voices)

    // 语音列表可能需要时间加载
    const timeout = setTimeout(() => {
      const updatedVoices = voiceService.getAvailableVoices()
      setAvailableVoices(updatedVoices)
    }, 100)

    return () => clearTimeout(timeout)
  }, [])

  // 监听识别状态
  useEffect(() => {
    const checkListening = setInterval(() => {
      setIsListening(voiceService.isCurrentlyListening())
    }, 100)

    return () => clearInterval(checkListening)
  }, [])

  // 更新设置
  const handleUpdateSettings = (updates: Partial<VoiceSettings>) => {
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    voiceService.updateSettings(updates)
    audioSystem.play('click')
  }

  // 测试语音
  const handleTestVoice = () => {
    setIsSpeaking(true)
    voiceService.testVoice()
    audioSystem.play('success')
    setTimeout(() => setIsSpeaking(false), 2000)
  }

  // 开始/停止监听
  const handleToggleListening = () => {
    if (isListening) {
      voiceService.stopListening()
      audioSystem.play('click')
    } else {
      const started = voiceService.startListening((text) => {
        setTranscript(text)
        setTimeout(() => setTranscript(''), 3000)
      })
      if (started) {
        audioSystem.play('success')
      } else {
        audioSystem.play('error')
      }
    }
  }

  // 按语言过滤语音
  const filteredVoices = availableVoices.filter((v) =>
    v.lang.startsWith(settings.language)
  )

  const ttsSupported = voiceService.isTTSSupported()
  const recognitionSupported = voiceService.isRecognitionSupported()

  return (
    <div className="space-y-6">
      {/* TTS 设置 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            语音合成 (TTS)
          </h3>
          {!ttsSupported && (
            <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">
              不支持
            </span>
          )}
        </div>

        {ttsSupported ? (
          <>
            {/* TTS 启用开关 */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <div className="font-medium text-white">启用语音播报</div>
                <div className="text-sm text-gray-400 mt-1">
                  任务完成、错误提示等通知
                </div>
              </div>
              <button
                onClick={() => handleUpdateSettings({ ttsEnabled: !settings.ttsEnabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.ttsEnabled ? 'bg-cyan-600' : 'bg-gray-600'
                }`}
              >
                <motion.div
                  className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  animate={{ left: settings.ttsEnabled ? '1.75rem' : '0.25rem' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* 语言选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">语言</label>
              <div className="grid grid-cols-2 gap-3">
                {(['zh-CN', 'en-US'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleUpdateSettings({ language: lang })}
                    disabled={!settings.ttsEnabled}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      settings.language === lang
                        ? 'border-cyan-500 bg-cyan-500/20'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    } ${!settings.ttsEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="font-medium">
                      {lang === 'zh-CN' ? '中文' : 'English'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 语音选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                语音 ({filteredVoices.length} 可用)
              </label>
              <select
                value={settings.voice}
                onChange={(e) => handleUpdateSettings({ voice: e.target.value })}
                disabled={!settings.ttsEnabled}
                className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
              >
                <option value="">默认语音</option>
                {filteredVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* 语速 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">语速</label>
                <span className="text-sm text-cyan-400 font-mono">{settings.rate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.rate}
                onChange={(e) => handleUpdateSettings({ rate: parseFloat(e.target.value) })}
                disabled={!settings.ttsEnabled}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>慢速</span>
                <span>快速</span>
              </div>
            </div>

            {/* 音调 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">音调</label>
                <span className="text-sm text-cyan-400 font-mono">{settings.pitch.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.pitch}
                onChange={(e) => handleUpdateSettings({ pitch: parseFloat(e.target.value) })}
                disabled={!settings.ttsEnabled}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>低音</span>
                <span>高音</span>
              </div>
            </div>

            {/* 音量 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">音量</label>
                <span className="text-sm text-cyan-400 font-mono">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.volume}
                onChange={(e) => handleUpdateSettings({ volume: parseFloat(e.target.value) })}
                disabled={!settings.ttsEnabled}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* 测试按钮 */}
            <button
              onClick={handleTestVoice}
              disabled={!settings.ttsEnabled || isSpeaking}
              className="w-full p-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2"
            >
              {isSpeaking ? (
                <>
                  <Square className="w-5 h-5" />
                  正在播放...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  测试语音
                </>
              )}
            </button>
          </>
        ) : (
          <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg text-red-300 text-sm">
            浏览器不支持语音合成功能
          </div>
        )}
      </motion.div>

      {/* 分隔线 */}
      <div className="border-t border-gray-700"></div>

      {/* 语音识别设置 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-purple-400" />
            语音识别
          </h3>
          {!recognitionSupported && (
            <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">
              不支持
            </span>
          )}
        </div>

        {recognitionSupported ? (
          <>
            {/* 识别启用开关 */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <div className="font-medium text-white">启用语音命令</div>
                <div className="text-sm text-gray-400 mt-1">
                  通过语音控制 AgentForge
                </div>
              </div>
              <button
                onClick={() => handleUpdateSettings({ recognitionEnabled: !settings.recognitionEnabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.recognitionEnabled ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <motion.div
                  className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  animate={{ left: settings.recognitionEnabled ? '1.75rem' : '0.25rem' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* 持续识别 */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <div className="font-medium text-white">持续识别</div>
                <div className="text-sm text-gray-400 mt-1">
                  保持监听，无需重复点击
                </div>
              </div>
              <button
                onClick={() => handleUpdateSettings({ continuous: !settings.continuous })}
                disabled={!settings.recognitionEnabled}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  !settings.recognitionEnabled ? 'bg-gray-700 opacity-50' :
                  settings.continuous ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <motion.div
                  className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  animate={{ left: settings.continuous ? '1.75rem' : '0.25rem' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* 降噪设置 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                降噪优化
              </h4>

              <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="text-sm text-white">降噪处理</div>
                <button
                  onClick={() => handleUpdateSettings({ noiseReduction: !settings.noiseReduction })}
                  disabled={!settings.recognitionEnabled}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    !settings.recognitionEnabled ? 'bg-gray-700 opacity-50' :
                    settings.noiseReduction ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full"
                    animate={{ left: settings.noiseReduction ? '1.5rem' : '0.25rem' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="text-sm text-white">回声消除</div>
                <button
                  onClick={() => handleUpdateSettings({ echoCancellation: !settings.echoCancellation })}
                  disabled={!settings.recognitionEnabled}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    !settings.recognitionEnabled ? 'bg-gray-700 opacity-50' :
                    settings.echoCancellation ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full"
                    animate={{ left: settings.echoCancellation ? '1.5rem' : '0.25rem' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>

            {/* 监听按钮 */}
            <button
              onClick={handleToggleListening}
              disabled={!settings.recognitionEnabled}
              className={`w-full p-4 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
                isListening
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 animate-pulse'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
              } disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  停止监听
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  开始监听
                </>
              )}
            </button>

            {/* 识别结果显示 */}
            {transcript && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-purple-900/30 border border-purple-700/50 rounded-lg"
              >
                <div className="text-xs text-purple-400 mb-1">识别结果:</div>
                <div className="text-white font-medium">{transcript}</div>
              </motion.div>
            )}

            {/* 支持的命令 */}
            <div className="p-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-700/50 rounded-lg">
              <div className="text-sm font-bold text-purple-300 mb-2">
                支持的语音命令:
              </div>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• "创建任务" - 打开创建任务对话框</li>
                <li>• "暂停所有" - 暂停所有进行中的任务</li>
                <li>• "显示统计" - 查看任务统计数据</li>
                <li>• "打开设置" - 打开设置面板</li>
                <li>• "查看任务" - 显示任务列表</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg text-red-300 text-sm">
            浏览器不支持语音识别功能。请使用 Chrome 或 Edge 浏览器。
          </div>
        )}
      </motion.div>
    </div>
  )
}
