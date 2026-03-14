/**
 * QR Code生成工具
 * 用于邀请码分享
 */

import QRCode from 'qrcode'

// GitHub仓库URL（可以在这里配置部署后的域名）
const APP_BASE_URL = 'https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-'

/**
 * 生成邀请码二维码
 * @param code 邀请码
 * @param baseURL 应用基础URL（可选）
 * @returns Promise<二维码Data URL>
 */
export async function generateInviteQRCode(
  code: string,
  baseURL: string = APP_BASE_URL
): Promise<string> {
  // 构造邀请链接（实际部署后可以改为 https://agentforge.app?invite=CODE）
  const url = `${baseURL}?invite=${code}`

  try {
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#06b6d4', // AgentForge青色主题色
        light: '#0a0a0a' // 深色背景
      },
      errorCorrectionLevel: 'M' // 中等容错率
    })

    return qrCodeDataURL
  } catch (error) {
    console.error('[QRCode] Generation failed:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * 生成自定义样式二维码
 * @param text 任意文本
 * @param options 自定义选项
 * @returns Promise<二维码Data URL>
 */
export async function generateCustomQRCode(
  text: string,
  options?: {
    size?: number
    color?: string
    bgColor?: string
    errorLevel?: 'L' | 'M' | 'Q' | 'H'
  }
): Promise<string> {
  const {
    size = 300,
    color = '#06b6d4',
    bgColor = '#0a0a0a',
    errorLevel = 'M'
  } = options || {}

  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: color,
        light: bgColor
      },
      errorCorrectionLevel: errorLevel
    })

    return qrCodeDataURL
  } catch (error) {
    console.error('[QRCode] Custom generation failed:', error)
    throw new Error('Failed to generate custom QR code')
  }
}

/**
 * 下载二维码为图片
 * @param dataURL 二维码Data URL
 * @param filename 文件名（不含扩展名）
 */
export function downloadQRCode(dataURL: string, filename: string = 'invite-qrcode'): void {
  const link = document.createElement('a')
  link.download = `${filename}.png`
  link.href = dataURL
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 复制二维码到剪贴板
 * @param dataURL 二维码Data URL
 * @returns Promise<boolean> 是否成功
 */
export async function copyQRCodeToClipboard(dataURL: string): Promise<boolean> {
  try {
    // 将Data URL转换为Blob
    const response = await fetch(dataURL)
    const blob = await response.blob()

    // 使用Clipboard API复制
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])

    return true
  } catch (error) {
    console.error('[QRCode] Copy to clipboard failed:', error)
    return false
  }
}

/**
 * 使用示例：
 *
 * // 1. 生成邀请码二维码
 * const qrCode = await generateInviteQRCode('ABC12345')
 *
 * // 2. 显示在页面上
 * <img src={qrCode} alt="Invite QR Code" />
 *
 * // 3. 下载二维码
 * downloadQRCode(qrCode, 'my-invite-code')
 *
 * // 4. 复制到剪贴板
 * const success = await copyQRCodeToClipboard(qrCode)
 */
