/**
 * 邀请码二维码模态框
 * 显示二维码供用户扫描或下载
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Copy, Check, Loader2 } from 'lucide-react'
import { generateInviteQRCode, downloadQRCode, copyQRCodeToClipboard } from '../utils/qrcode'
import { audioSystem } from '../services/audioSystem'
import { fadeVariants, modalVariants } from '../utils/animations'

interface InviteQRModalProps {
  isOpen: boolean
  onClose: () => void
  inviteCode: string
  expiryDate?: string
}

export const InviteQRModal: React.FC<InviteQRModalProps> = ({
  isOpen,
  onClose,
  inviteCode,
  expiryDate
}) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 生成二维码
  useEffect(() => {
    if (!isOpen || !inviteCode) return

    const generateQR = async () => {
      setLoading(true)
      setError(null)

      try {
        const qrDataURL = await generateInviteQRCode(inviteCode)
        setQrCodeDataURL(qrDataURL)
        audioSystem.play('success')
      } catch (err) {
        console.error('[InviteQRModal] Failed to generate QR code:', err)
        setError('Failed to generate QR code')
        audioSystem.play('error')
      } finally {
        setLoading(false)
      }
    }

    generateQR()
  }, [isOpen, inviteCode])

  // 下载二维码
  const handleDownload = () => {
    if (!qrCodeDataURL) return

    downloadQRCode(qrCodeDataURL, `invite-${inviteCode}`)
    audioSystem.play('success')
  }

  // 复制二维码图片
  const handleCopyImage = async () => {
    if (!qrCodeDataURL) return

    const success = await copyQRCodeToClipboard(qrCodeDataURL)

    if (success) {
      setCopied(true)
      audioSystem.play('success')
      setTimeout(() => setCopied(false), 2000)
    } else {
      audioSystem.play('error')
      alert('❌ Failed to copy QR code to clipboard')
    }
  }

  // 关闭模态框
  const handleClose = () => {
    audioSystem.play('click')
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        variants={fadeVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative bg-gray-900 border border-cyan-500/30 rounded-xl p-6 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Title */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              邀请码二维码
            </h3>
            <p className="text-gray-400 text-sm">
              扫描二维码即可快速使用邀请码
            </p>
          </div>

          {/* Invite Code Display */}
          <div className="bg-gray-800 border border-cyan-500/20 rounded-lg p-4 mb-6 text-center">
            <div className="text-sm text-gray-400 mb-1">邀请码</div>
            <div className="text-3xl font-mono font-bold text-cyan-400 tracking-wider">
              {inviteCode}
            </div>
            {expiryDate && (
              <div className="text-xs text-gray-500 mt-2">
                有效期至：{expiryDate}
              </div>
            )}
          </div>

          {/* QR Code Display */}
          <div className="bg-white rounded-lg p-4 mb-6 flex items-center justify-center min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
                <p className="text-gray-600 text-sm">生成二维码中...</p>
              </div>
            ) : error ? (
              <div className="text-center">
                <p className="text-red-500 text-sm mb-2">⚠️ {error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-cyan-600 text-sm hover:underline"
                >
                  重新加载
                </button>
              </div>
            ) : qrCodeDataURL ? (
              <img
                src={qrCodeDataURL}
                alt="Invite QR Code"
                className="w-full max-w-[300px] rounded-lg"
              />
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={!qrCodeDataURL || loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>下载</span>
            </button>

            <button
              onClick={handleCopyImage}
              disabled={!qrCodeDataURL || loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-400">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>复制图片</span>
                </>
              )}
            </button>
          </div>

          {/* Usage Hint */}
          <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <p className="text-cyan-300 text-xs text-center">
              💡 提示：用户扫描二维码后可直接跳转到应用并自动填充邀请码
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
