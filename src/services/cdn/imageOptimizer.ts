/**
 * Image Optimizer - 图片优化和 CDN 处理
 * 支持 WebP/AVIF 格式转换和智能压缩
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  background?: string;
  blur?: number;
  sharpen?: boolean;
}

export interface OptimizedImage {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

class ImageOptimizer {
  private cdnBaseUrl: string = '';
  private supportedFormats: Set<string> = new Set();

  constructor() {
    this.detectFormatSupport();
  }

  /**
   * 设置 CDN 基础 URL
   */
  setCDNBaseUrl(url: string): void {
    this.cdnBaseUrl = url;
  }

  /**
   * 检测浏览器支持的图片格式
   */
  private async detectFormatSupport(): Promise<void> {
    // 检测 WebP 支持
    if (await this.checkFormatSupport('webp')) {
      this.supportedFormats.add('webp');
    }

    // 检测 AVIF 支持
    if (await this.checkFormatSupport('avif')) {
      this.supportedFormats.add('avif');
    }

    // JPEG 和 PNG 总是支持
    this.supportedFormats.add('jpeg');
    this.supportedFormats.add('png');
  }

  /**
   * 检查特定格式支持
   */
  private async checkFormatSupport(format: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width > 0 && img.height > 0);
      img.onerror = () => resolve(false);

      // 测试图片数据
      const testImages: Record<string, string> = {
        webp: 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
        avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A='
      };

      img.src = testImages[format] || '';
    });
  }

  /**
   * 优化图片 URL
   */
  optimizeImageUrl(originalUrl: string, options: ImageOptimizationOptions = {}): string {
    // 如果是外部 URL，直接返回
    if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
      return this.buildCloudflareImageUrl(originalUrl, options);
    }

    // 内部图片，添加 CDN 前缀
    const cdnUrl = this.cdnBaseUrl ? `${this.cdnBaseUrl}${originalUrl}` : originalUrl;
    return this.buildCloudflareImageUrl(cdnUrl, options);
  }

  /**
   * 构建 Cloudflare Image Resizing URL
   */
  private buildCloudflareImageUrl(url: string, options: ImageOptimizationOptions): string {
    const params: string[] = [];

    // 格式转换
    const format = options.format === 'auto' ? this.getBestFormat() : options.format;
    if (format) {
      params.push(`f=${format}`);
    }

    // 尺寸调整
    if (options.width) {
      params.push(`w=${options.width}`);
    }
    if (options.height) {
      params.push(`h=${options.height}`);
    }

    // 质量
    if (options.quality) {
      params.push(`q=${options.quality}`);
    }

    // 适应模式
    if (options.fit) {
      params.push(`fit=${options.fit}`);
    }

    // 背景色
    if (options.background) {
      params.push(`bg=${options.background.replace('#', '')}`);
    }

    // 模糊
    if (options.blur) {
      params.push(`blur=${options.blur}`);
    }

    // 锐化
    if (options.sharpen) {
      params.push('sharpen=1');
    }

    // 使用 Cloudflare Image Resizing
    if (params.length > 0 && this.cdnBaseUrl) {
      return `${this.cdnBaseUrl}/cdn-cgi/image/${params.join(',')}/${url}`;
    }

    return url;
  }

  /**
   * 获取最佳支持格式
   */
  private getBestFormat(): string | null {
    if (this.supportedFormats.has('avif')) {
      return 'avif';
    }
    if (this.supportedFormats.has('webp')) {
      return 'webp';
    }
    return null;
  }

  /**
   * 生成响应式图片源集
   */
  generateSrcSet(originalUrl: string, widths: number[], options: ImageOptimizationOptions = {}): string {
    return widths
      .map(width => {
        const url = this.optimizeImageUrl(originalUrl, { ...options, width });
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  /**
   * 预加载关键图片
   */
  preloadImages(urls: string[], options: ImageOptimizationOptions = {}): void {
    urls.forEach(url => {
      const optimizedUrl = this.optimizeImageUrl(url, options);
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedUrl;

      // 添加 imagesrcset 和 imagesizes 以支持响应式
      if (options.width) {
        link.setAttribute('imagesrcset', this.generateSrcSet(url, [options.width, options.width * 2]));
      }

      document.head.appendChild(link);
    });
  }

  /**
   * 懒加载图片
   */
  setupLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  /**
   * 检测格式支持情况
   */
  getSupportedFormats(): string[] {
    return Array.from(this.supportedFormats);
  }
}

// 单例实例
export const imageOptimizer = new ImageOptimizer();
