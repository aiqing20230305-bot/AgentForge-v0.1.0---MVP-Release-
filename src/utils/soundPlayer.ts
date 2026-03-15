/**
 * Sound Player
 * Plays audio feedback with fallback to Web Audio API synthesized sounds
 */

export type SoundType = 'task-complete' | 'task-failed' | 'level-up'

interface SoundConfig {
  path: string
  fallbackFrequency: number
  fallbackDuration: number
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  'task-complete': {
    path: '/sounds/task-complete.mp3',
    fallbackFrequency: 880, // A5 note - pleasant success sound
    fallbackDuration: 0.2
  },
  'task-failed': {
    path: '/sounds/task-failed.mp3',
    fallbackFrequency: 220, // A3 note - lower error sound
    fallbackDuration: 0.15
  },
  'level-up': {
    path: '/sounds/level-up.mp3',
    fallbackFrequency: 1046.5, // C6 note - high achievement sound
    fallbackDuration: 0.3
  }
}

class SoundPlayer {
  private audioContext: AudioContext | null = null
  private audioCache: Map<string, HTMLAudioElement> = new Map()
  private enabled: boolean = true
  private volume: number = 0.5 // 0.0 to 1.0

  constructor() {
    // Initialize Web Audio API context lazily
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      // Create context on first user interaction (browser requirement)
      const initContext = () => {
        if (!this.audioContext) {
          this.audioContext = new AudioContext()
          document.removeEventListener('click', initContext)
          document.removeEventListener('keydown', initContext)
        }
      }
      document.addEventListener('click', initContext, { once: true })
      document.addEventListener('keydown', initContext, { once: true })
    }
  }

  /**
   * Play a sound effect
   */
  async play(type: SoundType): Promise<void> {
    if (!this.enabled) return

    const config = SOUND_CONFIGS[type]

    try {
      // Try to play from file first
      await this.playFromFile(config.path)
    } catch (error) {
      // Fallback to synthesized sound
      console.warn(`Failed to load sound file ${config.path}, using fallback`, error)
      this.playSynthesized(config.fallbackFrequency, config.fallbackDuration)
    }
  }

  /**
   * Play sound from file
   */
  private async playFromFile(path: string): Promise<void> {
    // Check cache
    let audio = this.audioCache.get(path)

    if (!audio) {
      // Create new audio element
      audio = new Audio(path)
      audio.volume = this.volume

      // Test if file exists
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 2000)
        audio!.addEventListener('canplaythrough', () => {
          clearTimeout(timeout)
          resolve()
        }, { once: true })
        audio!.addEventListener('error', () => {
          clearTimeout(timeout)
          reject(new Error('File not found'))
        }, { once: true })
        audio!.load()
      })

      // Cache for future use
      this.audioCache.set(path, audio)
    } else {
      // Reset audio to start
      audio.currentTime = 0
      audio.volume = this.volume
    }

    // Play
    await audio.play()
  }

  /**
   * Play synthesized beep sound using Web Audio API
   */
  private playSynthesized(frequency: number, duration: number): void {
    if (!this.audioContext) {
      console.warn('Web Audio API not available')
      return
    }

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'

      // Envelope for smooth sound
      const now = this.audioContext.currentTime
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)

      oscillator.start(now)
      oscillator.stop(now + duration)
    } catch (error) {
      console.error('Failed to play synthesized sound:', error)
    }
  }

  /**
   * Enable/disable sound effects
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * Get current enabled state
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))

    // Update cached audio elements
    this.audioCache.forEach(audio => {
      audio.volume = this.volume
    })
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume
  }

  /**
   * Preload all sound files
   */
  async preloadAll(): Promise<void> {
    const promises = Object.values(SOUND_CONFIGS).map(config =>
      this.playFromFile(config.path).catch(() => {
        // Ignore preload errors
        console.log(`Sound file ${config.path} not available, will use fallback`)
      })
    )

    await Promise.allSettled(promises)
  }

  /**
   * Clear audio cache
   */
  clearCache(): void {
    this.audioCache.clear()
  }
}

// Global singleton instance
export const soundPlayer = new SoundPlayer()

// Preload sounds on app start (optional)
if (typeof window !== 'undefined') {
  // Wait a bit for app to load, then preload sounds
  setTimeout(() => {
    soundPlayer.preloadAll()
  }, 2000)
}
