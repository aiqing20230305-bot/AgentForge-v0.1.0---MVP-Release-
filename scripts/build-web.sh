#!/bin/bash

# AgentForge Web版构建脚本
# 优化的Web版构建流程

set -e

echo "🌐 Building AgentForge Web Version..."

# 1. 清理旧构建
echo "📦 Cleaning old build..."
rm -rf dist

# 2. 类型检查
echo "🔍 Type checking..."
npx tsc --noEmit

# 3. 构建
echo "🏗️  Building..."
npm run build

# 4. 生成Service Worker
echo "⚙️  Generating Service Worker..."
# Service Worker已经在src/serviceWorker.ts中定义
# Vite会自动处理

# 5. 优化构建产物
echo "⚡ Optimizing build..."

# 压缩HTML
if command -v html-minifier &> /dev/null; then
    find dist -name "*.html" -exec html-minifier --collapse-whitespace --remove-comments --minify-css --minify-js {} -o {} \;
fi

# 压缩图片 (如果安装了imagemin)
if command -v imagemin &> /dev/null; then
    imagemin dist/assets/images/* --out-dir=dist/assets/images
fi

# 6. 生成sitemap.xml
echo "🗺️  Generating sitemap..."
cat > dist/sitemap.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://agentforge.app/</loc>
    <lastmod>$(date +%Y-%m-%d)</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
EOF

# 7. 生成robots.txt
echo "🤖 Generating robots.txt..."
cat > dist/robots.txt << EOF
User-agent: *
Allow: /
Sitemap: https://agentforge.app/sitemap.xml
EOF

# 8. 复制Service Worker到根目录
echo "📋 Copying Service Worker..."
if [ -f "dist/serviceWorker.js" ]; then
    cp dist/serviceWorker.js dist/sw.js
fi

# 9. 生成build info
echo "ℹ️  Generating build info..."
cat > dist/build-info.json << EOF
{
  "version": "1.5.0-web",
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "commit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
  "branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')"
}
EOF

# 10. 计算构建大小
echo ""
echo "📊 Build Statistics:"
echo "-------------------"
if command -v du &> /dev/null; then
    TOTAL_SIZE=$(du -sh dist | cut -f1)
    echo "Total size: $TOTAL_SIZE"

    if [ -d "dist/assets" ]; then
        JS_SIZE=$(du -sh dist/assets/js 2>/dev/null | cut -f1 || echo "N/A")
        CSS_SIZE=$(du -sh dist/assets/css 2>/dev/null | cut -f1 || echo "N/A")
        IMG_SIZE=$(du -sh dist/assets/images 2>/dev/null | cut -f1 || echo "N/A")

        echo "JavaScript: $JS_SIZE"
        echo "CSS: $CSS_SIZE"
        echo "Images: $IMG_SIZE"
    fi
fi

# 11. 验证关键文件
echo ""
echo "✅ Verifying build..."
REQUIRED_FILES=(
    "dist/index.html"
    "dist/manifest.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    fi
done

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📦 Output directory: dist/"
echo "🚀 Ready to deploy!"
echo ""
echo "Preview build:"
echo "  npm run preview"
echo ""
echo "Deploy to:"
echo "  - Vercel:  vercel --prod"
echo "  - Netlify: netlify deploy --prod"
echo "  - Custom:  rsync -avz dist/ user@server:/var/www/agentforge/"
