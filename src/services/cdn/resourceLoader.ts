/**
 * Resource Loader - 资源预加载和优先级管理
 * 支持预加载、预连接、DNS 预解析等优化策略
 */

export type ResourcePriority = 'critical' | 'high' | 'medium' | 'low';

export interface PreloadOptions {
  as: 'script' | 'style' | 'font' | 'image' | 'fetch';
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  integrity?: string;
  priority?: ResourcePriority;
}

class ResourceLoader {
  private preloadedResources: Set<string> = new Set();
  private preconnectedOrigins: Set<string> = new Set();

  /**
   * 预加载关键资源
   */
  preload(href: string, options: PreloadOptions): void {
    if (this.preloadedResources.has(href)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = options.as;

    if (options.type) {
      link.setAttribute('type', options.type);
    }

    if (options.crossOrigin) {
      link.crossOrigin = options.crossOrigin;
    }

    if (options.integrity) {
      link.integrity = options.integrity;
    }

    // 设置优先级（实验性功能）
    if (options.priority) {
      link.setAttribute('importance', options.priority === 'critical' ? 'high' : options.priority);
    }

    document.head.appendChild(link);
    this.preloadedResources.add(href);

    console.log('[ResourceLoader] Preloaded:', href);
  }

  /**
   * 预连接到外部域名
   */
  preconnect(origin: string, crossOrigin: boolean = false): void {
    if (this.preconnectedOrigins.has(origin)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;

    if (crossOrigin) {
      link.crossOrigin = 'anonymous';
    }

    document.head.appendChild(link);
    this.preconnectedOrigins.add(origin);

    console.log('[ResourceLoader] Preconnected to:', origin);
  }

  /**
   * DNS 预解析
   */
  dnsPrefetch(origin: string): void {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = origin;
    document.head.appendChild(link);

    console.log('[ResourceLoader] DNS prefetch for:', origin);
  }

  /**
   * 预取资源（低优先级）
   */
  prefetch(href: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);

    console.log('[ResourceLoader] Prefetched:', href);
  }

  /**
   * 模块预加载
   */
  modulePreload(href: string): void {
    if (this.preloadedResources.has(href)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = href;

    document.head.appendChild(link);
    this.preloadedResources.add(href);

    console.log('[ResourceLoader] Module preloaded:', href);
  }

  /**
   * 批量预加载字体
   */
  preloadFonts(fonts: Array<{ href: string; type?: string }>): void {
    fonts.forEach(font => {
      this.preload(font.href, {
        as: 'font',
        type: font.type || 'font/woff2',
        crossOrigin: 'anonymous'
      });
    });
  }

  /**
   * 批量预加载关键图片
   */
  preloadImages(images: Array<{ href: string; type?: string }>): void {
    images.forEach(image => {
      this.preload(image.href, {
        as: 'image',
        type: image.type,
        priority: 'high'
      });
    });
  }

  /**
   * 预加载关键 CSS
   */
  preloadCSS(hrefs: string[]): void {
    hrefs.forEach(href => {
      this.preload(href, {
        as: 'style',
        priority: 'critical'
      });
    });
  }

  /**
   * 预加载关键 JavaScript
   */
  preloadJS(hrefs: string[]): void {
    hrefs.forEach(href => {
      this.preload(href, {
        as: 'script',
        priority: 'high'
      });
    });
  }

  /**
   * 初始化关键资源预加载
   */
  initCriticalResources(config: {
    cdnOrigins?: string[];
    apiOrigins?: string[];
    criticalFonts?: string[];
    criticalImages?: string[];
    criticalScripts?: string[];
    criticalStyles?: string[];
  }): void {
    console.log('[ResourceLoader] Initializing critical resources...');

    // 预连接到 CDN 和 API 域名
    config.cdnOrigins?.forEach(origin => {
      this.preconnect(origin, true);
    });

    config.apiOrigins?.forEach(origin => {
      this.preconnect(origin, true);
      this.dnsPrefetch(origin);
    });

    // 预加载关键资源
    if (config.criticalFonts?.length) {
      this.preloadFonts(
        config.criticalFonts.map(href => ({ href, type: 'font/woff2' }))
      );
    }

    if (config.criticalImages?.length) {
      this.preloadImages(
        config.criticalImages.map(href => ({ href }))
      );
    }

    if (config.criticalScripts?.length) {
      this.preloadJS(config.criticalScripts);
    }

    if (config.criticalStyles?.length) {
      this.preloadCSS(config.criticalStyles);
    }

    console.log('[ResourceLoader] Critical resources initialized');
  }

  /**
   * 动态加载脚本
   */
  async loadScript(src: string, options: { async?: boolean; defer?: boolean } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;

      if (options.async) {
        script.async = true;
      }

      if (options.defer) {
        script.defer = true;
      }

      script.onload = () => {
        console.log('[ResourceLoader] Script loaded:', src);
        resolve();
      };

      script.onerror = () => {
        console.error('[ResourceLoader] Failed to load script:', src);
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * 动态加载样式表
   */
  async loadStylesheet(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;

      link.onload = () => {
        console.log('[ResourceLoader] Stylesheet loaded:', href);
        resolve();
      };

      link.onerror = () => {
        console.error('[ResourceLoader] Failed to load stylesheet:', href);
        reject(new Error(`Failed to load stylesheet: ${href}`));
      };

      document.head.appendChild(link);
    });
  }

  /**
   * 检查资源是否已预加载
   */
  isPreloaded(href: string): boolean {
    return this.preloadedResources.has(href);
  }

  /**
   * 清除预加载记录
   */
  clear(): void {
    this.preloadedResources.clear();
    this.preconnectedOrigins.clear();
  }
}

// 单例实例
export const resourceLoader = new ResourceLoader();
