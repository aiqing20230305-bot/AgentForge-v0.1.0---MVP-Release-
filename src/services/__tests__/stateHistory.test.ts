/**
 * StateHistory 单元测试
 */

import { StateHistory, StateSnapshot } from '../stateHistory'

describe('StateHistory', () => {
  let history: StateHistory<any>

  beforeEach(() => {
    history = new StateHistory({ maxSnapshots: 10 })
  })

  afterEach(() => {
    history.destroy()
  })

  describe('recordSnapshot', () => {
    it('should record a snapshot', () => {
      const state = { count: 0 }
      history.recordSnapshot(state, { type: 'INIT' })

      const snapshot = history.getCurrentSnapshot()
      expect(snapshot).toBeTruthy()
      expect(snapshot!.state).toEqual(state)
      expect(snapshot!.action?.type).toBe('INIT')
    })

    it('should record multiple snapshots', () => {
      history.recordSnapshot({ count: 0 }, { type: 'INIT' })
      history.recordSnapshot({ count: 1 }, { type: 'INCREMENT' })
      history.recordSnapshot({ count: 2 }, { type: 'INCREMENT' })

      const snapshots = history.getAllSnapshots()
      expect(snapshots).toHaveLength(3)
      expect(snapshots[2].state).toEqual({ count: 2 })
    })

    it('should not record when paused', () => {
      history.recordSnapshot({ count: 0 }, { type: 'INIT' })
      history.togglePause()
      history.recordSnapshot({ count: 1 }, { type: 'INCREMENT' })

      const snapshots = history.getAllSnapshots()
      expect(snapshots).toHaveLength(1)
      expect(snapshots[0].state).toEqual({ count: 0 })
    })

    it('should limit snapshots to maxSnapshots', () => {
      for (let i = 0; i < 15; i++) {
        history.recordSnapshot({ count: i }, { type: 'INCREMENT' })
      }

      const snapshots = history.getAllSnapshots()
      expect(snapshots).toHaveLength(10)
      expect(snapshots[0].state).toEqual({ count: 5 })
    })

    it('should calculate diff between snapshots', () => {
      history.recordSnapshot({ count: 0, name: 'test' })
      history.recordSnapshot({ count: 1, name: 'test' })

      const snapshot = history.getCurrentSnapshot()
      expect(snapshot!.diff).toBeTruthy()
      expect(snapshot!.diff!.modified).toHaveProperty('count')
      expect(snapshot!.diff!.modified.count).toEqual({ old: 0, new: 1 })
    })
  })

  describe('navigation', () => {
    beforeEach(() => {
      for (let i = 0; i < 5; i++) {
        history.recordSnapshot({ count: i }, { type: 'INCREMENT' })
      }
    })

    it('should jump to index', () => {
      const snapshot = history.jumpToIndex(2)
      expect(snapshot!.state).toEqual({ count: 2 })
      expect(history.getTimelineState().currentIndex).toBe(2)
    })

    it('should return null for invalid index', () => {
      expect(history.jumpToIndex(-1)).toBeNull()
      expect(history.jumpToIndex(10)).toBeNull()
    })

    it('should step backward', () => {
      history.jumpToLatest()
      const snapshot = history.stepBackward()
      expect(snapshot!.state).toEqual({ count: 3 })
    })

    it('should step forward', () => {
      history.jumpToIndex(2)
      const snapshot = history.stepForward()
      expect(snapshot!.state).toEqual({ count: 3 })
    })

    it('should jump to first', () => {
      history.jumpToLatest()
      const snapshot = history.jumpToFirst()
      expect(snapshot!.state).toEqual({ count: 0 })
    })

    it('should jump to latest', () => {
      history.jumpToFirst()
      const snapshot = history.jumpToLatest()
      expect(snapshot!.state).toEqual({ count: 4 })
    })

    it('should jump to timestamp', () => {
      const snapshots = history.getAllSnapshots()
      const targetTimestamp = snapshots[2].timestamp
      const snapshot = history.jumpToTimestamp(targetTimestamp)
      expect(snapshot!.state).toEqual({ count: 2 })
    })
  })

  describe('comparison', () => {
    beforeEach(() => {
      history.recordSnapshot({ count: 0, name: 'a' })
      history.recordSnapshot({ count: 1, name: 'b' })
      history.recordSnapshot({ count: 2 })
    })

    it('should compare two snapshots', () => {
      const diff = history.compareSnapshots(0, 1)
      expect(diff).toBeTruthy()
      expect(diff!.modified.count).toEqual({ old: 0, new: 1 })
      expect(diff!.modified.name).toEqual({ old: 'a', new: 'b' })
    })

    it('should detect removed properties', () => {
      const diff = history.compareSnapshots(1, 2)
      expect(diff!.removed).toHaveProperty('name')
    })

    it('should return null for invalid indices', () => {
      expect(history.compareSnapshots(-1, 0)).toBeNull()
      expect(history.compareSnapshots(0, 10)).toBeNull()
    })
  })

  describe('export/import', () => {
    beforeEach(() => {
      history.recordSnapshot({ count: 0 }, { type: 'INIT' })
      history.recordSnapshot({ count: 1 }, { type: 'INCREMENT' })
    })

    it('should export current snapshot', () => {
      const exported = history.exportSnapshot()
      const parsed = JSON.parse(exported)
      expect(parsed.state).toEqual({ count: 1 })
      expect(parsed.action.type).toBe('INCREMENT')
    })

    it('should export all history', () => {
      const exported = history.exportAll()
      const parsed = JSON.parse(exported)
      expect(parsed.snapshots).toHaveLength(2)
      expect(parsed.currentIndex).toBe(1)
    })

    it('should import snapshot', () => {
      const newHistory = new StateHistory()
      const exported = history.exportAll()
      newHistory.importSnapshot(exported)

      const snapshots = newHistory.getAllSnapshots()
      expect(snapshots).toHaveLength(2)
      expect(snapshots[1].state).toEqual({ count: 1 })

      newHistory.destroy()
    })

    it('should throw error for invalid import data', () => {
      expect(() => history.importSnapshot('invalid json')).toThrow()
      expect(() => history.importSnapshot('{}')).toThrow()
    })
  })

  describe('subscription', () => {
    it('should notify listeners on state change', () => {
      const listener = jest.fn()
      history.subscribe(listener)

      history.recordSnapshot({ count: 0 })
      expect(listener).toHaveBeenCalledTimes(1)

      history.recordSnapshot({ count: 1 })
      expect(listener).toHaveBeenCalledTimes(2)
    })

    it('should unsubscribe', () => {
      const listener = jest.fn()
      const unsubscribe = history.subscribe(listener)

      history.recordSnapshot({ count: 0 })
      expect(listener).toHaveBeenCalledTimes(1)

      unsubscribe()
      history.recordSnapshot({ count: 1 })
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should pass timeline state to listeners', () => {
      const listener = jest.fn()
      history.subscribe(listener)

      history.recordSnapshot({ count: 0 })
      const timelineState = listener.mock.calls[0][0]
      expect(timelineState.snapshots).toHaveLength(1)
      expect(timelineState.currentIndex).toBe(0)
      expect(timelineState.isPaused).toBe(false)
    })
  })

  describe('control', () => {
    it('should toggle pause', () => {
      expect(history.getTimelineState().isPaused).toBe(false)
      history.togglePause()
      expect(history.getTimelineState().isPaused).toBe(true)
      history.togglePause()
      expect(history.getTimelineState().isPaused).toBe(false)
    })

    it('should clear history', () => {
      history.recordSnapshot({ count: 0 })
      history.recordSnapshot({ count: 1 })
      expect(history.getAllSnapshots()).toHaveLength(2)

      history.clear()
      expect(history.getAllSnapshots()).toHaveLength(0)
      expect(history.getCurrentSnapshot()).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle empty history', () => {
      expect(history.getCurrentSnapshot()).toBeNull()
      expect(history.getAllSnapshots()).toHaveLength(0)
      expect(history.stepBackward()).toBeNull()
      expect(history.stepForward()).toBeNull()
    })

    it('should handle circular references gracefully', () => {
      const state: any = { count: 0 }
      state.self = state // circular reference

      // Should not throw, but might log warning
      history.recordSnapshot(state)
      const snapshot = history.getCurrentSnapshot()
      expect(snapshot).toBeTruthy()
    })

    it('should clone state deeply', () => {
      const originalState = { nested: { count: 0 } }
      history.recordSnapshot(originalState)

      // Mutate original
      originalState.nested.count = 999

      const snapshot = history.getCurrentSnapshot()
      expect(snapshot!.state.nested.count).toBe(0)
    })

    it('should remove future snapshots when recording after time travel', () => {
      history.recordSnapshot({ count: 0 })
      history.recordSnapshot({ count: 1 })
      history.recordSnapshot({ count: 2 })

      history.jumpToIndex(1)
      history.recordSnapshot({ count: 99 })

      const snapshots = history.getAllSnapshots()
      expect(snapshots).toHaveLength(3)
      expect(snapshots[2].state).toEqual({ count: 99 })
    })
  })
})
