/**
 * 语音服务 - Voice Service
 * 集成 Web Speech API (TTS + Speech Recognition)
 * 支持任务通知、错误提示、Agent状态播报和语音命令
 */

export interface VoiceSettings {
  // TTS 设置
  ttsEnabled: boolean
  voice: string // 语音名称
  rate: number // 语速 (0.1 - 10)
  pitch: number // 音调 (0 - 2)
  volume: number // 音量 (0 - 1)
  language: 'zh-CN' | 'en-US'

  // 语音识别设置
  recognitionEnabled: boolean
  continuous: boolean // 持续识别
  interimResults: boolean // 中间结果
  maxAlternatives: number // 最大候选数

  // 降噪设置
  noiseReduction: boolean
  echoCancellation: boolean
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  ttsEnabled: true,
  voice: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  language: 'zh-CN',

  recognitionEnabled: false,
  continuous: false,
  interimResults: true,
  maxAlternatives: 1,

  noiseReduction: true,
  echoCancellation: true
}

export type VoiceCommand =
  | '创建任务'
  | '暂停所有'
  | '显示统计'
  | '打开设置'
  | '查看任务'
  | '开始任务'
  | '完成任务'

export interface VoiceCommandHandler {
  command: VoiceCommand
  patterns: RegExp[]
  handler: () => void
  description: string
}

/**
 * 语音服务类
 */
class VoiceService {
  private synthesis: SpeechSynthesis | null = null
  private recognition: any = null // SpeechRecognition
  private settings: VoiceSettings = DEFAULT_VOICE_SETTINGS
  private availableVoices: SpeechSynthesisVoice[] = []
  private commandHandlers: Map<VoiceCommand, VoiceCommandHandler> = new Map()
  private isListening = false
  private recognitionCallback: ((transcript: string) => void) | null = null

  constructor() {
    this.init()
  }

