/**
 * Batch Operations Dashboard
 * Main dashboard for managing all batch operations
 */

import React, { useState } from 'react'
import {
  Upload,
  Download,
  Edit,
  Trash2,
  CheckSquare,
  Clock,
  BarChart3,
  FileText
} from 'lucide-react'
import { BatchSelectionToolbar } from './BatchSelectionToolbar'
import { BatchImportDialog } from './BatchImportDialog'
import { BatchExportDialog } from './BatchExportDialog'
import { BatchOperationHistory } from './BatchOperationHistory'
import { batchSelectionService } from '../../services/batch/batchSelectionService'
import type { SelectionState } from '../../services/batch/batchSelectionService'

export interface BatchOperationsDashboardProps {
  entityType: 'agent' | 'task' | 'user'
  items: Array<{ id: string; [key: string]: any }>
  onBatchUpdate?: (ids: string[], data: any) => void
  onBatchDelete?: (ids: string[]) => void
  className?: string
}

export const BatchOperationsDashboard: React.FC<BatchOperationsDashboardProps> = ({
  entityType,
  items,
  onBatchUpdate,
  onBatchDelete,
  className = ''
}) => {
  const [selectionState, setSelectionState] = useState<SelectionState>(
    batchSelectionService.createSelectionState(items)
  )
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<'selection' | 'history'>('selection')

  // Update selection state when items change
  React.useEffect(() => {
    setSelectionState(prev => ({ ...prev, items }))
  }, [items])

  const selectedCount = batchSelectionService.getSelectionCount(selectionState)
  const selectedIds = batchSelectionService.getSelectedIds(selectionState)
  const allSelected = batchSelectionService.areAllSelected(selectionState)
  const someSelected = batchSelectionService.areSomeSelected(selectionState)

  const handleSelectAll = () => {
    setSelectionState(batchSelectionService.selectAll(selectionState))
  }

  const handleDeselectAll = () => {
    setSelectionState(batchSelectionService.deselectAll(selectionState))
  }

  const handleInvertSelection = () => {
    setSelectionState(batchSelectionService.invertSelection(selectionState))
  }

  const handleBatchDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCount} ${entityType}s?`)) {
      return
    }

    if (onBatchDelete) {
      onBatchDelete(selectedIds)
      handleDeselectAll()
    }
  }

  const handleExport = () => {
    if (selectedCount === 0) {
      alert('Please select items to export')
      return
    }
    setShowExportDialog(true)
  }

  const batchActions = [
    {
      id: 'activate',
      label: `Activate Selected`,
      icon: CheckSquare,
      onClick: () => {
        if (onBatchUpdate) {
          onBatchUpdate(selectedIds, { status: 'active' })
        }
      }
    },
    {
      id: 'deactivate',
      label: `Deactivate Selected`,
      icon: Clock,
      onClick: () => {
        if (onBatchUpdate) {
          onBatchUpdate(selectedIds, { status: 'inactive' })
        }
      }
    }
  ]

  const stats = {
    totalItems: items.length,
    selectedItems: selectedCount,
    selectionPercentage: items.length > 0 ? Math.round((selectedCount / items.length) * 100) : 0
  }

  return (
    <div className={`batch-operations-dashboard ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Batch Operations</h2>
        <p className="text-gray-400">
          Manage multiple {entityType}s at once with powerful batch operations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <div className="text-sm text-gray-400">Total {entityType}s</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckSquare className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.selectedItems}</div>
              <div className="text-sm text-gray-400">Selected</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.selectionPercentage}%</div>
              <div className="text-sm text-gray-400">Selection Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('selection')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'selection'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Selection & Actions
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'history'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Operation History
        </button>
      </div>

      {/* Content */}
      {activeTab === 'selection' && (
        <div className="space-y-4">
          {/* Selection Toolbar */}
          <BatchSelectionToolbar
            selectedCount={selectedCount}
            totalCount={items.length}
            allSelected={allSelected}
            someSelected={someSelected}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onInvertSelection={handleInvertSelection}
            onExport={handleExport}
            onImport={() => setShowImportDialog(true)}
            onDelete={selectedCount > 0 ? handleBatchDelete : undefined}
            actions={batchActions}
          />

          {/* Quick Actions */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => setShowImportDialog(true)}
                className="flex flex-col items-center gap-2 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Upload className="w-6 h-6 text-blue-400" />
                <span className="text-sm font-semibold">Import</span>
                <span className="text-xs text-gray-400">From CSV/Excel</span>
              </button>

              <button
                onClick={handleExport}
                disabled={selectedCount === 0}
                className="flex flex-col items-center gap-2 p-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Download className="w-6 h-6 text-green-400" />
                <span className="text-sm font-semibold">Export</span>
                <span className="text-xs text-gray-400">To CSV/Excel</span>
              </button>

              <button
                onClick={() => {
                  if (selectedCount > 0 && onBatchUpdate) {
                    const newData = prompt('Enter update data (JSON):')
                    if (newData) {
                      try {
                        const data = JSON.parse(newData)
                        onBatchUpdate(selectedIds, data)
                      } catch (error) {
                        alert('Invalid JSON')
                      }
                    }
                  }
                }}
                disabled={selectedCount === 0}
                className="flex flex-col items-center gap-2 p-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Edit className="w-6 h-6 text-yellow-400" />
                <span className="text-sm font-semibold">Batch Edit</span>
                <span className="text-xs text-gray-400">Update Multiple</span>
              </button>

              <button
                onClick={handleBatchDelete}
                disabled={selectedCount === 0}
                className="flex flex-col items-center gap-2 p-4 bg-gray-700 hover:bg-red-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Trash2 className="w-6 h-6 text-red-400" />
                <span className="text-sm font-semibold">Batch Delete</span>
                <span className="text-xs text-gray-400">Remove Multiple</span>
              </button>
            </div>
          </div>

          {/* Selection Summary */}
          {selectedCount > 0 && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">Selection Summary</h4>
              <p className="text-sm text-gray-300">
                You have selected {selectedCount} {entityType}
                {selectedCount === 1 ? '' : 's'} ({stats.selectionPercentage}% of total).
                Use the toolbar above to perform batch operations.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <BatchOperationHistory autoRefresh={true} refreshInterval={5000} />
      )}

      {/* Dialogs */}
      {showImportDialog && (
        <BatchImportDialog
          entityType={entityType}
          onClose={() => setShowImportDialog(false)}
          onImportComplete={() => {
            setShowImportDialog(false)
            // Refresh items list
          }}
        />
      )}

      {showExportDialog && (
        <BatchExportDialog
          entityType={entityType}
          selectedIds={selectedIds}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  )
}
