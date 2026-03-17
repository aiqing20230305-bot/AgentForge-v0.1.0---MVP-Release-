/**
 * Batch Progress Tracker Component
 * Real-time progress tracking for batch operations
 */

import React, { useEffect, useState } from 'react'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react'
import type { BatchOperation } from '../../services/batch/batchOperationService'
import { batchOperationService } from '../../services/batch/batchOperationService'

export interface BatchProgressTrackerProps {
  operation: BatchOperation
  onComplete?: (operation: BatchOperation) => void
  onCancel?: (operation: BatchOperation) => void
  onClose?: () => void
  autoClose?: boolean
  autoCloseDelay?: number
  className?: string
}

export const BatchProgressTracker: React.FC<BatchProgressTrackerProps> = ({
  operation: initialOperation,
  onComplete,
  onCancel,
  onClose,
  autoClose = false,
  autoCloseDelay = 3000,
  className = ''
}) => {
  const [operation, setOperation] = useState(initialOperation)
  const [expanded, setExpanded] = useState(true)
  const [showErrors, setShowErrors] = useState(false)

  useEffect(() => {
    if (operation.status === 'pending' || operation.status === 'processing') {
      const pollInterval = setInterval(async () => {
        try {
          const updated = await batchOperationService.getBatchOperation(operation.id)
          setOperation(updated)

          if (updated.status === 'completed' || updated.status === 'failed' || updated.status === 'partial') {
            clearInterval(pollInterval)
            if (onComplete) {
              onComplete(updated)
            }

            if (autoClose && updated.status === 'completed') {
              setTimeout(() => {
                if (onClose) onClose()
              }, autoCloseDelay)
            }
          }
        } catch (error) {
          console.error('Error polling batch operation:', error)
        }
      }, 1000)

      return () => clearInterval(pollInterval)
    }
  }, [operation.id, operation.status, onComplete, onClose, autoClose, autoCloseDelay])

  const getStatusIcon = () => {
    switch (operation.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <Loader2 className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (operation.status) {
      case 'completed':
        return 'Completed'
      case 'failed':
        return 'Failed'
      case 'partial':
        return 'Partially Completed'
      case 'processing':
        return 'Processing'
      default:
        return 'Pending'
    }
  }

  const getStatusColor = () => {
    switch (operation.status) {
      case 'completed':
        return 'border-green-500'
      case 'failed':
        return 'border-red-500'
      case 'partial':
        return 'border-yellow-500'
      case 'processing':
        return 'border-blue-500'
      default:
        return 'border-gray-500'
    }
  }

  const handleCancel = async () => {
    try {
      const cancelled = await batchOperationService.cancelBatchOperation(operation.id)
      setOperation(cancelled)
      if (onCancel) {
        onCancel(cancelled)
      }
    } catch (error) {
      console.error('Error cancelling batch operation:', error)
    }
  }

  const formatOperationType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatDuration = (start?: string, end?: string) => {
    if (!start) return 'N/A'
    const startTime = new Date(start).getTime()
    const endTime = end ? new Date(end).getTime() : Date.now()
    const duration = Math.round((endTime - startTime) / 1000)

    if (duration < 60) return `${duration}s`
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`
  }

  return (
    <div className={`batch-progress-tracker bg-gray-800 border-2 ${getStatusColor()} rounded-lg shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3 flex-1">
          {getStatusIcon()}
          <div className="flex-1">
            <h3 className="text-sm font-semibold">{formatOperationType(operation.operationType)}</h3>
            <p className="text-xs text-gray-400">{getStatusText()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="p-4 space-y-3">
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Progress</span>
              <span className="font-semibold">{operation.progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  operation.status === 'completed'
                    ? 'bg-green-500'
                    : operation.status === 'failed'
                    ? 'bg-red-500'
                    : operation.status === 'partial'
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${operation.progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-gray-700 rounded p-2">
              <div className="text-gray-400 mb-1">Total</div>
              <div className="text-lg font-bold">{operation.totalItems}</div>
            </div>
            <div className="bg-green-900/30 border border-green-500/30 rounded p-2">
              <div className="text-gray-400 mb-1">Success</div>
              <div className="text-lg font-bold text-green-500">{operation.successfulItems}</div>
            </div>
            <div className="bg-red-900/30 border border-red-500/30 rounded p-2">
              <div className="text-gray-400 mb-1">Failed</div>
              <div className="text-lg font-bold text-red-500">{operation.failedItems}</div>
            </div>
          </div>

          {/* Timing */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Duration: {formatDuration(operation.startedAt, operation.completedAt)}</span>
            {operation.processedItems > 0 && operation.totalItems > 0 && (
              <span>
                {operation.processedItems} / {operation.totalItems} items
              </span>
            )}
          </div>

          {/* Errors */}
          {operation.errors.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={() => setShowErrors(!showErrors)}
                className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{operation.errors.length} error(s)</span>
                {showErrors ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showErrors && (
                <div className="max-h-40 overflow-y-auto bg-gray-900 rounded p-2 space-y-1">
                  {operation.errors.map((error, index) => (
                    <div key={index} className="text-xs text-red-400">
                      <span className="font-semibold">{error.itemId}:</span> {error.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Validation errors */}
          {operation.validationErrors && operation.validationErrors.length > 0 && (
            <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
              <div className="flex items-center gap-2 text-xs text-red-400 mb-2">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{operation.validationErrors.length} validation error(s)</span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {operation.validationErrors.map((error, index) => (
                  <div key={index} className="text-xs text-red-300">
                    Row {error.row}, {error.field}: {error.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
            {(operation.status === 'pending' || operation.status === 'processing') && onCancel && (
              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}

            {operation.status === 'completed' && operation.results.length > 0 && (
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(operation.results, null, 2)
                  const blob = new Blob([dataStr], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `batch_results_${operation.id}.json`
                  link.click()
                  URL.revokeObjectURL(url)
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Results</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
