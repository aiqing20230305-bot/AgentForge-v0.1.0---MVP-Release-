/**
 * 可访问性工具
 * 键盘导航、ARIA标签、对比度检查
 */

/**
 * 键盘导航管理器
 */
export class KeyboardNavigationManager {
  private focusableElements: HTMLElement[] = []
  private currentIndex = -1

  constructor(private container: HTMLElement) {
    this.init()
  }

  private init() {
    // 监听键盘事件
    this.container.addEventListener('keydown', this.handleKeyDown.bind(this))

    // 更新可聚焦元素列表
    this.updateFocusableElements()

    // 监听DOM变化
    const observer = new MutationObserver(() => {
      this.updateFocusableElements()
    })

    observer.observe(this.container, {
      childList: true,
      subtree: true
    })
  }

  private updateFocusableElements() {
    const selector = `
      a[href],
      button:not([disabled]),
      textarea:not([disabled]),
      input:not([disabled]),
      select:not([disabled]),
      [tabindex]:not([tabindex="-1"])
    `

    this.focusableElements = Array.from(
      this.container.querySelectorAll(selector)
    ) as HTMLElement[]
  }

  private handleKeyDown(e: KeyboardEvent) {
    const { key, shiftKey, ctrlKey, metaKey } = e

    // Tab键导航
    if (key === 'Tab') {
      if (shiftKey) {
        this.focusPrevious()
      } else {
        this.focusNext()
      }
      e.preventDefault()
    }

    // 方向键导航
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      this.handleArrowKey(key)
      e.preventDefault()
    }

    // Escape关闭模态框
    if (key === 'Escape') {
      this.closeModal()
    }

    // Enter/Space激活元素
    if (key === 'Enter' || key === ' ') {
      const target = e.target as HTMLElement
      if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
        target.click()
        e.preventDefault()
      }
    }

    // Ctrl+K/Cmd+K 全局搜索
    if ((ctrlKey || metaKey) && key === 'k') {
      this.triggerGlobalSearch()
      e.preventDefault()
    }
  }

  private focusNext() {
    this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length
    this.focusableElements[this.currentIndex]?.focus()
  }

  private focusPrevious() {
    this.currentIndex = this.currentIndex <= 0
      ? this.focusableElements.length - 1
      : this.currentIndex - 1
    this.focusableElements[this.currentIndex]?.focus()
  }

  private handleArrowKey(key: string) {
    const focused = document.activeElement as HTMLElement
    const role = focused.getAttribute('role')

    // Grid/List导航
    if (role === 'gridcell' || role === 'listitem') {
      // 实现网格/列表导航逻辑
      console.log('[A11y] Arrow navigation:', key, focused)
    }
  }

  private closeModal() {
    const modal = this.container.querySelector('[role="dialog"]') as HTMLElement
    if (modal) {
      const closeButton = modal.querySelector('[aria-label="关闭"]') as HTMLElement
      closeButton?.click()
    }
  }

  private triggerGlobalSearch() {
    const searchButton = document.querySelector('[aria-label="全局搜索"]') as HTMLElement
    searchButton?.click()
  }

  public focus(index: number) {
    if (index >= 0 && index < this.focusableElements.length) {
      this.currentIndex = index
      this.focusableElements[index].focus()
    }
  }

  public destroy() {
    this.container.removeEventListener('keydown', this.handleKeyDown.bind(this))
  }
}

/**
 * ARIA标签增强
 */
export function enhanceARIA(element: HTMLElement, options: {
  label?: string
  role?: string
  describedBy?: string
  expanded?: boolean
  selected?: boolean
  level?: number
}) {
  if (options.label) {
    element.setAttribute('aria-label', options.label)
  }

  if (options.role) {
    element.setAttribute('role', options.role)
  }

  if (options.describedBy) {
    element.setAttribute('aria-describedby', options.describedBy)
  }

  if (options.expanded !== undefined) {
    element.setAttribute('aria-expanded', String(options.expanded))
  }

  if (options.selected !== undefined) {
    element.setAttribute('aria-selected', String(options.selected))
  }

  if (options.level) {
    element.setAttribute('aria-level', String(options.level))
  }

  // 确保可聚焦
  if (!element.hasAttribute('tabindex') && options.role) {
    element.setAttribute('tabindex', '0')
  }
}

/**
 * 对比度检查（WCAG 2.1 AA）
 */
