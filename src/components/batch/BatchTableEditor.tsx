/**
 * Batch Table Editor Component
 * Inline spreadsheet-like editor for batch editing
 */

import React, { useState, useRef, useEffect } from 'react'
import { Save, X, Plus, Trash2, Copy, ArrowUp, ArrowDown } from 'lucide-react'

export interface BatchTableEditorProps<T = any> {
  data: T[]
  columns: Array<{
    key: string
    label: string
    editable?: boolean
    type?: 'text' | 'number' | 'select' | 'date'
    options?: string[]
    width?: number
  }>
  onSave: (data: T[]) => void
  onCancel: () => void
  onAddRow?: () => T
  className?: string
}

export const BatchTableEditor = <T extends Record<string, any>>({
  data,
  columns,
  onSave,
  onCancel,
  onAddRow,
  className = ''
}: BatchTableEditorProps<T>) => {
  const [editedData, setEditedData] = useState<T[]>([...data])
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [copiedValue, setCopiedValue] = useState<any>(null)
  const cellRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  useEffect(() => {
    // Focus selected cell
    if (selectedCell) {
      const key = `${selectedCell.row}-${selectedCell.col}`
      cellRefs.current[key]?.focus()
    }
  }, [selectedCell])

  const handleCellChange = (rowIndex: number, colKey: string, value: any) => {
    const newData = [...editedData]
    newData[rowIndex] = { ...newData[rowIndex], [colKey]: value }
    setEditedData(newData)
  }

  const handleAddRow = () => {
    if (onAddRow) {
      const newRow = onAddRow()
      setEditedData([...editedData, newRow])
    }
  }

  const handleDeleteRows = () => {
    const newData = editedData.filter((_, index) => !selectedRows.has(index))
    setEditedData(newData)
    setSelectedRows(new Set())
  }

  const handleDuplicateRows = () => {
    const rowsToDuplicate = editedData.filter((_, index) => selectedRows.has(index))
    setEditedData([...editedData, ...rowsToDuplicate])
  }

  const handleMoveRowsUp = () => {
    const newData = [...editedData]
    const sortedIndices = Array.from(selectedRows).sort((a, b) => a - b)

    for (const index of sortedIndices) {
      if (index > 0) {
        ;[newData[index], newData[index - 1]] = [newData[index - 1], newData[index]]
      }
    }

    setEditedData(newData)
    setSelectedRows(new Set(sortedIndices.map(i => Math.max(0, i - 1))))
  }

  const handleMoveRowsDown = () => {
    const newData = [...editedData]
    const sortedIndices = Array.from(selectedRows).sort((a, b) => b - a)

    for (const index of sortedIndices) {
      if (index < newData.length - 1) {
        ;[newData[index], newData[index + 1]] = [newData[index + 1], newData[index]]
      }
    }

    setEditedData(newData)
    setSelectedRows(new Set(sortedIndices.map(i => Math.min(newData.length - 1, i + 1))))
  }

  const handleCopyCell = () => {
    if (selectedCell) {
      const col = columns[selectedCell.col]
      const value = editedData[selectedCell.row][col.key]
      setCopiedValue(value)
    }
  }

  const handlePasteCell = () => {
    if (selectedCell && copiedValue !== null) {
      const col = columns[selectedCell.col]
      handleCellChange(selectedCell.row, col.key, copiedValue)
    }
  }

  const handleFillDown = () => {
    if (selectedCell) {
      const col = columns[selectedCell.col]
      const value = editedData[selectedCell.row][col.key]
      const newData = [...editedData]

      for (let i = selectedCell.row + 1; i < newData.length; i++) {
        newData[i] = { ...newData[i], [col.key]: value }
      }

      setEditedData(newData)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        if (rowIndex > 0) {
          setSelectedCell({ row: rowIndex - 1, col: colIndex })
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (rowIndex < editedData.length - 1) {
          setSelectedCell({ row: rowIndex + 1, col: colIndex })
        }
        break
      case 'ArrowLeft':
        if (colIndex > 0) {
          e.preventDefault()
          setSelectedCell({ row: rowIndex, col: colIndex - 1 })
        }
        break
      case 'ArrowRight':
        if (colIndex < columns.length - 1) {
          e.preventDefault()
          setSelectedCell({ row: rowIndex, col: colIndex + 1 })
        }
        break
      case 'Enter':
        e.preventDefault()
        if (e.shiftKey) {
          if (rowIndex > 0) {
            setSelectedCell({ row: rowIndex - 1, col: colIndex })
          }
        } else {
          if (rowIndex < editedData.length - 1) {
            setSelectedCell({ row: rowIndex + 1, col: colIndex })
          }
        }
        break
      case 'Tab':
        e.preventDefault()
        if (e.shiftKey) {
          if (colIndex > 0) {
            setSelectedCell({ row: rowIndex, col: colIndex - 1 })
          } else if (rowIndex > 0) {
            setSelectedCell({ row: rowIndex - 1, col: columns.length - 1 })
          }
        } else {
          if (colIndex < columns.length - 1) {
            setSelectedCell({ row: rowIndex, col: colIndex + 1 })
          } else if (rowIndex < editedData.length - 1) {
            setSelectedCell({ row: rowIndex + 1, col: 0 })
          }
        }
        break
      case 'c':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault()
          handleCopyCell()
        }
        break
      case 'v':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault()
          handlePasteCell()
        }
        break
      case 'd':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault()
          handleFillDown()
        }
        break
    }
  }

  const toggleRowSelection = (rowIndex: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(rowIndex)) {
      newSelected.delete(rowIndex)
    } else {
      newSelected.add(rowIndex)
    }
    setSelectedRows(newSelected)
  }

  const renderCell = (row: T, col: any, rowIndex: number, colIndex: number) => {
    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex
    const isEditable = col.editable !== false

    if (!isEditable) {
      return (
        <div className="px-2 py-1 text-sm text-gray-400">
          {String(row[col.key] || '')}
        </div>
      )
    }

    const cellKey = `${rowIndex}-${colIndex}`

    if (col.type === 'select' && col.options) {
      return (
        <select
          ref={el => (cellRefs.current[cellKey] = el as any)}
          value={row[col.key] || ''}
          onChange={e => handleCellChange(rowIndex, col.key, e.target.value)}
          onFocus={() => setSelectedCell({ row: rowIndex, col: colIndex })}
          onKeyDown={e => handleKeyDown(e, rowIndex, colIndex)}
          className={`w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            isSelected ? 'ring-1 ring-blue-500' : ''
          }`}
        >
          <option value="">Select...</option>
          {col.options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )
    }

    return (
      <input
        ref={el => (cellRefs.current[cellKey] = el)}
        type={col.type || 'text'}
        value={row[col.key] || ''}
        onChange={e => handleCellChange(rowIndex, col.key, e.target.value)}
        onFocus={() => setSelectedCell({ row: rowIndex, col: colIndex })}
        onKeyDown={e => handleKeyDown(e, rowIndex, colIndex)}
        className={`w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          isSelected ? 'ring-1 ring-blue-500' : ''
        }`}
      />
    )
  }

  return (
    <div className={`batch-table-editor bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          {onAddRow && (
            <button
              onClick={handleAddRow}
              className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
              title="Add Row"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}

          {selectedRows.size > 0 && (
            <>
              <button
                onClick={handleDuplicateRows}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                title="Duplicate Selected Rows"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>

              <button
                onClick={handleMoveRowsUp}
                className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                title="Move Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleMoveRowsDown}
                className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                title="Move Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleDeleteRows}
                className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                title="Delete Selected Rows"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedRows.size})</span>
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>

          <button
            onClick={() => onSave(editedData)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[600px]">
        <table className="w-full text-sm">
          <thead className="bg-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-2 w-12">
                <input
                  type="checkbox"
                  checked={selectedRows.size === editedData.length}
                  onChange={() => {
                    if (selectedRows.size === editedData.length) {
                      setSelectedRows(new Set())
                    } else {
                      setSelectedRows(new Set(editedData.map((_, i) => i)))
                    }
                  }}
                  className="w-4 h-4"
                />
              </th>
              <th className="px-2 py-2 w-12 text-left">#</th>
              {columns.map((col, index) => (
                <th
                  key={col.key}
                  className="px-2 py-2 text-left font-semibold"
                  style={{ width: col.width || 'auto' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {editedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-t border-gray-700 hover:bg-gray-700/50 ${
                  selectedRows.has(rowIndex) ? 'bg-blue-900/20' : ''
                }`}
              >
                <td className="px-2 py-1">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(rowIndex)}
                    onChange={() => toggleRowSelection(rowIndex)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="px-2 py-1 text-gray-400">{rowIndex + 1}</td>
                {columns.map((col, colIndex) => (
                  <td key={col.key} className="px-2 py-1">
                    {renderCell(row, col, rowIndex, colIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t border-gray-700 text-xs text-gray-400">
        <div>
          {editedData.length} {editedData.length === 1 ? 'row' : 'rows'}
          {selectedRows.size > 0 && ` (${selectedRows.size} selected)`}
        </div>
        <div>
          Keyboard shortcuts: Tab/Shift+Tab to navigate, Ctrl+C/V to copy/paste, Ctrl+D to fill down
        </div>
      </div>
    </div>
  )
}
