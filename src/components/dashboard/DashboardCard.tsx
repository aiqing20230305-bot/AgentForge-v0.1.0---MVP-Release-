/**
 * Dashboard Card - 仪表盘卡片容器
 * v2.4.0 Phase 1.1
 */
import React from 'react'
import { motion } from 'framer-motion'

export interface DashboardCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
  loading?: boolean
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  children,
  className = '',
  actions,
  loading = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-cyan-500/50 transition-colors ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-400">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="ml-4">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </motion.div>
  )
}

export default DashboardCard
