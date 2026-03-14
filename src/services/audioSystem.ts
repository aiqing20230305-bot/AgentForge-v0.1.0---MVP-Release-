/**
 * 音效系统
 * 使用Web Audio API和预加载音效
 */

export type SoundType =
  | 'click'
  | 'success'
  | 'error'
  | 'levelup'
  | 'achievement'
  | 'battle_hit'
  | 'battle_win'
  | 'battle_lose'
  | 'coin'
  | 'exp_gain'
  | 'quest_complete'
  | 'notification'

export interface AudioSystemOptions {
  masterVolume?: number
  soundEnabled?: boolean
  musicEnabled?: boolean
}

class AudioSystem {
  private audioContext: AudioContext | null = null
  private sounds: Map<SoundType, AudioBuffer> = new Map()
  private masterVolume = 0.3
  private soundEnabled = true
  private musicEnabled = true

  constructor(options: AudioSystemOptions = {}) {
    this.masterVolume = options.masterVolume ?? 0.3
    this.soundEnabled = options.soundEnabled ?? true
    this.musicEnabled = options.musicEnabled ?? true

    // 从localStorage读取设置
    const savedSettings = localStorage.getItem('audio-settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      this.masterVolume = settings.masterVolume ?? this.masterVolume
      this.soundEnabled = settings.soundEnabled ?? this.soundEnabled
      this.musicEnabled = settings.musicEnabled ?? this.musicEnabled
    }

    this.init()
  }

