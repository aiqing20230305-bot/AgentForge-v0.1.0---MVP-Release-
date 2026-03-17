/**
 * Batch Import Dialog Component
 * Dialog for importing data from CSV/Excel files
 */

import React, { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, X, Download } from 'lucide-react'
import { csvParser } from '../../services/batch/csvParser'
import { batchOperationService } from '../../services/batch/batchOperationService'
import { BatchProgressTracker } from './BatchProgressTracker'
import type { BatchOperation } from '../../services/batch/batchOperationService'

export interface BatchImportDialogProps {
  entityType: 'agent' | 'task' | 'user'
  onClose: () => void
  onImportComplete?: (operation: BatchOperation) => void
  templateFields?: Array<{ name: string; example: string; description?: string }>
}

export const BatchImportDialog: React.FC<BatchImportDialogProps> = ({
  entityType,
  onClose,
  onImportComplete,
  templateFields
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<any[]>([])
  const [errors, setErrors] = useState<Array<{ row: number; field: string; error: string }>>([])
  const [operation, setOperation] = useState<BatchOperation | null>(null)
  const [step, setStep] = useState<'upload' | 'preview' | 'progress'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    try {
      setFile(selectedFile)
      const parsedData = await csvParser.parseFile(selectedFile)
      setData(parsedData)
      setErrors([])
      setStep('preview')
    } catch (error: any) {
      console.error('Error parsing file:', error)
      alert(`Error parsing file: ${error.message}`)
    }
  }

  const handleImport = async () => {
    try {
      const result = await batchOperationService.batchImport({
        entityType,
        data,
        fileName: file?.name,
        fileType: 'csv'
      })

      setOperation(result)
      setStep('progress')
    } catch (error: any) {
      console.error('Error starting import:', error)
      alert(`Error starting import: ${error.message}`)
    }
  }

  const handleDownloadTemplate = () => {
    const defaultFields = {
      agent: [
        { name: 'name', example: 'My Agent', description: 'Agent name (required)' },
        { name: 'aiModel', example: 'gpt-4', description: 'AI model (required)' },
        { name: 'systemPrompt', example: 'You are a helpful assistant', description: 'System prompt' },
        { name: 'temperature', example: '0.7', description: 'Temperature (0-2)' },
        { name: 'maxTokens', example: '2000', description: 'Max tokens' },
        { name: 'tags', example: 'helper,assistant', description: 'Comma-separated tags' }
      ],
      task: [
        { name: 'title', example: 'My Task', description: 'Task title (required)' },
        { name: 'agentId', example: 'agent123', description: 'Agent ID (required)' },
        { name: 'description', example: 'Task description', description: 'Task description' },
        { name: 'priority', example: 'high', description: 'Priority: low, medium, high, urgent' },
        { name: 'status', example: 'pending', description: 'Status: pending, in_progress, completed, failed' },
        { name: 'tags', example: 'important,urgent', description: 'Comma-separated tags' }
      ],
      user: [
        { name: 'email', example: 'user@example.com', description: 'Email address (required)' },
        { name: 'username', example: 'johndoe', description: 'Username (required)' },
        { name: 'password', example: 'securepass123', description: 'Password (required, min 6 chars)' },
        { name: 'avatar', example: 'https://...', description: 'Avatar URL' }
      ]
    }

    const fields = templateFields || defaultFields[entityType]
    const template = csvParser.generateTemplate(fields)
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${entityType}_import_template.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold">Import {entityType}s</h2>
            <p className="text-sm text-gray-400 mt-1">
              Upload a CSV file to import multiple {entityType}s at once
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
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Template download */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-blue-400 mb-1">
                      Download Template
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">
                      Start with our CSV template to ensure your data is formatted correctly.
                    </p>
                    <button
                      onClick={handleDownloadTemplate}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Template</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* File upload */}
              <div
                className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-900/10 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Drop your CSV file here or click to browse
                </h3>
                <p className="text-sm text-gray-400">
                  Supports CSV files up to 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              {/* File info */}
              <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                <FileText className="w-5 h-5 text-blue-400" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{file?.name}</p>
                  <p className="text-xs text-gray-400">
                    {data.length} {data.length === 1 ? 'row' : 'rows'} found
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFile(null)
                    setData([])
                    setStep('upload')
                  }}
                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm transition-colors"
                >
                  Change File
                </button>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-400 mb-3">
                    <AlertCircle className="w-5 h-5" />
                    <h3 className="font-semibold">
                      {errors.length} validation {errors.length === 1 ? 'error' : 'errors'} found
                    </h3>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-300">
                        Row {error.row}, {error.field}: {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview table */}
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-700 sticky top-0">
                      <tr>
                        {data.length > 0 &&
                          Object.keys(data[0]).map(key => (
                            <th key={key} className="px-4 py-2 text-left font-semibold">
                              {key}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(0, 10).map((row, index) => (
                        <tr key={index} className="border-t border-gray-700 hover:bg-gray-700/50">
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {data.length > 10 && (
                  <div className="px-4 py-2 bg-gray-700 text-xs text-gray-400 text-center">
                    Showing first 10 of {data.length} rows
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'progress' && operation && (
            <BatchProgressTracker
              operation={operation}
              onComplete={op => {
                if (onImportComplete) {
                  onImportComplete(op)
                }
              }}
            />
          )}
        </div>

        {/* Footer */}
        {step === 'preview' && (
          <div className="flex items-center justify-between p-6 border-t border-gray-700">
            <button
              onClick={() => {
                setFile(null)
                setData([])
                setStep('upload')
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleImport}
              disabled={errors.length > 0}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold"
            >
              <Upload className="w-4 h-4" />
              <span>Import {data.length} {data.length === 1 ? 'Item' : 'Items'}</span>
            </button>
          </div>
        )}

        {step === 'progress' && operation && (
          <div className="flex items-center justify-end p-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
