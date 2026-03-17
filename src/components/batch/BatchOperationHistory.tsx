/**
 * Batch Operation History Component
 * Display history of all batch operations with filtering
 */

import React, { useState, useEffect } from 'react'
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { batchOperationService, BatchOperation, BatchStatus, BatchOperationType } from '../../services/batch/batchOperationService'
import { BatchProgressTracker } from './BatchProgressTracker'

export interface BatchOperationHistoryProps {
  autoRefresh?: boolean
  refreshInterval?: number
  className?: string
}

export const BatchOperationHistory: React.FC<BatchOperationHistoryProps> = ({
  autoRefresh = true,
  refreshInterval = 5000,
  className = ''
}) => {
  const [operations, setOperations] = useState<BatchOperation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<BatchStatus | 'all'>('all')
  const [selectedType, setSelectedType] = useState<BatchOperationType | 'all'>('all')
  const [selectedOperation, setSelectedOperation] = useState<BatchOperation | null>(null)

  const loadOperations = async () => {
    try {
      const query: any = { limit: 50 }
      if (selectedStatus !== 'all') query.status = selectedStatus
      if (selectedType !== 'all') query.operationType = selectedType

      const result = await batchOperationService.listBatchOperations(query)
      setOperations(result.operations)
    } catch (error) {
      console.error('Error loading batch operations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOperations()

    if (autoRefresh) {
      const interval = setInterval(loadOperations, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [selectedStatus, selectedType, autoRefresh, refreshInterval])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this operation?')) return

    try {
      await batchOperationService.deleteBatchOperation(id)
      loadOperations()
    } catch (error) {
      console.error('Error deleting operation:', error)
      alert('Failed to delete operation')
    }
  }

  const getStatusIcon = (status: BatchStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: BatchStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-500'
      case 'failed':
        return 'text-red-500'
      case 'partial':
        return 'text-yellow-500'
      case 'processing':
        return 'text-blue-500'
      default:
        return 'text-gray-500'
    }
  }

  const formatOperationType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className={`batch-operation-history ${className}`}>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Filters:</span>
        </div>

        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value as BatchStatus | 'all')}
          className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="partial">Partial</option>
        </select>

        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value as BatchOperationType | 'all')}
          className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <optgroup label="Agent Operations">
            <option value="agent_create">Agent Create</option>
            <option value="agent_update">Agent Update</option>
            <option value="agent_delete">Agent Delete</option>
            <option value="agent_export">Agent Export</option>
          </optgroup>
          <optgroup label="Task Operations">
            <option value="task_create">Task Create</option>
            <option value="task_update">Task Update</option>
            <option value="task_delete">Task Delete</option>
            <option value="task_export">Task Export</option>
          </optgroup>
          <optgroup label="User Operations">
            <option value="user_create">User Create</option>
            <option value="user_update">User Update</option>
            <option value="user_delete">User Delete</option>
            <option value="user_export">User Export</option>
          </optgroup>
        </select>

        <button
          onClick={loadOperations}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Operations list */}
      {operations.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No batch operations found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {operations.map(operation => (
            <div
              key={operation.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(operation.status)}
                  <div>
                    <h3 className="font-semibold text-sm">{formatOperationType(operation.operationType)}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(operation.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedOperation(operation)}
                    className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

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
                      className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                      title="Download Results"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(operation.id)}
                    className="p-1.5 hover:bg-red-600/20 rounded transition-colors text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={getStatusColor(operation.status)}>
                    {operation.status.charAt(0).toUpperCase() + operation.status.slice(1)}
                  </span>
                  <span className="text-gray-400">{operation.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
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
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-gray-400 mb-0.5">Total</div>
                  <div className="font-semibold">{operation.totalItems}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-0.5">Success</div>
                  <div className="font-semibold text-green-500">{operation.successfulItems}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-0.5">Failed</div>
                  <div className="font-semibold text-red-500">{operation.failedItems}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-0.5">Duration</div>
                  <div className="font-semibold">{formatDuration(operation.startedAt, operation.completedAt)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedOperation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4">
              <BatchProgressTracker
                operation={selectedOperation}
                onClose={() => setSelectedOperation(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
