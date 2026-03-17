/**
 * Custom React Hooks Library
 * 统一导出所有自定义 Hook
 */

// Animation Hooks
export {
  useAnimatedCounter,
  useControllableCounter,
  easingFunctions
} from './useAnimatedCounter'

// Storage Hooks
export {
  useLocalStorage,
  useLocalStorageWithExpiry
} from './useLocalStorage'

// Performance Hooks
export {
  useDebounce,
  useDebouncedCallback,
  useDebounceWithImmediate
} from './useDebounce'

export {
  useThrottle,
  useThrottledCallback,
  useRAFThrottle,
  useThrottledCallbackWithOptions
} from './useThrottle'

// Window & Viewport Hooks
export {
  useWindowSize,
  useWindowDimensions,
  useWindowWidth,
  useWindowHeight,
  useWindowOrientation,
  useWindowScroll,
  useViewport,
  useScrollDirection,
  useIsAtTop,
  useIsAtBottom
} from './useWindowSize'

export type { WindowSize, WindowScroll, Viewport } from './useWindowSize'

// Event Listener Hooks
export {
  useEventListener,
  useMultipleEventListener,
  useConditionalEventListener,
  useKeyPress,
  useHover,
  useHoverState,
  useFocus,
  useLongPress,
  useDoubleClick
} from './useEventListener'

export type { KeyPressOptions } from './useEventListener'

// Hotkey Hooks
export {
  useHotkey,
  useHotkeys,
  useGetAllHotkeys,
  useCheckHotkeyConflict,
  getPlatformModifierKey,
  formatHotkey,
  hotkeyManager
} from './useHotkeys'

export type { HotkeyConfig, HotkeyHandler } from './useHotkeys'

// Timer Hooks
export {
  useTimeout,
  useControllableTimeout,
  useInterval,
  useControllableInterval,
  useCountdown,
  useStopwatch,
  useDeferredValue,
  useRAFLoop,
  useIdleCallback
} from './useTimeout'

// Clipboard Hooks
export {
  useCopyToClipboard,
  useCopy,
  useCopyWithCallback,
  useCopyElement,
  usePasteFromClipboard,
  useClipboardMonitor,
  copyToClipboard
} from './useCopyToClipboard'

export type { CopyResult } from './useCopyToClipboard'

// UI/UX Hooks
export {
  useMediaQuery,
  useBreakpoint,
  useScreenSize,
  useMediaQueries,
  useResponsiveValue,
  BREAKPOINTS
} from './useMediaQuery'

export {
  useIntersectionObserver,
  useLazyLoad,
  useInfiniteScroll,
  useViewportAnimation,
  useVisibilityTracking,
  useMultipleIntersectionObserver
} from './useIntersectionObserver'

export type {
  UseIntersectionObserverOptions,
  VisibilityStats
} from './useIntersectionObserver'

export {
  useClickOutside,
  useMultipleClickOutside,
  useClickOutsideWithEscape,
  useClickOutsideWithDelay,
  useClickOutsideWithCondition,
  useClickOutsideWithFocus
} from './useClickOutside'

// State Management Hooks
export {
  usePrevious,
  usePreviousWithInitial,
  useHistory,
  useCompare,
  useDeepCompare,
  useChangeCount,
  useFirstChange,
  useDebouncedPrevious,
  useValueDirection,
  useValueTransition,
  useStableValue
} from './usePrevious'

export {
  useToggle,
  useToggleWithCallback,
  useAutoResetToggle,
  useMultiToggle,
  useToggleWithLoading,
  useConditionalToggle,
  useCountedToggle,
  useControlledToggle,
  useDelayedToggle,
  useGroupedToggle
} from './useToggle'

// Touch Gesture Hooks
export {
  useSwipe,
  useLongPress as useTouchLongPress,
  useDoubleTap,
  usePinchZoom,
  usePan,
  useTouchGestures,
  useScrollDirection as useTouchScrollDirection
} from './useTouchGestures'

export type {
  SwipeDirection,
  PinchState,
  TouchPosition,
  UseTouchGesturesOptions
} from './useTouchGestures'
