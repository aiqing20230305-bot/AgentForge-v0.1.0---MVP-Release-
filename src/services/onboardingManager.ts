/**
 * 新手引导管理器
 * Onboarding Manager - Multi-step tour flow control
 */

export interface OnboardingStep {
  id: string
  title: string
  content: string
  target?: string // CSS选择器
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  media?: {
    type: 'image' | 'gif' | 'video'
    url: string
  }
  action?: {
    label: string
    onClick: () => void
  }
  beforeShow?: () => Promise<void> | void // 显示前执行
  afterShow?: () => Promise<void> | void // 显示后执行
}

export interface OnboardingProgress {
  completed: boolean
  currentStepIndex: number
  completedSteps: string[]
  skipped: boolean
  lastViewedAt?: number
}

const STORAGE_KEY = 'agentforge_onboarding'
const VERSION_KEY = 'agentforge_onboarding_version'
const CURRENT_VERSION = '1.0.0'

/**
 * 新手引导管理器
 */
class OnboardingManager {
  private steps: OnboardingStep[] = []
  private currentStepIndex: number = 0
  private progress: OnboardingProgress = {
    completed: false,
    currentStepIndex: 0,
    completedSteps: [],
    skipped: false,
  }
  private listeners: Set<() => void> = new Set()

  constructor() {
    this.loadProgress()
    this.checkVersion()
  }

  /**
   * 设置引导步骤
   */
  setSteps(steps: OnboardingStep[]): void {
    this.steps = steps
    console.log('[OnboardingManager] Set', steps.length, 'steps')
  }

  /**
   * 获取所有步骤
   */
  getSteps(): OnboardingStep[] {
    return this.steps
  }

  /**
   * 获取当前步骤
   */
  getCurrentStep(): OnboardingStep | null {
    return this.steps[this.currentStepIndex] || null
  }

  /**
   * 获取当前步骤索引
   */
  getCurrentStepIndex(): number {
    return this.currentStepIndex
  }

  /**
   * 获取总步骤数
   */
  getTotalSteps(): number {
    return this.steps.length
  }

  /**
   * 是否是第一步
   */
  isFirstStep(): boolean {
    return this.currentStepIndex === 0
  }

  /**
   * 是否是最后一步
   */
  isLastStep(): boolean {
    return this.currentStepIndex === this.steps.length - 1
  }

  /**
   * 下一步
   */
  async next(): Promise<void> {
    const currentStep = this.getCurrentStep()
    if (currentStep) {
      // 记录完成的步骤
      if (!this.progress.completedSteps.includes(currentStep.id)) {
        this.progress.completedSteps.push(currentStep.id)
      }
    }

    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++
      this.progress.currentStepIndex = this.currentStepIndex

      const nextStep = this.getCurrentStep()
      if (nextStep?.beforeShow) {
        await nextStep.beforeShow()
      }

      this.saveProgress()
      this.notifyListeners()

      if (nextStep?.afterShow) {
        await nextStep.afterShow()
      }

      console.log('[OnboardingManager] Next step:', this.currentStepIndex)
    } else {
      // 完成引导
      await this.complete()
    }
  }

  /**
   * 上一步
   */
  async prev(): Promise<void> {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--
      this.progress.currentStepIndex = this.currentStepIndex

      const prevStep = this.getCurrentStep()
      if (prevStep?.beforeShow) {
        await prevStep.beforeShow()
      }

      this.saveProgress()
      this.notifyListeners()

      if (prevStep?.afterShow) {
        await prevStep.afterShow()
      }

      console.log('[OnboardingManager] Previous step:', this.currentStepIndex)
    }
  }

  /**
   * 跳转到指定步骤
   */
  async goToStep(index: number): Promise<void> {
    if (index >= 0 && index < this.steps.length) {
      this.currentStepIndex = index
      this.progress.currentStepIndex = index

      const step = this.getCurrentStep()
      if (step?.beforeShow) {
        await step.beforeShow()
      }

      this.saveProgress()
      this.notifyListeners()

      if (step?.afterShow) {
        await step.afterShow()
      }

      console.log('[OnboardingManager] Go to step:', index)
    }
  }

  /**
   * 跳过引导
   */
  skip(): void {
    this.progress.skipped = true
    this.progress.completed = true
    this.saveProgress()
    this.notifyListeners()
    console.log('[OnboardingManager] Skipped')
  }

  /**
   * 完成引导
   */
  async complete(): Promise<void> {
    this.progress.completed = true
    this.progress.lastViewedAt = Date.now()
    this.saveProgress()
    this.notifyListeners()
    console.log('[OnboardingManager] Completed')
  }

  /**
   * 重新开始引导
   */
  restart(): void {
    this.progress = {
      completed: false,
      currentStepIndex: 0,
      completedSteps: [],
      skipped: false,
    }
    this.currentStepIndex = 0
    this.saveProgress()
    this.notifyListeners()
    console.log('[OnboardingManager] Restarted')
  }

  /**
   * 是否已完成
   */
  isCompleted(): boolean {
    return this.progress.completed
  }

  /**
   * 是否应该显示引导
   */
  shouldShowOnboarding(): boolean {
    return !this.progress.completed && !this.progress.skipped
  }

  /**
   * 获取进度
   */
  getProgress(): OnboardingProgress {
    return { ...this.progress }
  }

  /**
   * 添加监听器
   */
  addListener(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener())
  }

  /**
   * 加载进度
   */
  private loadProgress(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        this.progress = JSON.parse(saved)
        this.currentStepIndex = this.progress.currentStepIndex
        console.log('[OnboardingManager] Loaded progress:', this.progress)
      }
    } catch (error) {
      console.error('[OnboardingManager] Failed to load progress:', error)
    }
  }

  /**
   * 保存进度
   */
  private saveProgress(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress))
    } catch (error) {
      console.error('[OnboardingManager] Failed to save progress:', error)
    }
  }

  /**
   * 检查版本（新版本时重置引导）
   */
  private checkVersion(): void {
    try {
      const savedVersion = localStorage.getItem(VERSION_KEY)
      if (savedVersion !== CURRENT_VERSION) {
        console.log('[OnboardingManager] New version detected, resetting progress')
        this.restart()
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
      }
    } catch (error) {
      console.error('[OnboardingManager] Failed to check version:', error)
    }
  }

  /**
   * 清除所有数据
   */
  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(VERSION_KEY)
    this.restart()
    console.log('[OnboardingManager] Cleared all data')
  }
}

// 单例实例
let onboardingManagerInstance: OnboardingManager | null = null

/**
 * 获取引导管理器实例
 */
export function getOnboardingManager(): OnboardingManager {
  if (!onboardingManagerInstance) {
    onboardingManagerInstance = new OnboardingManager()
  }
  return onboardingManagerInstance
}

export default OnboardingManager