  /**
   * 初始化语音服务
   */
  private init() {
    // 初始化 TTS
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis

      // 加载可用语音
      this.loadVoices()
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices()
      }
    }

    // 初始化语音识别
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      this.recognition = new SpeechRecognition()
      this.setupRecognition()
    }

    // 从 localStorage 加载设置
    this.loadSettings()

    console.log('[VoiceService] Initialized', {
      tts: !!this.synthesis,
      recognition: !!this.recognition
    })
  }

  /**
   * 加载可用语音
   */
  private loadVoices() {
    if (!this.synthesis) return

    this.availableVoices = this.synthesis.getVoices()

    // 如果没有选择语音，自动选择中文或英文语音
    if (!this.settings.voice && this.availableVoices.length > 0) {
      const preferredVoice = this.availableVoices.find(
        (v) => v.lang.startsWith(this.settings.language)
      )
      if (preferredVoice) {
        this.settings.voice = preferredVoice.name
      }
    }

    console.log(`[VoiceService] Loaded ${this.availableVoices.length} voices`)
  }

  /**
   * 设置语音识别
   */
  private setupRecognition() {
    if (!this.recognition) return

    this.recognition.continuous = this.settings.continuous
    this.recognition.interimResults = this.settings.interimResults
    this.recognition.maxAlternatives = this.settings.maxAlternatives
    this.recognition.lang = this.settings.language

    // 识别结果
    this.recognition.onresult = (event: any) => {
      const results = event.results
      const lastResult = results[results.length - 1]
      const transcript = lastResult[0].transcript.trim()

      console.log('[VoiceService] Recognition result:', transcript)

      // 调用回调
      if (this.recognitionCallback) {
        this.recognitionCallback(transcript)
      }

      // 匹配命令
      this.matchCommand(transcript)
    }

    // 识别错误
    this.recognition.onerror = (event: any) => {
      console.error('[VoiceService] Recognition error:', event.error)
      if (event.error === 'no-speech') {
        this.speak('未检测到语音，请重试')
      } else if (event.error === 'not-allowed') {
        this.speak('麦克风权限被拒绝')
      }
    }

    // 识别结束
    this.recognition.onend = () => {
      console.log('[VoiceService] Recognition ended')
      this.isListening = false

      // 如果是持续模式，自动重启
      if (this.settings.continuous && this.settings.recognitionEnabled) {
        setTimeout(() => this.startListening(), 100)
      }
    }
  }

  /**
   * 语音合成 (TTS)
   */
  speak(text: string, options?: Partial<VoiceSettings>) {
    if (!this.synthesis || !this.settings.ttsEnabled) {
      console.log('[VoiceService] TTS disabled or unavailable')
      return
    }

    // 停止当前播放
    this.synthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    // 应用设置
    const voice = this.availableVoices.find(
      (v) => v.name === (options?.voice || this.settings.voice)
    )
    if (voice) {
      utterance.voice = voice
    }

    utterance.rate = options?.rate ?? this.settings.rate
    utterance.pitch = options?.pitch ?? this.settings.pitch
    utterance.volume = options?.volume ?? this.settings.volume
    utterance.lang = options?.language ?? this.settings.language

    // 事件监听
    utterance.onstart = () => {
      console.log('[VoiceService] Speaking:', text)
    }

    utterance.onend = () => {
      console.log('[VoiceService] Speech ended')
    }

    utterance.onerror = (event) => {
      console.error('[VoiceService] Speech error:', event.error)
    }

    // 播放
    this.synthesis.speak(utterance)
  }

  /**
   * 停止语音播放
   */
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel()
    }
  }

  /**
   * 任务完成通知
   */
  notifyTaskComplete(taskTitle: string) {
    this.speak(`任务已完成：${taskTitle}`)
  }

  /**
   * 错误提示
   */
  notifyError(error: string) {
    this.speak(`错误：${error}`)
  }

  /**
   * Agent 状态播报
   */
  notifyAgentStatus(agentName: string, status: string) {
    this.speak(`${agentName} ${status}`)
  }

  /**
   * 统计播报
   */
  notifyStats(stats: { total: number; completed: number; pending: number }) {
    const message = `总任务 ${stats.total} 个，已完成 ${stats.completed} 个，待处理 ${stats.pending} 个`
    this.speak(message)
  }

  /**
   * 开始语音识别
   */
  startListening(callback?: (transcript: string) => void) {
    if (!this.recognition || !this.settings.recognitionEnabled) {
      console.log('[VoiceService] Recognition disabled or unavailable')
      return false
    }

    if (this.isListening) {
      console.log('[VoiceService] Already listening')
      return false
    }

    this.recognitionCallback = callback || null

    try {
      this.recognition.start()
      this.isListening = true
      console.log('[VoiceService] Started listening')
      return true
    } catch (error) {
      console.error('[VoiceService] Failed to start recognition:', error)
      return false
    }
  }

  /**
   * 停止语音识别
   */
  stopListening() {
    if (!this.recognition || !this.isListening) return

    try {
      this.recognition.stop()
      this.isListening = false
      console.log('[VoiceService] Stopped listening')
    } catch (error) {
      console.error('[VoiceService] Failed to stop recognition:', error)
    }
  }

  /**
   * 注册语音命令
   */
  registerCommand(handler: VoiceCommandHandler) {
    this.commandHandlers.set(handler.command, handler)
    console.log('[VoiceService] Registered command:', handler.command)
  }

  /**
   * 注销语音命令
   */
  unregisterCommand(command: VoiceCommand) {
    this.commandHandlers.delete(command)
  }

  /**
   * 匹配语音命令
   */
  private matchCommand(transcript: string) {
    const normalizedTranscript = transcript.toLowerCase().trim()

    for (const [command, handler] of this.commandHandlers) {
      for (const pattern of handler.patterns) {
        if (pattern.test(normalizedTranscript)) {
          console.log('[VoiceService] Matched command:', command)
          this.speak(`收到：${command}`)
          handler.handler()
          return
        }
      }
    }

    console.log('[VoiceService] No command matched for:', transcript)
  }

  /**
   * 获取可用语音列表
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.availableVoices
  }

  /**
   * 获取中文语音
   */
  getChineseVoices(): SpeechSynthesisVoice[] {
    return this.availableVoices.filter((v) => v.lang.startsWith('zh'))
  }

  /**
   * 获取英文语音
   */
  getEnglishVoices(): SpeechSynthesisVoice[] {
    return this.availableVoices.filter((v) => v.lang.startsWith('en'))
  }

  /**
   * 更新设置
   */
  updateSettings(updates: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...updates }
    this.saveSettings()

    // 重新配置语音识别
    if (this.recognition) {
      this.recognition.continuous = this.settings.continuous
      this.recognition.interimResults = this.settings.interimResults
      this.recognition.maxAlternatives = this.settings.maxAlternatives
      this.recognition.lang = this.settings.language
    }

    console.log('[VoiceService] Settings updated:', this.settings)
  }

  /**
   * 获取设置
   */
  getSettings(): VoiceSettings {
    return { ...this.settings }
  }

  /**
   * 保存设置
   */
  private saveSettings() {
    localStorage.setItem('voice-settings', JSON.stringify(this.settings))
  }

  /**
   * 加载设置
   */
  private loadSettings() {
    const saved = localStorage.getItem('voice-settings')
    if (saved) {
      try {
        const loaded = JSON.parse(saved)
        this.settings = { ...DEFAULT_VOICE_SETTINGS, ...loaded }
        console.log('[VoiceService] Loaded settings:', this.settings)
      } catch (error) {
        console.error('[VoiceService] Failed to load settings:', error)
      }
    }
  }

  /**
   * 是否正在监听
   */
  isCurrentlyListening(): boolean {
    return this.isListening
  }

  /**
   * 检查 TTS 支持
   */
  isTTSSupported(): boolean {
    return !!this.synthesis
  }

  /**
   * 检查语音识别支持
   */
  isRecognitionSupported(): boolean {
    return !!this.recognition
  }

  /**
   * 测试语音
   */
  testVoice() {
    if (this.settings.language === 'zh-CN') {
      this.speak('你好，这是语音测试')
    } else {
      this.speak('Hello, this is a voice test')
    }
  }

  /**
   * 获取所有已注册的命令
   */
  getRegisteredCommands(): VoiceCommandHandler[] {
    return Array.from(this.commandHandlers.values())
  }
}

// 单例
export const voiceService = new VoiceService()

// 自动初始化
if (typeof window !== 'undefined') {
  console.log('[VoiceService] Service initialized')
}