export function checkContrast(foreground: string, background: string): {
  ratio: number
  passAA: boolean
  passAAA: boolean
  level: 'fail' | 'AA' | 'AAA'
} {
  // 将颜色转换为RGB
  const rgbFg = hexToRgb(foreground)
  const rgbBg = hexToRgb(background)

  if (!rgbFg || !rgbBg) {
    return { ratio: 0, passAA: false, passAAA: false, level: 'fail' }
  }

  // 计算相对亮度
  const lFg = getRelativeLuminance(rgbFg)
  const lBg = getRelativeLuminance(rgbBg)

  // 计算对比度
  const ratio = (Math.max(lFg, lBg) + 0.05) / (Math.min(lFg, lBg) + 0.05)

  return {
    ratio: Math.round(ratio * 100) / 100,
    passAA: ratio >= 4.5, // WCAG AA标准
    passAAA: ratio >= 7, // WCAG AAA标准
    level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'fail'
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb

  const rsRGB = r / 255
  const gsRGB = g / 255
  const bsRGB = b / 255

  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
}

/**
 * 屏幕阅读器公告
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  // 创建或获取live region
  let liveRegion = document.getElementById('a11y-live-region') as HTMLElement

  if (!liveRegion) {
    liveRegion = document.createElement('div')
    liveRegion.id = 'a11y-live-region'
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `
    document.body.appendChild(liveRegion)
  }

  // 更新内容
  liveRegion.textContent = message

  // 清空（让屏幕阅读器重新读取）
  setTimeout(() => {
    liveRegion.textContent = ''
  }, 1000)
}

/**
 * Skip Link（跳过导航）
 */
export function createSkipLink() {
  const skipLink = document.createElement('a')
  skipLink.href = '#main-content'
  skipLink.textContent = '跳到主内容'
  skipLink.className = 'skip-link'
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px 16px;
    text-decoration: none;
    z-index: 9999;
    transition: top 0.2s;
  `

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0'
  })

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px'
  })

  document.body.insertBefore(skipLink, document.body.firstChild)
}

/**
 * 检查页面可访问性
 */
export function auditAccessibility(): {
  issues: Array<{ element: string; issue: string; severity: 'error' | 'warning' }>
  score: number
} {
  const issues: Array<{ element: string; issue: string; severity: 'error' | 'warning' }> = []

  // 检查图片alt
  document.querySelectorAll('img').forEach((img, index) => {
    if (!img.hasAttribute('alt')) {
      issues.push({
        element: `img[${index}]`,
        issue: '缺少alt属性',
        severity: 'error'
      })
    }
  })

  // 检查按钮文本
  document.querySelectorAll('button').forEach((btn, index) => {
    if (!btn.textContent?.trim() && !btn.getAttribute('aria-label')) {
      issues.push({
        element: `button[${index}]`,
        issue: '按钮无文本或aria-label',
        severity: 'error'
      })
    }
  })

  // 检查表单标签
  document.querySelectorAll('input, textarea, select').forEach((input, index) => {
    const id = input.id
    if (id && !document.querySelector(`label[for="${id}"]`) && !input.getAttribute('aria-label')) {
      issues.push({
        element: `${input.tagName.toLowerCase()}[${index}]`,
        issue: '表单控件缺少label',
        severity: 'warning'
      })
    }
  })

  // 检查标题层级
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  let lastLevel = 0
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName[1])
    if (level - lastLevel > 1) {
      issues.push({
        element: `${heading.tagName.toLowerCase()}[${index}]`,
        issue: `标题层级跳跃 (${lastLevel} -> ${level})`,
        severity: 'warning'
      })
    }
    lastLevel = level
  })

  // 计算分数
  const errorCount = issues.filter(i => i.severity === 'error').length
  const warningCount = issues.filter(i => i.severity === 'warning').length
  const score = Math.max(0, 100 - errorCount * 10 - warningCount * 5)

  return { issues, score }
}

/**
 * 初始化可访问性功能
 */
export function initAccessibility() {
  console.log('[A11y] Initializing accessibility features...')

  // 创建Skip Link
  createSkipLink()

  // 初始化键盘导航
  const root = document.getElementById('root')
  if (root) {
    new KeyboardNavigationManager(root)
  }

  // 添加focus-visible polyfill class
  document.addEventListener('keydown', () => {
    document.body.classList.add('using-keyboard')
  })

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('using-keyboard')
  })

  // 审计可访问性
  setTimeout(() => {
    const audit = auditAccessibility()
    console.log('[A11y] Accessibility audit:', audit)

    if (audit.issues.length > 0) {
      console.warn('[A11y] Found accessibility issues:', audit.issues)
    }
  }, 2000)
}
