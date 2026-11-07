import type { CSSProperties, ReactNode } from 'react'
import { useRTL } from '@/hooks/useRTL'

interface ClassNameProps {
  className?: string
  children?: ReactNode
}

function joinClass(className?: string) {
  return className || ''
}

export function RTLAdaptiveLayout({ className, children }: ClassNameProps) {
  const { direction } = useRTL()
  return (
    <div dir={direction} className={joinClass(className)}>
      {children}
    </div>
  )
}

export function RTLFlexContainer({ className, children }: ClassNameProps) {
  const { isRTL } = useRTL()
  return (
    <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} ${joinClass(className)}`}>
      {children}
    </div>
  )
}

export function RTLGridContainer({
  cols = 1,
  className,
  children,
}: ClassNameProps & { cols?: number }) {
  const { direction } = useRTL()
  return (
    <div
      dir={direction}
      className={`grid ${joinClass(className)}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  )
}

export function RTLSpacing({
  start,
  end,
  className,
  children,
}: ClassNameProps & { start?: string; end?: string }) {
  const style: CSSProperties = {}
  if (start) style.marginInlineStart = start
  if (end) style.marginInlineEnd = end
  return (
    <div className={joinClass(className)} style={style}>
      {children}
    </div>
  )
}

export function RTLTextAlign({
  align,
  className,
  children,
}: ClassNameProps & { align: 'start' | 'end' | 'center' }) {
  const textAlign = align === 'center' ? 'center' : align
  return (
    <div className={joinClass(className)} style={{ textAlign }}>
      {children}
    </div>
  )
}

export function RTLFlippedIcon({
  icon,
  className,
  shouldFlip = false,
}: {
  icon: string
  className?: string
  shouldFlip?: boolean
}) {
  const { isRTL } = useRTL()
  const flip = shouldFlip && isRTL
  return (
    <span className={joinClass(className)} style={flip ? { display: 'inline-block', transform: 'scaleX(-1)' } : undefined}>
      {icon}
    </span>
  )
}

export function RTLFloat({
  float,
  className,
  children,
}: ClassNameProps & { float: 'start' | 'end' }) {
  return (
    <div className={joinClass(className)} style={{ float: float === 'start' ? 'inline-start' : 'inline-end' } as CSSProperties}>
      {children}
    </div>
  )
}

export function RTLPosition({
  start,
  end,
  top,
  bottom,
  className,
  children,
}: ClassNameProps & { start?: string; end?: string; top?: string; bottom?: string }) {
  const style: CSSProperties = { position: 'absolute' }
  if (top) style.top = top
  if (bottom) style.bottom = bottom
  if (start) style.insetInlineStart = start
  if (end) style.insetInlineEnd = end
  return (
    <div className={joinClass(className)} style={style}>
      {children}
    </div>
  )
}

export function RTLBorderRadius({
  startStart,
  startEnd,
  endStart,
  endEnd,
  className,
  children,
}: ClassNameProps & {
  startStart?: string
  startEnd?: string
  endStart?: string
  endEnd?: string
}) {
  return (
    <div
      className={joinClass(className)}
      style={{
        borderStartStartRadius: startStart,
        borderStartEndRadius: startEnd,
        borderEndStartRadius: endStart,
        borderEndEndRadius: endEnd,
      }}
    >
      {children}
    </div>
  )
}

export function RTLTransform({
  translateX = 0,
  className,
  children,
}: ClassNameProps & { translateX?: number }) {
  const { isRTL } = useRTL()
  const x = isRTL ? -translateX : translateX
  return (
    <div className={joinClass(className)} style={{ transform: `translateX(${x}px)` }}>
      {children}
    </div>
  )
}
