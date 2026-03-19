/**
 * Batch Export Dialog Component
 * Dialog for exporting selected items to CSV/Excel
 */

import React, { useState } from 'react'
import { Download, FileText, X, CheckSquare, Square } from 'lucide-react'
import { batchOperationService } from '../../services/batch/batchOperationService'
import { csvParser } from '../../services/batch/csvParser'

export interface BatchExportDialogProps {
  entityType: 'agent' | 'task' | 'user'
  selectedIds: string[]
  onClose: () => void
  availableFields?: Array<{ name: string; label: string; default?: boolean }>
}

export const BatchExportDialog: React.FC<BatchExportDialogProps> = ({
  entityType,
  selectedIds,
  onClose,
  availableFields
}) => {
  const defaultFieldsByType = {
    agent: [
      { name: 'id', label: 'ID', default: true },
      { name: 'name', label: 'Name', default: true },
      { name: 'aiModel', label: 'AI Model', default: true },
      { name: 'status', label: 'Status', default: true },
      { name: 'level', label: 'Level', default: true },
      { name: 'experience', label: 'Experience', default: false },
      { name: 'tasksCompleted', label: 'Tasks Completed', default: true },
      { name: 'tokensUsed', label: 'Tokens Used', default: false },
      { name: 'tags', label: 'Tags', default: false },
      { name: 'createdAt', label: 'Created At', default: true }
    ],
    task: [
      { name: 'id', label: 'ID', default: true },
      { name: 'title', label: 'Title', default: true },
      { name: 'agentId', label: 'Agent ID', default: true },
      { name: 'status', label: 'Status', default: true },
      { name: 'priority', label: 'Priority', default: true },
      { name: 'description', label: 'Description', default: false },
      { name: 'result', label: 'Result', default: false },
      { name: 'errorMessage', label: 'Error Message', default: false },
      { name: 'tokensUsed', label: 'Tokens Used', default: false },
      { name: 'createdAt', label: 'Created At', default: true },
      { name: 'completedAt', label: 'Completed At', default: false }
    ],
    user: [
      { name: 'id', label: 'ID', default: true },
      { name: 'email', label: 'Email', default: true },
      { name: 'username', label: 'Username', default: true },
      { name: 'avatar', label: 'Avatar', default: false },
      { name: 'createdAt', label: 'Created At', default: true }
    ]
  }

  const fields = availableFields || defaultFieldsByType[entityType]
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(fields.filter(f => f.default !== false).map(f => f.name))
  )
  const [format, setFormat] = useState<'csv' | 'json'>('csv')
  const [exporting, setExporting] = useState(false)

  const toggleField = (fieldName: string) => {
    const newSelected = new Set(selectedFields)
    if (newSelected.has(fieldName)) {
      newSelected.delete(fieldName)
    } else {
      newSelected.add(fieldName)
    }
    setSelectedFields(newSelected)
  }

  const toggleAllFields = () => {
    if (selectedFields.size === fields.length) {
      setSelectedFields(new Set())
    } else {
      setSelectedFields(new Set(fields.map(f => f.name)))
    }
  }

  const handleExport = async () => {
    if (selectedFields.size === 0) {
      alert('Please select at least one field to export')
      return
    }

    try {
      setExporting(true)

      const result = await batchOperationService.batchExport({
        entityType,
        ids: selectedIds,
        format,
        fields: Array.from(selectedFields)
      })

      // Download the exported data
      if (format === 'csv') {
        csvParser.downloadCsv(
          result.data,
          `${entityType}_export_${Date.now()}.csv`,
          {
            fields: Array.from(selectedFields),
            includeHeaders: true
          }
        )
      } else {
        // Download as JSON
        const dataStr = JSON.stringify(result.data, null, 2)
        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${entityType}_export_${Date.now()}.json`
        link.click()
        URL.revokeObjectURL(url)
      }

      onClose()
    } catch (error: any) {
      console.error('Error exporting data:', error)
      alert(`Error exporting data: ${error.message}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold">Export {entityType}s</h2>
            <p className="text-sm text-gray-400 mt-1">
              Export {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} to {format.toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Format selection */}
          <div>
            <label className="block text-sm font-semibold mb-3">Export Format</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormat('csv')}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  format === 'csv'
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <FileText className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">CSV</div>
                  <div className="text-xs text-gray-400">Comma-separated values</div>
                </div>
              </button>

              <button
                onClick={() => setFormat('json')}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  format === 'json'
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <FileText className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">JSON</div>
                  <div className="text-xs text-gray-400">JavaScript Object Notation</div>
                </div>
              </button>
            </div>
          </div>

          {/* Field selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold">Select Fields</label>
              <button
                onClick={toggleAllFields}
                className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
              >
                {selectedFields.size === fields.length ? (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4" />
                    <span>Select All</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto p-4 bg-gray-900 rounded-lg">
              {fields.map(field => {
                const isSelected = selectedFields.has(field.name)
                return (
                  <label
                    key={field.name}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-900/30 border border-blue-500/30'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleField(field.name)}
                      className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                    />
                    <span className="text-sm">{field.label}</span>
                  </label>
                )
              })}
            </div>

            <p className="text-xs text-gray-400 mt-2">
              {selectedFields.size} of {fields.length} fields selected
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={exporting}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || selectedFields.size === 0}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold"
          >
            <Download className="w-4 h-4" />
            <span>
              {exporting ? 'Exporting...' : `Export ${selectedIds.length} ${selectedIds.length === 1 ? 'Item' : 'Items'}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
