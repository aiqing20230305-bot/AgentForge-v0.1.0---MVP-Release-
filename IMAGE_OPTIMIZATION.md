# 图片优化指南

## 背景
图片是Web应用中最大的资源类型之一。优化图片可以显著提升首屏加载速度。

## 优化策略

### 1. 使用WebP格式
WebP格式比JPEG/PNG小30-50%，且质量相当。

**工具安装：**
```bash
# macOS
brew install webp

# Ubuntu/Debian
apt-get install webp

# 或使用在线工具：
# https://squoosh.app/
```

**转换命令：**
```bash
# PNG转WebP
cwebp input.png -q 80 -o output.webp

# JPEG转WebP
cwebp input.jpg -q 80 -o output.webp

# 批量转换
for file in public/images/*.{png,jpg}; do
  cwebp "$file" -q 80 -o "${file%.*}.webp"
done
```

### 2. 响应式图片
使用`<picture>`标签提供多种格式和尺寸：

```html
<picture>
  <!-- WebP优先 -->
  <source srcset="/images/hero.webp" type="image/webp">
  <!-- 降级到JPEG -->
  <img src="/images/hero.jpg" alt="Hero" loading="lazy">
</picture>
```

### 3. 懒加载
对非关键图片使用`loading="lazy"`：

```html
<img src="agent.png" alt="Agent" loading="lazy">
```

### 4. 尺寸优化
- **Logo/图标：** 100x100px → ~10KB
- **缩略图：** 300x300px → ~30KB
- **Banner：** 1200x600px → ~100KB

### 5. CDN加速
将图片托管到CDN（Cloudflare、Vercel等）：

```tsx
const imageUrl = process.env.CDN_URL + '/images/agent.webp'
```

## 当前图片资源

### 需要优化的图片：
- `/public/icon.png` - 应用图标
- `/public/og-image.png` - Open Graph图片
- `/public/twitter-image.png` - Twitter Card图片
- Agent头像emoji（无需优化，体积已很小）

### 优化步骤：
1. 导出高清PNG版本
2. 转换为WebP格式
3. 使用`<picture>`标签
4. 添加`loading="lazy"`

## Vite配置
在`vite.config.ts`中配置图片优化：

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (/\.(png|jpe?g|svg|gif|webp)$/.test(assetInfo.name || '')) {
            return 'assets/images/[name]-[hash][extname]'
          }
          return 'assets/[ext]/[name]-[hash][extname]'
        }
      }
    }
  }
})
```

## 监控指标

### Lighthouse检查项：
- ✅ Properly size images
- ✅ Serve images in next-gen formats (WebP)
- ✅ Efficiently encode images
- ✅ Use lazy loading

### 目标：
- 图片总大小 < 500KB
- 单张图片 < 100KB
- 首屏图片 < 50KB

## 自动化
使用GitHub Action自动优化上传的图片：

```yaml
# .github/workflows/image-optimization.yml
name: Optimize Images

on:
  pull_request:
    paths:
      - 'public/images/**'

jobs:
  optimize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: calibreapp/image-actions@main
        with:
          githubToken: ${{ secrets.GITHUB_TOKEN }}
```

## 参考资源
- [WebP官方文档](https://developers.google.com/speed/webp)
- [Squoosh.app](https://squoosh.app/) - 在线图片压缩工具
- [TinyPNG](https://tinypng.com/) - PNG压缩工具
