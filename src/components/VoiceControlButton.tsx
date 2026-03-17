/**
 * 语音控制浮动按钮
 * 快速访问语音命令功能
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, Settings } from 'lucide-react'
import { voiceService } from '../services/voiceService'
import { audioSystem } from '../services/audioSystem'

interface VoiceControlButtonProps {
  onOpenSettings?: () => void
}

export const VoiceControlButton: React.FC<VoiceControlButtonProps> = ({ onOpenSettings }) => {
  const [isListening, setIsListening] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [transcript, setTranscript] = useState('')

  // 检查语音识别是否启用
  useEffect(() => {
    const settings = voiceService.getSettings()
    setIsEnabled(settings.recognitionEnabled)
  }, [])

  // 监听状态
  useEffect(() => {
    const interval = setInterval(() => {
      setIsListening(voiceService.isCurrentlyListening())
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // 切换监听
  const handleToggleListening = () => {
    if (!isEnabled) {
      audioSystem.play('error')
      return
    }

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

  // 测试语音
  const handleTestVoice = () => {
    voiceService.testVoice()
    audioSystem.play('success')
    setShowMenu(false)
  }

  // 打开设置
  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings()
    }
    audioSystem.play('click')
    setShowMenu(false)
  }

  if (!voiceService.isRecognitionSupported() && !voiceService.isTTSSupported()) {
    return null
  }

  return (
    <>
      {/* 浮动按钮 */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <div className="relative">
          {/* 主按钮 */}
          <motion.button
            onClick={handleToggleListening}
            onContextMenu={(e) => {
              e.preventDefault()
              setShowMenu(!showMenu)
            }}
            disabled={!isEnabled}
            className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-gradient-to-br from-red-500 to-pink-500 animate-pulse'
                : isEnabled
                ? 'bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
                : 'bg-gray-700 cursor-not-allowed opacity-50'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isListening ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </motion.button>

          {/* 监听指示器 */}
          {isListening && (
            <motion.div
              className="absolute -inset-2 rounded-full border-4 border-red-500"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 0.3, 0.8]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          )}

          {/* 菜单 */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute bottom-16 right-0 bg-gray-900 border-2 border-purple-500/30 rounded-xl shadow-2xl overflow-hidden w-48"
              >
                <button
                  onClick={handleTestVoice}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-900/30 transition-colors text-left"
                >
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  <span className="text-white text-sm">测试语音</span>
                </button>

                <button
                  onClick={handleOpenSettings}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-900/30 transition-colors text-left border-t border-gray-800"
                >
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span className="text-white text-sm">语音设置</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 识别结果浮窗 */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-24 right-6 z-40 max-w-xs"
          >
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border-2 border-purple-500/50 rounded-xl p-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <Mic className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-purple-300 mb-1">识别结果:</div>
                  <div className="text-white font-medium">{transcript}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 提示 - 首次使用 */}
      {!isEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 right-6 z-40 max-w-xs"
        >
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 rounded-xl p-4 shadow-2xl">
            <div className="text-sm text-gray-300">
              <p className="mb-2">右键点击打开菜单</p>
              <p className="text-xs text-gray-500">在设置中启用语音识别功能</p>
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}
