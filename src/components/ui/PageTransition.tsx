/**
 * Page Transition Wrapper
 * 为页面切换提供统一的过渡动画
 */

import { motion, AnimatePresence } from 'framer-motion'
import { pageTransitionVariants, fadeVariants } from '../../utils/animations'
import type { ReactNode } from 'react'

interface PageTransitionProps {
  /** 子元素 */
  children: ReactNode
  /** 唯一key用于AnimatePresence */
  pageKey?: string
  /** 动画变体（默认使用pageTransitionVariants） */
  variant?: 'page' | 'fade' | 'none'
  /** 自定义类名 */
  className?: string
}

/**
 * PageTransition - 页面切换动画包装器
 *
 * 用法：
 * ```tsx
 * <PageTransition pageKey={currentRoute}>
 *   <YourPageComponent />
 * </PageTransition>
 * ```
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  pageKey,
  variant = 'page',
  className = ''
}) => {
  const variants = variant === 'page' ? pageTransitionVariants : variant === 'fade' ? fadeVariants : undefined

  if (variant === 'none') {
    return <div className={className}>{children}</div>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * FadeIn - 简单的淡入动画包装器
 */
export const FadeIn: React.FC<{
  children: ReactNode
  delay?: number
  className?: string
}> = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * StaggerContainer - 交错动画容器
 */
export const StaggerContainer: React.FC<{
  children: ReactNode
  staggerDelay?: number
  className?: string
}> = ({ children, staggerDelay = 0.05, className = '' }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * StaggerItem - 交错动画子项
 * 需要配合 StaggerContainer 使用
 */
export const StaggerItem: React.FC<{
  children: ReactNode
  className?: string
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.3 }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
