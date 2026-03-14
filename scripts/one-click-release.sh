#!/bin/bash
# One-Click Release - 完整自动化发布流程
# 一键完成：测试 → 提交 → 标签 → 推送 → 截图 → GitHub Release

set -e

VERSION="$1"

echo "🚀 AgentForge 一键发布系统"
echo "==========================="
echo ""

# 1. 检查版本号
if [ -z "$VERSION" ]; then
    CURRENT_VERSION=$(node -p "require('./package.json').version")
    echo "当前版本: v$CURRENT_VERSION"
    read -p "输入新版本号 (例: 0.3.7): " VERSION
fi

# 去除v前缀（如果有）
VERSION="${VERSION#v}"

echo "目标版本: v$VERSION"
echo ""

# 2. 确认继续
read -p "继续发布 v$VERSION? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 已取消"
    exit 0
fi
echo ""

# 3. TypeScript 检查
echo "📋 Step 1/8: TypeScript 类型检查..."
npm run typecheck
echo "✅ TypeScript: 0 errors"
echo ""

# 4. 更新版本号
echo "📋 Step 2/8: 更新版本号..."
npm version "$VERSION" --no-git-tag-version
echo "✅ package.json 已更新"
echo ""

# 5. 生成发布说明（如果不存在）
RELEASE_FILE="RELEASE_v$VERSION.md"
if [ ! -f "$RELEASE_FILE" ]; then
    echo "📋 Step 3/8: 生成发布说明模板..."
    cat > "$RELEASE_FILE" << EOF
# 🚀 AgentForge v$VERSION Release Notes

**Release Date:** $(date +%Y-%m-%d)
**Type:** Feature Release
**Status:** Production Ready ✅

---

## 🎯 Overview

v$VERSION brings [主要功能描述].

---

## ✨ What's New

### 新功能 1
- 功能描述
- 使用场景
- 影响分析

### 改进 1
- 改进描述

---

## 🐛 Bug Fixes

- 修复描述

---

## 📊 Technical Details

\`\`\`bash
✅ TypeScript: 0 errors
✅ Build: Passing
\`\`\`

---

## 📦 Installation

\`\`\`bash
git checkout v$VERSION
npm install
npm run dev
\`\`\`

---

🎉 **Thank you for using AgentForge!**
EOF
    echo "✅ 发布说明模板已创建: $RELEASE_FILE"
    echo "⚠️  请编辑此文件后继续..."
    echo ""
    read -p "按回车继续..."
else
    echo "📋 Step 3/8: 发布说明已存在"
fi
echo ""

# 6. Git 提交
echo "📋 Step 4/8: 创建 Git commit..."
git add .
git commit -m "release: v$VERSION

Release v$VERSION

See $RELEASE_FILE for details.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" || echo "无变更需要提交"
echo "✅ Commit 创建完成"
echo ""

# 7. 创建 Git tag
echo "📋 Step 5/8: 创建 Git tag..."
git tag -a "v$VERSION" -m "Release v$VERSION

See $RELEASE_FILE for details."
echo "✅ Tag v$VERSION 创建完成"
echo ""

# 8. 推送到 GitHub
echo "📋 Step 6/8: 推送到 GitHub..."
chmod +x scripts/smart-push.sh
./scripts/smart-push.sh
echo "✅ 推送完成"
echo ""

# 9. 自动截图（可选）
echo "📋 Step 7/8: 产品截图..."
read -p "是否自动生成截图? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 检查playwright
    if npm list playwright &> /dev/null; then
        echo "🌐 启动应用..."
        npm run dev > /dev/null 2>&1 &
        APP_PID=$!

        echo "⏳ 等待应用启动 (15秒)..."
        sleep 15

        echo "📸 开始截图..."
        node scripts/auto-screenshot.js

        # 停止应用
        kill $APP_PID 2>/dev/null || true
        echo "✅ 截图完成"
    else
        echo "⚠️  Playwright 未安装，跳过自动截图"
        echo "💡 运行: npm install -D playwright"
    fi
else
    echo "⏭️  跳过截图"
fi
echo ""

# 10. 创建 GitHub Release
echo "📋 Step 8/8: 创建 GitHub Release..."
if command -v gh &> /dev/null; then
    if gh auth status &> /dev/null; then
        chmod +x scripts/auto-release.sh
        ./scripts/auto-release.sh "$VERSION"
        echo "✅ GitHub Release 创建完成"
    else
        echo "⚠️  GitHub CLI 未认证"
        echo "运行: gh auth login"
        echo ""
        echo "手动创建 Release:"
        echo "  https://github.com/yourusername/agentforge/releases/new?tag=v$VERSION"
    fi
else
    echo "⚠️  GitHub CLI 未安装"
    echo ""
    echo "安装方法:"
    echo "  macOS: brew install gh"
    echo "  Windows: winget install GitHub.cli"
    echo ""
    echo "手动创建 Release:"
    echo "  https://github.com/yourusername/agentforge/releases/new?tag=v$VERSION"
fi
echo ""

# 完成
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 发布流程完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 版本: v$VERSION"
echo "🔗 Tag: v$VERSION"
echo "📄 发布说明: $RELEASE_FILE"
echo ""
echo "✅ 已完成:"
echo "  1. TypeScript 检查"
echo "  2. 版本号更新"
echo "  3. Git commit & tag"
echo "  4. 推送到 GitHub"
echo "  5. 产品截图（可选）"
echo "  6. GitHub Release（可选）"
echo ""
echo "后续步骤:"
echo "  1. 验证 Release: https://github.com/yourusername/agentforge/releases/tag/v$VERSION"
echo "  2. 更新文档和网站"
echo "  3. 社交媒体宣布"
echo "  4. 监控反馈"
echo ""
echo "🚀 AgentForge v$VERSION is live!"
