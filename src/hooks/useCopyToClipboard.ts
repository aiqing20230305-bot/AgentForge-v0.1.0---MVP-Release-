/**
 * useCopyToClipboard Hook
 * 复制文本到剪贴板Hook
 */

import { useState, useCallback, useEffect } from 'react'

/**
 * 复制结果接口
 */
export interface CopyResult {
  value: string | null
  error: Error | null
  copied: boolean
}

/**
 * 复制文本到剪贴板
 *
 * @returns [copyFn, result]
 *
 * @example
 * const [copy, { value, error, copied }] = useCopyToClipboard()
 *
 * <button onClick={() => copy('Hello World')}>
 *   {copied ? 'Copied!' : 'Copy'}
 * </button>
 */
export function useCopyToClipboard(): [
  (text: string) => Promise<void>,
  CopyResult
] {
  const [result, setResult] = useState<CopyResult>({
    value: null,
    error: null,
    copied: false
  })

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      const error = new Error('Clipboard not supported')
      setResult({ value: null, error, copied: false })
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setResult({ value: text, error: null, copied: true })

      // 3秒后重置copied状态
      setTimeout(() => {
        setResult((prev) => ({ ...prev, copied: false }))
      }, 3000)
    } catch (error) {
      setResult({ value: null, error: error as Error, copied: false })
    }
  }, [])

  return [copy, result]
}

/**
 * 简化版复制Hook（只返回copy函数和copied状态）
 *
 * @param resetDelay - 重置延迟（毫秒，默认3000）
 * @returns [copy, copied]
 *
 * @example
 * const [copy, copied] = useCopy()
 *
 * <button onClick={() => copy('Text to copy')}>
 *   {copied ? '✓ Copied' : 'Copy'}
 * </button>
 */
export function useCopy(
  resetDelay: number = 3000
): [(text: string) => Promise<boolean>, boolean] {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!navigator?.clipboard) {
        console.warn('Clipboard not supported')
        return false
      }

      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)

        setTimeout(() => {
          setCopied(false)
        }, resetDelay)

        return true
      } catch (error) {
        console.warn('Copy failed:', error)
        setCopied(false)
        return false
      }
    },
    [resetDelay]
  )

  return [copy, copied]
}

/**
 * 带回调的复制Hook
 *
 * @param onSuccess - 成功时的回调
 * @param onError - 失败时的回调
 * @returns [copy, copied]
 *
 * @example
 * const [copy, copied] = useCopyWithCallback(
 *   () => toast.success('Copied!'),
 *   () => toast.error('Failed to copy')
 * )
 */
export function useCopyWithCallback(
  onSuccess?: (text: string) => void,
  onError?: (error: Error) => void
): [(text: string) => Promise<void>, boolean] {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      if (!navigator?.clipboard) {
        const error = new Error('Clipboard not supported')
        onError?.(error)
        return
      }

      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        onSuccess?.(text)

        setTimeout(() => {
          setCopied(false)
        }, 3000)
      } catch (error) {
        setCopied(false)
        onError?.(error as Error)
      }
    },
    [onSuccess, onError]
  )

  return [copy, copied]
}

/**
 * 复制元素内容Hook
 *
 * @param elementId - 元素ID
 * @returns [copyElement, copied]
 *
 * @example
 * const [copyCode, copied] = useCopyElement('code-block')
 *
 * <pre id="code-block">const x = 42;</pre>
 * <button onClick={copyCode}>
 *   {copied ? 'Copied!' : 'Copy Code'}
 * </button>
 */
export function useCopyElement(
  elementId?: string
): [() => Promise<boolean>, boolean] {
  const [copied, setCopied] = useState(false)

  const copyElement = useCallback(async (): Promise<boolean> => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported')
      return false
    }

    const element = elementId
      ? document.getElementById(elementId)
      : null

    if (!element) {
      console.warn('Element not found')
      return false
    }

    const text = element.textContent || element.innerText

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 3000)

      return true
    } catch (error) {
      console.warn('Copy failed:', error)
      return false
    }
  }, [elementId])

  return [copyElement, copied]
}

/**
 * 读取剪贴板Hook
 *
 * @returns [paste, pastedText, error]
 *
 * @example
 * const [paste, pastedText, error] = usePasteFromClipboard()
 *
 * <button onClick={paste}>Paste</button>
 * {pastedText && <div>Pasted: {pastedText}</div>}
 */
export function usePasteFromClipboard(): [
  () => Promise<void>,
  string | null,
  Error | null
] {
  const [pastedText, setPastedText] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const paste = useCallback(async () => {
    if (!navigator?.clipboard) {
      const err = new Error('Clipboard not supported')
      setError(err)
      return
    }

    try {
      const text = await navigator.clipboard.readText()
      setPastedText(text)
      setError(null)
    } catch (err) {
      setError(err as Error)
      setPastedText(null)
    }
  }, [])

  return [paste, pastedText, error]
}

/**
 * 监听剪贴板变化Hook
 *
 * @param onClipboardChange - 剪贴板变化时的回调
 *
 * @example
 * useClipboardMonitor((text) => {
 *   console.log('Clipboard changed:', text)
 * })
 */
export function useClipboardMonitor(
  onClipboardChange?: (text: string) => void
) {
  const [lastText, setLastText] = useState<string>('')

  const checkClipboard = useCallback(async () => {
    if (!navigator?.clipboard) {
      return
    }

    try {
      const text = await navigator.clipboard.readText()
      if (text !== lastText) {
        setLastText(text)
        onClipboardChange?.(text)
      }
    } catch (error) {
      // 权限被拒绝或其他错误
      console.warn('Failed to read clipboard:', error)
    }
  }, [lastText, onClipboardChange])

  // 每秒检查一次剪贴板
  useEffect(() => {
    const intervalId = setInterval(checkClipboard, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [checkClipboard])
}

/**
 * 复制到剪贴板（带降级方案）
 *
 * @param text - 要复制的文本
 * @returns 是否成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 现代浏览器
  if (navigator?.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.warn('Clipboard API failed, trying fallback')
    }
  }

  // 降级方案：使用 document.execCommand
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()

    const success = document.execCommand('copy')
    document.body.removeChild(textarea)

    return success
  } catch (error) {
    console.error('Copy failed:', error)
    return false
  }
}
