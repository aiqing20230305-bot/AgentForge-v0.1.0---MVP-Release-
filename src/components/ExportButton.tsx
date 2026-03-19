/**
 * Export Button Component
 * v2.4.0 Phase 1.4 - 导出功能UI
 */
import React, { useState } from 'react'
import { Download, Mail, FileText, FileSpreadsheet } from 'lucide-react'
import {
  exportDashboardToPdf,
  exportDataToCsv,
  exportDataToJson,
  createEmailShareLink
} from '../utils/exportPdf'

interface ExportButtonProps {
  elementId?: string
  data?: any[]
  filename?: string
  variant?: 'default' | 'icon' | 'minimal'
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  elementId = 'dashboard',
  data,
  filename = 'report',
  variant = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPdf = async () => {
    setIsExporting(true)
    try {
      await exportDashboardToPdf(elementId, { filename })
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
      setIsOpen(false)
    }
  }

  const handleExportCsv = () => {
    if (data) {
      exportDataToCsv(data, filename)
    }
    setIsOpen(false)
  }

  const handleExportJson = () => {
    if (data) {
      exportDataToJson(data, filename)
    }
    setIsOpen(false)
  }

  const handleEmailShare = () => {
    const subject = `AgentForge Report - ${filename}`
    const mailtoLink = createEmailShareLink(subject)
    window.location.href = mailtoLink
    setIsOpen(false)
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        title="导出报表"
      >
        <Download size={20} className="text-cyan-400" />
        {isOpen && <ExportMenu />}
      </button>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isExporting}
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
        >
          {isExporting ? '导出中...' : '导出'}
        </button>
        {isOpen && <ExportMenu />}
      </div>
    )
  }

  const ExportMenu = () => (
    <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50">
      <div className="py-2">
        <button
          onClick={handleExportPdf}
          className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 flex items-center gap-2"
        >
          <FileText size={16} className="text-red-400" />
          导出为 PDF
        </button>

        {data && (
          <>
            <button
              onClick={handleExportCsv}
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 flex items-center gap-2"
            >
              <FileSpreadsheet size={16} className="text-green-400" />
              导出为 CSV
            </button>

            <button
              onClick={handleExportJson}
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 flex items-center gap-2"
            >
              <FileText size={16} className="text-blue-400" />
              导出为 JSON
            </button>
          </>
        )}

        <div className="border-t border-white/10 my-2"></div>

        <button
          onClick={handleEmailShare}
          className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 flex items-center gap-2"
        >
          <Mail size={16} className="text-purple-400" />
          通过邮件发送
        </button>
      </div>
    </div>
  )

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
      >
        <Download size={20} />
        {isExporting ? '导出中...' : '导出报表'}
      </button>

      {isOpen && <ExportMenu />}

      {/* 点击外部关闭 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default ExportButton
