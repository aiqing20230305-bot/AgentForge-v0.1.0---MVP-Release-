/**
 * Branding Manager - White Label品牌定制管理器
 * 支持Logo、颜色、字体、内容完全定制
 */

export interface BrandConfig {
  // 基本信息
  productName: string
  slogan: string
  companyName: string

  // Logo
  logo: {
    primary: string // URL or base64
    favicon: string
    splashScreen?: string
  }

  // 颜色系统
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    success: string
    warning: string
    error: string
  }

  // 字体
  fonts: {
    heading: string
    body: string
    code: string
  }

  // 联系信息
  contact: {
    email?: string
    website?: string
    support?: string
    documentation?: string
  }

  // 功能开关
  features: {
    showPoweredBy: boolean
    allowThemeSwitch: boolean
    enableAnalytics: boolean
    modules: string[] // 启用的模块列表
  }

  // 自定义CSS
  customCSS?: string
}

export class BrandingManager {
  private config: BrandConfig
  private defaultConfig: BrandConfig = {
    productName: 'AgentForge',
    slogan: 'Forge your AI agents like legendary heroes',
    companyName: 'AgentForge',
    logo: {
      primary: '/logo.svg',
      favicon: '/favicon.ico',
    },
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: '#0a0a0f',
      text: '#f8fafc',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
      code: 'JetBrains Mono',
    },
    contact: {},
    features: {
      showPoweredBy: true,
      allowThemeSwitch: true,
      enableAnalytics: false,
      modules: ['agents', 'tasks', 'analytics', 'settings'],
    },
  }

  constructor() {
    this.config = this.loadConfig()
    this.applyBranding()
  }

  /**
   * 加载品牌配置
   */
  private loadConfig(): BrandConfig {
    try {
      const stored = localStorage.getItem('brand-config')
      if (stored) {
        const config = JSON.parse(stored)
        return { ...this.defaultConfig, ...config }
      }
    } catch (error) {
      console.error('[Branding] Failed to load config:', error)
    }
    return { ...this.defaultConfig }
  }

  /**
   * 保存品牌配置
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('brand-config', JSON.stringify(this.config))
      console.log('[Branding] Config saved')
    } catch (error) {
      console.error('[Branding] Failed to save config:', error)
    }
  }

  /**
   * 应用品牌定制
   */
  applyBranding(): void {
    this.applyColors()
    this.applyFonts()
    this.applyLogo()
    this.applyTitle()
    this.applyCustomCSS()

    console.log('[Branding] Branding applied:', this.config.productName)
  }

  /**
   * 应用颜色
   */
  private applyColors(): void {
    const root = document.documentElement
    const { colors } = this.config

    root.style.setProperty('--brand-primary', colors.primary)
    root.style.setProperty('--brand-secondary', colors.secondary)
    root.style.setProperty('--brand-accent', colors.accent)
    root.style.setProperty('--brand-background', colors.background)
    root.style.setProperty('--brand-text', colors.text)
    root.style.setProperty('--brand-success', colors.success)
    root.style.setProperty('--brand-warning', colors.warning)
    root.style.setProperty('--brand-error', colors.error)
  }

  /**
   * 应用字体
   */
  private applyFonts(): void {
    const root = document.documentElement
    const { fonts } = this.config

    root.style.setProperty('--brand-font-heading', fonts.heading)
    root.style.setProperty('--brand-font-body', fonts.body)
    root.style.setProperty('--brand-font-code', fonts.code)

    // 动态加载字体
    this.loadGoogleFont(fonts.heading)
    if (fonts.body !== fonts.heading) {
      this.loadGoogleFont(fonts.body)
    }
    if (fonts.code !== fonts.heading && fonts.code !== fonts.body) {
      this.loadGoogleFont(fonts.code)
    }
  }

  /**
   * 加载Google字体
   */
  private loadGoogleFont(fontName: string): void {
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@400;500;600;700&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }

  /**
   * 应用Logo
   */
  private applyLogo(): void {
    // Favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (favicon && this.config.logo.favicon) {
      favicon.href = this.config.logo.favicon
    }
  }

  /**
   * 应用标题
   */
  private applyTitle(): void {
    document.title = this.config.productName
  }

  /**
   * 应用自定义CSS
   */
  private applyCustomCSS(): void {
    if (!this.config.customCSS) return

    // 移除旧的自定义样式
    const oldStyle = document.getElementById('brand-custom-css')
    if (oldStyle) {
      oldStyle.remove()
    }

    // 添加新的自定义样式
    const style = document.createElement('style')
    style.id = 'brand-custom-css'
    style.textContent = this.config.customCSS
    document.head.appendChild(style)
  }

  /**
   * 更新品牌配置
   */
  updateConfig(updates: Partial<BrandConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
      // Deep merge for nested objects
      logo: { ...this.config.logo, ...(updates.logo || {}) },
      colors: { ...this.config.colors, ...(updates.colors || {}) },
      fonts: { ...this.config.fonts, ...(updates.fonts || {}) },
      contact: { ...this.config.contact, ...(updates.contact || {}) },
      features: { ...this.config.features, ...(updates.features || {}) },
    }

    this.saveConfig()
    this.applyBranding()
  }

  /**
   * 获取当前配置
   */
  getConfig(): BrandConfig {
    return { ...this.config }
  }

  /**
   * 重置为默认配置
   */
  reset(): void {
    this.config = { ...this.defaultConfig }
    this.saveConfig()
    this.applyBranding()
  }

  /**
   * 导出配置
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2)
  }

  /**
   * 导入配置
   */
  importConfig(jsonString: string): void {
    try {
      const imported = JSON.parse(jsonString)
      this.config = {
        ...this.defaultConfig,
        ...imported,
      }
      this.saveConfig()
      this.applyBranding()
      console.log('[Branding] Config imported successfully')
    } catch (error) {
      console.error('[Branding] Failed to import config:', error)
      throw new Error('Invalid configuration format')
    }
  }

  /**
   * 上传Logo
   */
  async uploadLogo(file: File, type: 'primary' | 'favicon' | 'splash'): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        const base64 = reader.result as string

        if (type === 'primary') {
          this.config.logo.primary = base64
        } else if (type === 'favicon') {
          this.config.logo.favicon = base64
        } else if (type === 'splash') {
          this.config.logo.splashScreen = base64
        }

        this.saveConfig()
        this.applyBranding()

        resolve(base64)
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsDataURL(file)
    })
  }

  /**
   * 检查模块是否启用
   */
  isModuleEnabled(module: string): boolean {
    return this.config.features.modules.includes(module)
  }

  /**
   * 获取产品名称
   */
  getProductName(): string {
    return this.config.productName
  }

  /**
   * 获取Slogan
   */
  getSlogan(): string {
    return this.config.slogan
  }

  /**
   * 获取Logo URL
   */
  getLogo(): string {
    return this.config.logo.primary
  }
}

// 单例
export const brandingManager = new BrandingManager()
