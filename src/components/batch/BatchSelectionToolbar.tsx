/**
 * Batch Selection Toolbar Component
 * Toolbar for batch selection and operations
 */

import React, { useState } from 'react'
import {
  CheckSquare,
  Square,
  MinusSquare,
  Download,
  Upload,
  Trash2,
  Edit,
  Play,
  Power,
  PowerOff,
  RefreshCw,
  Filter,
  X
} from 'lucide-react'

export interface BatchAction {
  id: string
  label: string
  icon: React.ComponentType<any>
  onClick: () => void
  variant?: 'default' | 'danger' | 'success'
  disabled?: boolean
}

export interface BatchSelectionToolbarProps {
  selectedCount: number
  totalCount: number
  allSelected: boolean
  someSelected: boolean
  onSelectAll: () => void
  onDeselectAll: () => void
  onInvertSelection: () => void
  actions?: BatchAction[]
  onExport?: () => void
  onImport?: () => void
  onDelete?: () => void
  className?: string
}

export const BatchSelectionToolbar: React.FC<BatchSelectionToolbarProps> = ({
  selectedCount,
  totalCount,
  allSelected,
  someSelected,
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
  actions = [],
  onExport,
  onImport,
  onDelete,
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false)

  const getCheckboxIcon = () => {
    if (allSelected) return CheckSquare
    if (someSelected) return MinusSquare
    return Square
  }

  const CheckboxIcon = getCheckboxIcon()

  const handleCheckboxClick = () => {
    if (allSelected || someSelected) {
      onDeselectAll()
    } else {
      onSelectAll()
    }
  }

  const getActionVariantClass = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white'
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white'
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white'
    }
  }

  return (
    <div className={`batch-selection-toolbar bg-gray-800 border border-gray-700 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Selection controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCheckboxClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title={allSelected ? 'Deselect All' : 'Select All'}
          >
            <CheckboxIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {selectedCount} / {totalCount}
            </span>
          </button>

          {someSelected && (
            <>
              <button
                onClick={onInvertSelection}
                className="flex items-center gap-1 px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                title="Invert Selection"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Invert</span>
              </button>

              <button
                onClick={onDeselectAll}
                className="flex items-center gap-1 px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                title="Clear Selection"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>

        {/* Action buttons */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            {/* Quick actions */}
            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm"
                title="Export Selected"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            )}

            {onImport && (
              <button
                onClick={onImport}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                title="Import"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
                title="Delete Selected"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}

            {/* Custom actions dropdown */}
            {actions.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                  title="More Actions"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Actions</span>
                </button>

                {showActions && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowActions(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 py-1">
                      {actions.map(action => {
                        const ActionIcon = action.icon
                        return (
                          <button
                            key={action.id}
                            onClick={() => {
                              action.onClick()
                              setShowActions(false)
                            }}
                            disabled={action.disabled}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                              action.disabled
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-gray-700'
                            }`}
                          >
                            <ActionIcon className="w-4 h-4" />
                            <span>{action.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selection info */}
      {selectedCount > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            {selectedCount === 1
              ? '1 item selected'
              : `${selectedCount} items selected`}
            {allSelected && ' (all items)'}
          </p>
        </div>
      )}
    </div>
  )
}
