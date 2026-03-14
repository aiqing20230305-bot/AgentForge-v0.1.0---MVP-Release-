/**
 * Copyable Code Block Component
 * 可复制代码块组件 - 展示 useCopy Hook 的实际应用
 */

import React from 'react'
import { Copy, Check } from 'lucide-react'
import { useCopy } from '@/hooks'
import { motion } from 'framer-motion'
import { scaleVariants } from '@/utils/animations'

interface CopyableCodeBlockProps {
  code: string
  language?: string
  title?: string
  showLineNumbers?: boolean
  className?: string
}

export const CopyableCodeBlock: React.FC<CopyableCodeBlockProps> = ({
  code,
  language = 'typescript',
  title,
  showLineNumbers = true,
  className = ''
}) => {
  const [copy, copied] = useCopy(2000)

  const lines = code.split('\n')

  return (
    <div className={`relative group ${className}`}>
      {/* 标题栏 */}
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 rounded-t-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">{language}</span>
            <span className="text-sm text-white">{title}</span>
          </div>

          {/* 复制按钮 */}
          <motion.button
            onClick={() => copy(code)}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>已复制!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>复制</span>
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* 代码块 */}
      <div className="relative bg-gray-900 rounded-b-lg overflow-hidden">
        <pre className="p-4 overflow-x-auto">
          <code className="text-sm font-mono text-gray-300">
            {showLineNumbers ? (
              <table className="w-full">
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index}>
                      <td className="pr-4 text-right text-gray-600 select-none w-8">
                        {index + 1}
                      </td>
                      <td className="text-gray-300">{line || '\n'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              code
            )}
          </code>
        </pre>

        {/* 悬停复制按钮（无标题时显示） */}
        {!title && (
          <motion.button
            onClick={() => copy(code)}
            className={`absolute top-2 right-2 p-2 rounded transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 opacity-0 group-hover:opacity-100'
            }`}
            variants={scaleVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </motion.button>
        )}
      </div>
    </div>
  )
}

/**
 * Copyable Text Component
 * 可复制文本组件 - 简化版
 */

interface CopyableTextProps {
  text: string
  label?: string
  showCopyIcon?: boolean
  className?: string
}

export const CopyableText: React.FC<CopyableTextProps> = ({
  text,
  label,
  showCopyIcon = true,
  className = ''
}) => {
  const [copy, copied] = useCopy(1500)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && <span className="text-sm text-gray-400">{label}:</span>}

      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
        <code className="text-sm font-mono text-gray-300">{text}</code>

        {showCopyIcon && (
          <motion.button
            onClick={() => copy(text)}
            className={`p-1 rounded transition-colors ${
              copied
                ? 'bg-green-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </motion.button>
        )}
      </div>
    </div>
  )
}

/**
 * Share Link Component
 * 分享链接组件 - 带复制功能
 */

interface ShareLinkProps {
  url: string
  title?: string
  description?: string
}

export const ShareLink: React.FC<ShareLinkProps> = ({
  url,
  title = '分享链接',
  description
}) => {
  const [copy, copied] = useCopy(2000)

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg space-y-2">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {copied && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-green-400"
          >
            ✓ 已复制到剪贴板
          </motion.span>
        )}
      </div>

      {/* 描述 */}
      {description && (
        <p className="text-xs text-gray-400">{description}</p>
      )}

      {/* 链接输入框 */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={url}
          readOnly
          className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm text-gray-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <motion.button
          onClick={() => copy(url)}
          className={`px-4 py-2 rounded font-medium transition-all ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? (
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4" />
              已复制
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Copy className="w-4 h-4" />
              复制
            </span>
          )}
        </motion.button>
      </div>
    </div>
  )
}

/**
 * API Key Display Component
 * API 密钥显示组件 - 可复制和隐藏
 */

interface APIKeyDisplayProps {
  apiKey: string
  label?: string
  masked?: boolean
}

export const APIKeyDisplay: React.FC<APIKeyDisplayProps> = ({
  apiKey,
  label = 'API Key',
  masked: initialMasked = true
}) => {
  const [copy, copied] = useCopy(2000)
  const [isMasked, setIsMasked] = React.useState(initialMasked)

  const displayKey = isMasked
    ? apiKey.slice(0, 8) + '•'.repeat(Math.max(0, apiKey.length - 8))
    : apiKey

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-400">{label}</div>

      <div className="flex items-center gap-2 p-3 bg-gray-800 border border-gray-700 rounded-lg">
        <code className="flex-1 text-sm font-mono text-gray-300 select-all">
          {displayKey}
        </code>

        <div className="flex items-center gap-1">
          <motion.button
            onClick={() => setIsMasked(!isMasked)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={isMasked ? '显示' : '隐藏'}
          >
            {isMasked ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </motion.button>

          <motion.button
            onClick={() => copy(apiKey)}
            className={`p-1.5 rounded transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="复制"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {copied && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-xs text-green-400"
        >
          ✓ API Key 已复制到剪贴板
        </motion.div>
      )}
    </div>
  )
}
