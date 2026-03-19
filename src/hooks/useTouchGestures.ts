/**
 * Touch Gestures Hook
 * 移动端触摸手势支持
 *
 * Features:
 * - Swipe (滑动)
 * - Long Press (长按)
 * - Double Tap (双击)
 * - Pinch Zoom (捏合缩放)
 * - Pan (拖拽)
 */

import { useRef, useEffect, useCallback, useState } from 'react'

// ==================== Types ====================

export interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down'
  distance: number
  velocity: number
}

export interface PinchState {
  scale: number
  distance: number
}

export interface TouchPosition {
  x: number
  y: number
}

export interface UseTouchGesturesOptions {
  onSwipe?: (direction: SwipeDirection) => void
  onLongPress?: (position: TouchPosition) => void
  onDoubleTap?: (position: TouchPosition) => void
  onPinch?: (state: PinchState) => void
  onPan?: (delta: TouchPosition) => void

  // Thresholds
  swipeThreshold?: number // minimum distance for swipe
  longPressDelay?: number // ms for long press
  doubleTapDelay?: number // ms between taps
  pinchThreshold?: number // minimum distance change for pinch

  // Enable/disable gestures
  enableSwipe?: boolean
  enableLongPress?: boolean
  enableDoubleTap?: boolean
  enablePinch?: boolean
  enablePan?: boolean
}

// ==================== Touch Swipe Hook ====================

export function useSwipe(
  onSwipe: (direction: SwipeDirection) => void,
  threshold: number = 50
) {
  const touchStartRef = useRef<TouchPosition | null>(null)
  const touchStartTimeRef = useRef<number>(0)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    touchStartTimeRef.current = Date.now()
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.changedTouches[0]
    const touchEnd = { x: touch.clientX, y: touch.clientY }

    const deltaX = touchEnd.x - touchStartRef.current.x
    const deltaY = touchEnd.y - touchStartRef.current.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (distance < threshold) {
      touchStartRef.current = null
      return
    }

    const duration = Date.now() - touchStartTimeRef.current
    const velocity = distance / duration // px/ms

    // Determine direction
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    let direction: 'left' | 'right' | 'up' | 'down'

    if (absX > absY) {
      direction = deltaX > 0 ? 'right' : 'left'
    } else {
      direction = deltaY > 0 ? 'down' : 'up'
    }

    onSwipe({ direction, distance, velocity })
    touchStartRef.current = null
  }, [onSwipe, threshold])

  return { handleTouchStart, handleTouchEnd }
}

// ==================== Long Press Hook ====================

export function useLongPress(
  onLongPress: (position: TouchPosition) => void,
  delay: number = 500
) {
  const timerRef = useRef<NodeJS.Timeout>()
  const touchPositionRef = useRef<TouchPosition>()

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    touchPositionRef.current = { x: touch.clientX, y: touch.clientY }

    timerRef.current = setTimeout(() => {
      if (touchPositionRef.current) {
        onLongPress(touchPositionRef.current)
      }
    }, delay)
  }, [onLongPress, delay])

  const handleTouchEnd = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    touchPositionRef.current = undefined
  }, [])

  const handleTouchMove = useCallback(() => {
    // Cancel long press if finger moves
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }, [])

  return { handleTouchStart, handleTouchEnd, handleTouchMove }
}

// ==================== Double Tap Hook ====================

export function useDoubleTap(
  onDoubleTap: (position: TouchPosition) => void,
  delay: number = 300
) {
  const lastTapRef = useRef<number>(0)
  const lastPositionRef = useRef<TouchPosition>()

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touch = e.changedTouches[0]
    const position = { x: touch.clientX, y: touch.clientY }
    const now = Date.now()

    if (now - lastTapRef.current < delay && lastPositionRef.current) {
      // Double tap detected
      const dx = position.x - lastPositionRef.current.x
      const dy = position.y - lastPositionRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Check if taps are close enough (within 50px)
      if (distance < 50) {
        onDoubleTap(position)
        lastTapRef.current = 0 // Reset to prevent triple tap
        return
      }
    }

    lastTapRef.current = now
    lastPositionRef.current = position
  }, [onDoubleTap, delay])

  return { handleTouchEnd }
}

// ==================== Pinch Zoom Hook ====================