  private init() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      console.log('[AudioSystem] Initialized')
    } catch (error) {
      console.error('[AudioSystem] Failed to initialize:', error)
    }
  }

  /**
   * 生成音效（程序化）
   */
  private generateSound(type: SoundType): AudioBuffer | null {
    if (!this.audioContext) return null

    const sampleRate = this.audioContext.sampleRate
    const soundConfigs: Record<
      SoundType,
      { duration: number; frequency: number; type: OscillatorType; envelope?: 'sharp' | 'smooth' | 'pluck' }
    > = {
      click: { duration: 0.05, frequency: 800, type: 'sine', envelope: 'sharp' },
      success: { duration: 0.15, frequency: 1200, type: 'sine', envelope: 'smooth' },
      error: { duration: 0.2, frequency: 200, type: 'square', envelope: 'sharp' },
      levelup: { duration: 0.4, frequency: 1500, type: 'sine', envelope: 'smooth' },
      achievement: { duration: 0.5, frequency: 1800, type: 'sine', envelope: 'smooth' },
      battle_hit: { duration: 0.1, frequency: 400, type: 'square', envelope: 'sharp' },
      battle_win: { duration: 0.6, frequency: 2000, type: 'sine', envelope: 'smooth' },
      battle_lose: { duration: 0.6, frequency: 150, type: 'sawtooth', envelope: 'smooth' },
      coin: { duration: 0.1, frequency: 1000, type: 'sine', envelope: 'pluck' },
      exp_gain: { duration: 0.15, frequency: 1400, type: 'sine', envelope: 'smooth' },
      quest_complete: { duration: 0.3, frequency: 1600, type: 'sine', envelope: 'smooth' },
      notification: { duration: 0.2, frequency: 900, type: 'sine', envelope: 'smooth' }
    }

    const config = soundConfigs[type]
    const buffer = this.audioContext.createBuffer(1, sampleRate * config.duration, sampleRate)
    const data = buffer.getChannelData(0)

    // 生成波形
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const progress = i / data.length

      // 基础波形
      let value = 0
      if (config.type === 'sine') {
        value = Math.sin(2 * Math.PI * config.frequency * t)
      } else if (config.type === 'square') {
        value = Math.sign(Math.sin(2 * Math.PI * config.frequency * t))
      } else if (config.type === 'sawtooth') {
        value = 2 * ((config.frequency * t) % 1) - 1
      }

      // 应用包络
      let envelope = 1
      if (config.envelope === 'sharp') {
        envelope = Math.exp(-progress * 10)
      } else if (config.envelope === 'smooth') {
        envelope = Math.exp(-progress * 3)
      } else if (config.envelope === 'pluck') {
        envelope = Math.exp(-progress * 15) * Math.sin(progress * Math.PI)
      }

      data[i] = value * envelope
    }

    return buffer
  }

  /**
   * 预加载所有音效
   */
  async preloadSounds() {
    const soundTypes: SoundType[] = [
      'click',
      'success',
      'error',
      'levelup',
      'achievement',
      'battle_hit',
      'battle_win',
      'battle_lose',
      'coin',
      'exp_gain',
      'quest_complete',
      'notification'
    ]

    soundTypes.forEach(type => {
      const buffer = this.generateSound(type)
      if (buffer) {
        this.sounds.set(type, buffer)
      }
    })

    console.log('[AudioSystem] Preloaded', this.sounds.size, 'sounds')
  }

  /**
   * 播放音效
   */
  play(type: SoundType, volume: number = 1) {
    if (!this.soundEnabled || !this.audioContext) return

    // 如果音频上下文被挂起，恢复它
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

    let buffer = this.sounds.get(type)

    // 如果没有预加载，实时生成
    if (!buffer) {
      buffer = this.generateSound(type)
      if (!buffer) return
      this.sounds.set(type, buffer)
    }

    try {
      const source = this.audioContext.createBufferSource()
      source.buffer = buffer

      const gainNode = this.audioContext.createGain()
      gainNode.gain.value = this.masterVolume * volume

      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      source.start()
    } catch (error) {
      console.error('[AudioSystem] Failed to play sound:', type, error)
    }
  }

  /**
   * 播放音效序列
   */
  playSequence(sequence: Array<{ type: SoundType; delay: number; volume?: number }>) {
    sequence.forEach(({ type, delay, volume }) => {
      setTimeout(() => {
        this.play(type, volume)
      }, delay)
    })
  }

  /**
   * 设置主音量
   */
  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    this.saveSettings()
  }

  /**
   * 设置主音量
   */
  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    this.saveSettings()
  }

  /**
   * 启用/禁用音效
   */
  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled
    this.saveSettings()
  }

  /**
   * 启用/禁用音乐
   */
  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled
    this.saveSettings()
  }

  /**
   * 获取设置
   */
  getSettings() {
    return {
      masterVolume: this.masterVolume,
      soundEnabled: this.soundEnabled,
      musicEnabled: this.musicEnabled
    }
  }

  /**
   * 保存设置
   */
  private saveSettings() {
    localStorage.setItem(
      'audio-settings',
      JSON.stringify({
        masterVolume: this.masterVolume,
        soundEnabled: this.soundEnabled,
        musicEnabled: this.musicEnabled
      })
    )
  }

  /**
   * 播放升级音效序列
   */
  playLevelUpSequence() {
    this.playSequence([
      { type: 'success', delay: 0, volume: 0.8 },
      { type: 'levelup', delay: 100, volume: 1 },
      { type: 'success', delay: 300, volume: 0.6 },
      { type: 'achievement', delay: 500, volume: 0.8 }
    ])
  }

  /**
   * 播放成就解锁音效序列
   */
  playAchievementSequence() {
    this.playSequence([
      { type: 'success', delay: 0, volume: 0.7 },
      { type: 'achievement', delay: 100, volume: 1 },
      { type: 'coin', delay: 400, volume: 0.8 },
      { type: 'coin', delay: 500, volume: 0.8 },
      { type: 'coin', delay: 600, volume: 0.8 }
    ])
  }

  /**
   * 播放战斗胜利音效序列
   */
  playBattleWinSequence() {
    this.playSequence([
      { type: 'battle_win', delay: 0, volume: 1 },
      { type: 'success', delay: 300, volume: 0.8 },
      { type: 'exp_gain', delay: 500, volume: 0.9 },
      { type: 'coin', delay: 700, volume: 0.7 },
      { type: 'coin', delay: 800, volume: 0.7 }
    ])
  }

  /**
   * 播放战斗失败音效序列
   */
  playBattleLoseSequence() {
    this.playSequence([
      { type: 'battle_lose', delay: 0, volume: 0.9 },
      { type: 'error', delay: 400, volume: 0.6 }
    ])
  }

  /**
   * 播放任务完成音效序列
   */
  playQuestCompleteSequence() {
    this.playSequence([
      { type: 'quest_complete', delay: 0, volume: 1 },
      { type: 'exp_gain', delay: 200, volume: 0.8 },
      { type: 'coin', delay: 400, volume: 0.7 }
    ])
  }
}

// 单例
export const audioSystem = new AudioSystem()

// 初始化时预加载
if (typeof window !== 'undefined') {
  // 用户交互后初始化（浏览器限制）
  const initAudio = () => {
    audioSystem.preloadSounds()
    document.removeEventListener('click', initAudio)
    document.removeEventListener('keydown', initAudio)
    console.log('[AudioSystem] Initialized on user interaction')
  }

  document.addEventListener('click', initAudio, { once: true })
  document.addEventListener('keydown', initAudio, { once: true })
}
