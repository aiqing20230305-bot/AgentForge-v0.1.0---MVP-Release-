/**
 * 时间旅行调试 - 状态历史管理
 *
 * 功能：
 * - 记录所有状态变更
 * - 时间轴导航
 * - 状态快照管理
 * - Redux DevTools 协议集成
 * - 性能优化（最多1000条记录）
 */

export interface StateSnapshot<T = any> {
  id: string
  timestamp: number
  state: T
  action?: {
    type: string
    payload?: any
  }
  diff?: StateDiff
}

export interface StateDiff {
  added: Record<string, any>
  modified: Record<string, { old: any; new: any }>
  removed: Record<string, any>
}

export interface TimelineState {
  snapshots: StateSnapshot[]
  currentIndex: number
  maxSnapshots: number
  isPaused: boolean
}

export class StateHistory<T = any> {
  private snapshots: StateSnapshot<T>[] = []
  private currentIndex: number = -1
  private maxSnapshots: number = 1000
  private isPaused: boolean = false
  private listeners: Set<(state: TimelineState) => void> = new Set()
  private reduxDevTools: any = null

  constructor(options?: { maxSnapshots?: number; enableDevTools?: boolean }) {
    this.maxSnapshots = options?.maxSnapshots || 1000

    // 初始化 Redux DevTools
    if (options?.enableDevTools && typeof window !== 'undefined') {
      this.initializeDevTools()
    }
  }

  /**
   * 初始化 Redux DevTools
   */
  private initializeDevTools() {
    if (typeof window !== 'undefined' && (window as any).__REDUX_DEVTOOLS_EXTENSION__) {
      this.reduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect({
        name: 'AgentForge State History',
        features: {
          pause: true,
          export: true,
          import: 'custom',
          jump: true,
          skip: true,
          reorder: true,
          dispatch: true,
        },
      })

      // 监听 DevTools 事件
      this.reduxDevTools.subscribe((message: any) => {
        if (message.type === 'DISPATCH') {
          switch (message.payload.type) {
            case 'JUMP_TO_STATE':
            case 'JUMP_TO_ACTION':
              this.jumpToIndex(message.payload.index)
              break
            case 'TOGGLE_ACTION':
              // 切换操作的启用/禁用状态
              break
            case 'IMPORT_STATE':
              this.importSnapshot(message.payload.nextLiftedState)
              break
          }
        }
      })
    }
  }

  /**
   * 记录状态快照
   */
  recordSnapshot(state: T, action?: { type: string; payload?: any }): void {
    if (this.isPaused) return

    // 如果当前不在最新位置，删除后续记录
    if (this.currentIndex < this.snapshots.length - 1) {
      this.snapshots = this.snapshots.slice(0, this.currentIndex + 1)
    }

    const previousSnapshot = this.snapshots[this.snapshots.length - 1]
    const diff = previousSnapshot ? this.calculateDiff(previousSnapshot.state, state) : undefined

    const snapshot: StateSnapshot<T> = {
      id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      state: this.cloneState(state),
      action,
      diff,
    }

    this.snapshots.push(snapshot)
    this.currentIndex = this.snapshots.length - 1

    // 性能优化：限制最大快照数
    if (this.snapshots.length > this.maxSnapshots) {
      const removeCount = this.snapshots.length - this.maxSnapshots
      this.snapshots = this.snapshots.slice(removeCount)
      this.currentIndex -= removeCount
    }

    // 通知监听器
    this.notifyListeners()

    // 同步到 Redux DevTools
    if (this.reduxDevTools && action) {
      this.reduxDevTools.send(action, state)
    }
  }

  /**
   * 跳转到指定索引
   */
  jumpToIndex(index: number): StateSnapshot<T> | null {
    if (index < 0 || index >= this.snapshots.length) {
      return null
    }

    this.currentIndex = index
    this.notifyListeners()

    return this.getCurrentSnapshot()
  }

  /**
   * 跳转到指定时间戳
   */
  jumpToTimestamp(timestamp: number): StateSnapshot<T> | null {
    const index = this.snapshots.findIndex(s => s.timestamp >= timestamp)
    if (index === -1) return null

    return this.jumpToIndex(index)
  }

  /**
   * 后退一步
   */
  stepBackward(): StateSnapshot<T> | null {
    if (this.currentIndex <= 0) return null
    return this.jumpToIndex(this.currentIndex - 1)
  }

  /**
   * 前进一步
   */
  stepForward(): StateSnapshot<T> | null {
    if (this.currentIndex >= this.snapshots.length - 1) return null
    return this.jumpToIndex(this.currentIndex + 1)
  }