export function usePinchZoom(
  onPinch: (state: PinchState) => void,
  threshold: number = 10
) {
  const initialDistanceRef = useRef<number>(0)
  const lastScaleRef = useRef<number>(1)

  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistanceRef.current = getDistance(e.touches[0], e.touches[1])
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && initialDistanceRef.current > 0) {
      const currentDistance = getDistance(e.touches[0], e.touches[1])
      const distanceChange = Math.abs(currentDistance - initialDistanceRef.current)

      if (distanceChange < threshold) return

      const scale = currentDistance / initialDistanceRef.current

      if (Math.abs(scale - lastScaleRef.current) > 0.01) {
        onPinch({ scale, distance: currentDistance })
        lastScaleRef.current = scale
      }
    }
  }, [onPinch, threshold])

  const handleTouchEnd = useCallback(() => {
    initialDistanceRef.current = 0
    lastScaleRef.current = 1
  }, [])

  return { handleTouchStart, handleTouchMove, handleTouchEnd }
}

// ==================== Pan/Drag Hook ====================

export function usePan(onPan: (delta: TouchPosition) => void) {
  const lastPositionRef = useRef<TouchPosition | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    lastPositionRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!lastPositionRef.current) return

    const touch = e.touches[0]
    const current = { x: touch.clientX, y: touch.clientY }

    const delta = {
      x: current.x - lastPositionRef.current.x,
      y: current.y - lastPositionRef.current.y
    }

    onPan(delta)
    lastPositionRef.current = current
  }, [onPan])

  const handleTouchEnd = useCallback(() => {
    lastPositionRef.current = null
  }, [])

  return { handleTouchStart, handleTouchMove, handleTouchEnd }
}

// ==================== Combined Touch Gestures Hook ====================

export function useTouchGestures(
  ref: React.RefObject<HTMLElement>,
  options: UseTouchGesturesOptions = {}
) {
  const {
    onSwipe,
    onLongPress,
    onDoubleTap,
    onPinch,
    onPan,
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
    pinchThreshold = 10,
    enableSwipe = true,
    enableLongPress = true,
    enableDoubleTap = true,
    enablePinch = true,
    enablePan = false
  } = options

  const swipe = useSwipe(onSwipe || (() => {}), swipeThreshold)
  const longPress = useLongPress(onLongPress || (() => {}), longPressDelay)
  const doubleTap = useDoubleTap(onDoubleTap || (() => {}), doubleTapDelay)
  const pinch = usePinchZoom(onPinch || (() => {}), pinchThreshold)
  const pan = usePan(onPan || (() => {}))

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      if (enableSwipe && onSwipe) swipe.handleTouchStart(e)
      if (enableLongPress && onLongPress) longPress.handleTouchStart(e)
      if (enablePinch && onPinch) pinch.handleTouchStart(e)
      if (enablePan && onPan) pan.handleTouchStart(e)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (enableLongPress && onLongPress) longPress.handleTouchMove(e)
      if (enablePinch && onPinch) pinch.handleTouchMove(e)
      if (enablePan && onPan) pan.handleTouchMove(e)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (enableSwipe && onSwipe) swipe.handleTouchEnd(e)
      if (enableLongPress && onLongPress) longPress.handleTouchEnd()
      if (enableDoubleTap && onDoubleTap) doubleTap.handleTouchEnd(e)
      if (enablePinch && onPinch) pinch.handleTouchEnd()
      if (enablePan && onPan) pan.handleTouchEnd()
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [
    ref,
    enableSwipe, enableLongPress, enableDoubleTap, enablePinch, enablePan,
    onSwipe, onLongPress, onDoubleTap, onPinch, onPan,
    swipe, longPress, doubleTap, pinch, pan
  ])
}

// ==================== Hook: useScrollDirection (for mobile nav hide/show) ====================

export function useScrollDirection(threshold: number = 10) {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY

      if (Math.abs(scrollY - lastScrollY.current) < threshold) {
        ticking.current = false
        return
      }

      setScrollDirection(scrollY > lastScrollY.current ? 'down' : 'up')
      lastScrollY.current = scrollY > 0 ? scrollY : 0
      ticking.current = false
    }

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection)
        ticking.current = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrollDirection
}
