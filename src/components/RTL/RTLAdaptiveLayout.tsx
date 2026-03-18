/**
 * RTL自适应布局组件 - RTL Adaptive Layout
 *
 * 为核心组件提供RTL布局支持
 */

import { useRTL } from '@/hooks/useRTL';
import { ReactNode } from 'react';

interface RTLAdaptiveLayoutProps {
  children: ReactNode;
  className?: string;
}

export function RTLAdaptiveLayout({ children, className = '' }: RTLAdaptiveLayoutProps) {
  const { isRTL, direction } = useRTL();

  return (
    <div
      className={`rtl-adaptive-layout ${className}`}
      dir={direction}
      data-rtl={isRTL}
    >
      {children}
    </div>
  );
}

// RTL自适应容器 - 自动处理flex方向
export function RTLFlexContainer({
  children,
  className = '',
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
}) {
  const { isRTL } = useRTL();

  const flexDirection = reverse
    ? isRTL
      ? 'flex-row'
      : 'flex-row-reverse'
    : isRTL
      ? 'flex-row-reverse'
      : 'flex-row';

  return (
    <div className={`flex ${flexDirection} ${className}`}>
      {children}
    </div>
  );
}

// RTL自适应网格 - 自动调整网格方向
export function RTLGridContainer({
  children,
  className = '',
  cols = 3,
}: {
  children: ReactNode;
  className?: string;
  cols?: number;
}) {
  const { isRTL } = useRTL();

  return (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      {children}
    </div>
  );
}

// RTL自适应边距组件
export function RTLSpacing({
  children,
  start,
  end,
  className = '',
}: {
  children: ReactNode;
  start?: string;
  end?: string;
  className?: string;
}) {
  const { isRTL } = useRTL();

  const style: React.CSSProperties = {};
  if (start) {
    style[isRTL ? 'marginRight' : 'marginLeft'] = start;
  }
  if (end) {
    style[isRTL ? 'marginLeft' : 'marginRight'] = end;
  }

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

// RTL自适应文本对齐
export function RTLTextAlign({
  children,
  align = 'start',
  className = '',
}: {
  children: ReactNode;
  align?: 'start' | 'end' | 'center';
  className?: string;
}) {
  const { isRTL } = useRTL();

  const textAlign =
    align === 'start'
      ? isRTL
        ? 'right'
        : 'left'
      : align === 'end'
        ? isRTL
          ? 'left'
          : 'right'
        : 'center';

  return (
    <div className={className} style={{ textAlign }}>
      {children}
    </div>
  );
}

// RTL图标翻转 - 某些图标需要在RTL下翻转
export function RTLFlippedIcon({
  icon,
  className = '',
  shouldFlip = true,
}: {
  icon: ReactNode;
  className?: string;
  shouldFlip?: boolean;
}) {
  const { isRTL } = useRTL();

  return (
    <span
      className={`inline-block ${className}`}
      style={{
        transform: isRTL && shouldFlip ? 'scaleX(-1)' : undefined,
      }}
    >
      {icon}
    </span>
  );
}

// RTL浮动 - 自动处理float方向
export function RTLFloat({
  children,
  float = 'start',
  className = '',
}: {
  children: ReactNode;
  float?: 'start' | 'end';
  className?: string;
}) {
  const { isRTL } = useRTL();

  const floatValue =
    float === 'start' ? (isRTL ? 'right' : 'left') : isRTL ? 'left' : 'right';

  return (
    <div className={className} style={{ float: floatValue }}>
      {children}
    </div>
  );
}

// RTL定位 - 自动处理left/right定位
export function RTLPosition({
  children,
  start,
  end,
  top,
  bottom,
  className = '',
}: {
  children: ReactNode;
  start?: string;
  end?: string;
  top?: string;
  bottom?: string;
  className?: string;
}) {
  const { isRTL } = useRTL();

  const style: React.CSSProperties = {
    position: 'absolute',
  };

  if (start) {
    style[isRTL ? 'right' : 'left'] = start;
  }
  if (end) {
    style[isRTL ? 'left' : 'right'] = end;
  }
  if (top) {
    style.top = top;
  }
  if (bottom) {
    style.bottom = bottom;
  }

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

// RTL边框半径 - 自动调整圆角方向
export function RTLBorderRadius({
  children,
  startStart,
  startEnd,
  endStart,
  endEnd,
  className = '',
}: {
  children: ReactNode;
  startStart?: string;
  startEnd?: string;
  endStart?: string;
  endEnd?: string;
  className?: string;
}) {
  const { isRTL } = useRTL();

  const style: React.CSSProperties = {};

  if (startStart) {
    style[isRTL ? 'borderTopRightRadius' : 'borderTopLeftRadius'] = startStart;
  }
  if (startEnd) {
    style[isRTL ? 'borderTopLeftRadius' : 'borderTopRightRadius'] = startEnd;
  }
  if (endStart) {
    style[isRTL ? 'borderBottomRightRadius' : 'borderBottomLeftRadius'] = endStart;
  }
  if (endEnd) {
    style[isRTL ? 'borderBottomLeftRadius' : 'borderBottomRightRadius'] = endEnd;
  }

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

// RTL过渡动画 - 自动调整transform方向
export function RTLTransform({
  children,
  translateX,
  className = '',
}: {
  children: ReactNode;
  translateX?: number;
  className?: string;
}) {
  const { isRTL } = useRTL();

  const transform = translateX
    ? `translateX(${isRTL ? -translateX : translateX}px)`
    : undefined;

  return (
    <div className={className} style={{ transform }}>
      {children}
    </div>
  );
}
