/**
 * 统一动画配置
 * 为整个应用提供一致的动画效果
 */

import type { Variants, Transition } from 'framer-motion'

/**
 * 动画持续时间常量
 */
export const DURATION = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8
} as const

/**
 * 缓动函数
 */
export const EASING = {
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: { type: 'spring' as const, stiffness: 300, damping: 30 }
} as const

/**
 * 通用过渡配置
 */
export const transitions = {
  instant: {
    duration: DURATION.instant,
    ease: EASING.easeOut
  },
  fast: {
    duration: DURATION.fast,
    ease: EASING.easeOut
  },
  normal: {
    duration: DURATION.normal,
    ease: EASING.easeInOut
  },
  slow: {
    duration: DURATION.slow,
    ease: EASING.easeOut
  },
  spring: EASING.spring
} as const

/**
 * 淡入淡出动画
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.fast
  },
  exit: {
    opacity: 0,
    transition: transitions.fast
  }
}

/**
 * 滑入滑出动画（从右）
 */
export const slideRightVariants: Variants = {
  hidden: { x: 400, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.normal
  },
  exit: {
    x: 400,
    opacity: 0,
    transition: transitions.fast
  }
}

/**
 * 滑入滑出动画（从左）
 */
export const slideLeftVariants: Variants = {
  hidden: { x: -400, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.normal
  },
  exit: {
    x: -400,
    opacity: 0,
    transition: transitions.fast
  }
}

/**
 * 滑入滑出动画（从上）
 */
export const slideDownVariants: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.normal
  },
  exit: {
    y: -100,
    opacity: 0,
    transition: transitions.fast
  }
}

/**
 * 滑入滑出动画（从下）
 */
export const slideUpVariants: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.normal
  },
  exit: {
    y: 100,
    opacity: 0,
    transition: transitions.fast
  }
}

/**
 * 缩放动画
 */
export const scaleVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: transitions.spring
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: transitions.fast
  }
}

/**
 * 弹跳动画
 */
export const bounceVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25
    }
  }
}

/**
 * 列表项交错动画
 */
export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      ...transitions.fast
    }
  })
}

/**
 * 容器交错动画
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

/**
 * 脉冲动画（用于高亮）
 */
export const pulseVariants: Variants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 2
    }
  }
}

/**
 * 摇晃动画（用于错误提示）
 */
export const shakeVariants: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.4
    }
  }
}

/**
 * Skeleton加载动画
 */
export const skeletonPulse: Transition = {
  repeat: Infinity,
  repeatType: 'reverse',
  duration: 1.2,
  ease: 'easeInOut'
}

/**
 * 页面切换动画
 */
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  enter: {
    opacity: 1,
    x: 0,
    transition: transitions.normal
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transitions.fast
  }
}

/**
 * Modal/Dialog动画
 */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.spring
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: transitions.fast
  }
}

/**
 * Toast通知动画
 */
export const toastVariants: Variants = {
  hidden: {
    x: 400,
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.spring
  },
  exit: {
    x: 400,
    opacity: 0,
    transition: transitions.fast
  }
}

/**
 * 加载动画（旋转）
 */
export const spinVariants: Variants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
}

/**
 * 渐变背景动画
 */
export const gradientShiftVariants: Variants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'linear'
    }
  }
}

/**
 * 卡片悬停动画
 */
export const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
    transition: transitions.fast
  },
  tap: {
    scale: 0.98,
    transition: transitions.instant
  }
}

/**
 * 按钮点击动画
 */
export const buttonTapVariants: Variants = {
  rest: { scale: 1 },
  tap: {
    scale: 0.95,
    transition: transitions.instant
  }
}

/**
 * 数字递增动画配置
 */
export const numberCountTransition: Transition = {
  duration: 0.8,
  ease: 'easeOut'
}

/**
 * Ripple波纹动画
 */
export const rippleVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0.5
  },
  animate: {
    scale: 2,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
}
