/**
 * Zustand 中间件 - 自动集成时间旅行调试
 *
 * 使用方法：
 * ```ts
 * import { createStateHistory } from './services/stateHistory'
 * import { stateHistoryMiddleware } from './services/stateHistoryMiddleware'
 *
 * const history = createStateHistory({ enableDevTools: true })
 *
 * const useStore = create(
 *   stateHistoryMiddleware(history)(
 *     (set, get) => ({
 *       // your store
 *     })
 *   )
 * )
 * ```
 */

import { StateCreator, StoreMutatorIdentifier } from 'zustand'
import { StateHistory } from './stateHistory'

type StateHistoryMiddleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  stateHistory: StateHistory<T>
) => (
  f: StateCreator<T, Mps, Mcs>
) => StateCreator<T, Mps, Mcs>

type StateHistoryMiddlewareImpl = <T>(
  stateHistory: StateHistory<T>
) => (
  f: StateCreator<T, [], []>
) => StateCreator<T, [], []>

const stateHistoryMiddlewareImpl: StateHistoryMiddlewareImpl =
  stateHistory => config => (set, get, api) => {
    // 记录初始状态
    const initialState = config(set, get, api)
    stateHistory.recordSnapshot(initialState, {
      type: '@@INIT',
    })

    // 包装 set 函数
    const wrappedSet: typeof set = (...args) => {
      const prevState = get()

      // 调用原始 set
      set(...args)

      const nextState = get()

      // 提取 action 信息
      let action: { type: string; payload?: any } | undefined
      const firstArg = args[0]

      if (typeof firstArg === 'function') {
        // set(state => ({ ...state, ... }))
        action = {
          type: '@@UPDATE',
          payload: firstArg,
        }
      } else if (typeof firstArg === 'object') {
        // set({ ... })
        action = {
          type: '@@PATCH',
          payload: firstArg,
        }
      }

      // 记录状态变化
      if (JSON.stringify(prevState) !== JSON.stringify(nextState)) {
        stateHistory.recordSnapshot(nextState, action)
      }
    }

    return config(wrappedSet, get, api)
  }

export const stateHistoryMiddleware =
  stateHistoryMiddlewareImpl as unknown as StateHistoryMiddleware

/**
 * 创建带时间旅行功能的 store
 *
 * @example
 * ```ts
 * const { store, history } = createStoreWithHistory(
 *   (set, get) => ({
 *     count: 0,
 *     increment: () => set(state => ({ count: state.count + 1 })),
 *   }),
 *   { enableDevTools: true }
 * )
 * ```
 */
export function createStoreWithHistory<T>(
  config: StateCreator<T, [], []>,
  options?: { maxSnapshots?: number; enableDevTools?: boolean }
) {
  const history = new StateHistory<T>(options)
  const storeCreator = stateHistoryMiddleware(history)(config)

  return {
    storeCreator,
    history,
  }
}