  /**
   * 跳转到第一个快照
   */
  jumpToFirst(): StateSnapshot<T> | null {
    if (this.snapshots.length === 0) return null
    return this.jumpToIndex(0)
  }

  /**
   * 跳转到最后一个快照
   */
  jumpToLatest(): StateSnapshot<T> | null {
    if (this.snapshots.length === 0) return null
    return this.jumpToIndex(this.snapshots.length - 1)
  }

  /**
   * 获取当前快照
   */
  getCurrentSnapshot(): StateSnapshot<T> | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.snapshots.length) {
      return null
    }
    return this.snapshots[this.currentIndex]
  }

  /**
   * 获取所有快照
   */
  getAllSnapshots(): StateSnapshot<T>[] {
    return [...this.snapshots]
  }

  /**
   * 获取时间轴状态
   */
  getTimelineState(): TimelineState {
    return {
      snapshots: this.getAllSnapshots(),
      currentIndex: this.currentIndex,
      maxSnapshots: this.maxSnapshots,
      isPaused: this.isPaused,
    }
  }

  /**
   * 比较两个快照
   */
  compareSnapshots(indexA: number, indexB: number): StateDiff | null {
    const snapshotA = this.snapshots[indexA]
    const snapshotB = this.snapshots[indexB]

    if (!snapshotA || !snapshotB) return null

    return this.calculateDiff(snapshotA.state, snapshotB.state)
  }

  /**
   * 暂停/恢复记录
   */
  togglePause(): void {
    this.isPaused = !this.isPaused
    this.notifyListeners()
  }

  /**
   * 清空历史
   */
  clear(): void {
    this.snapshots = []
    this.currentIndex = -1
    this.notifyListeners()

    if (this.reduxDevTools) {
      this.reduxDevTools.init({})
    }
  }

  /**
   * 导出快照
   */
  exportSnapshot(index?: number): string {
    const snapshot = index !== undefined ? this.snapshots[index] : this.getCurrentSnapshot()
    if (!snapshot) throw new Error('No snapshot to export')

    return JSON.stringify(snapshot, null, 2)
  }

  /**
   * 导出所有历史
   */
  exportAll(): string {
    return JSON.stringify(
      {
        snapshots: this.snapshots,
        currentIndex: this.currentIndex,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    )
  }

  /**
   * 导入快照
   */
  importSnapshot(data: string): void {
    try {
      const parsed = JSON.parse(data)

      if (parsed.snapshots && Array.isArray(parsed.snapshots)) {
        // 导入完整历史
        this.snapshots = parsed.snapshots
        this.currentIndex = parsed.currentIndex ?? this.snapshots.length - 1
      } else if (parsed.id && parsed.timestamp && parsed.state) {
        // 导入单个快照
        this.snapshots.push(parsed)
        this.currentIndex = this.snapshots.length - 1
      } else {
        throw new Error('Invalid snapshot format')
      }

      this.notifyListeners()
    } catch (error) {
      throw new Error(`Failed to import snapshot: ${error}`)
    }
  }

  /**
   * 订阅状态变化
   */
  subscribe(listener: (state: TimelineState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    const state = this.getTimelineState()
    this.listeners.forEach(listener => listener(state))
  }

  /**
   * 深度克隆状态
   */
  private cloneState(state: T): T {
    try {
      return JSON.parse(JSON.stringify(state))
    } catch (error) {
      console.warn('Failed to clone state, returning reference', error)
      return state
    }
  }

  /**
   * 计算状态差异
   */
  private calculateDiff(oldState: any, newState: any): StateDiff {
    const diff: StateDiff = {
      added: {},
      modified: {},
      removed: {},
    }

    // 检查新增和修改
    for (const key in newState) {
      if (!(key in oldState)) {
        diff.added[key] = newState[key]
      } else if (JSON.stringify(oldState[key]) !== JSON.stringify(newState[key])) {
        diff.modified[key] = {
          old: oldState[key],
          new: newState[key],
        }
      }
    }

    // 检查删除
    for (const key in oldState) {
      if (!(key in newState)) {
        diff.removed[key] = oldState[key]
      }
    }

    return diff
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.listeners.clear()
    if (this.reduxDevTools) {
      this.reduxDevTools.disconnect()
      this.reduxDevTools = null
    }
  }
}

/**
 * 创建状态历史实例
 */
export function createStateHistory<T = any>(options?: {
  maxSnapshots?: number
  enableDevTools?: boolean
}): StateHistory<T> {
  return new StateHistory<T>(options)
}
