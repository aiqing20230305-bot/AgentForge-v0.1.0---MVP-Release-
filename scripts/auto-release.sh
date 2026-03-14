#!/bin/bash
# Automated GitHub Release using gh CLI
# 使用gh CLI自动创建GitHub Release

set -e

VERSION="$1"
if [ -z "$VERSION" ]; then
    # 从package.json读取版本
    VERSION=$(node -p "require('./package.json').version")
fi

echo "🚀 Automated GitHub Release"
echo "=========================="
echo "Version: v$VERSION"
echo ""

# 检查gh CLI是否安装
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) 未安装"
    echo ""
    echo "📦 安装方法:"
    echo ""
    echo "macOS:"
    echo "  brew install gh"
    echo ""
    echo "Windows:"
    echo "  winget install --id GitHub.cli"
    echo "  或 scoop install gh"
    echo ""
    echo "Linux:"
    echo "  参考: https://github.com/cli/cli#installation"
    echo ""
    exit 1
fi

# 检查gh认证
if ! gh auth status &> /dev/null; then
    echo "🔐 GitHub CLI 未认证"
    echo ""
    echo "请运行: gh auth login"
    echo ""
    gh auth login
fi

echo "✅ GitHub CLI 已认证"
echo ""

# 检查tag是否存在
if ! git tag -l | grep -q "^v$VERSION$"; then
    echo "❌ Tag v$VERSION 不存在"
    echo ""
    echo "请先创建tag:"
    echo "  git tag -a v$VERSION -m 'Release v$VERSION'"
    exit 1
fi

echo "✅ Tag v$VERSION 已存在"
echo ""

# 检查是否已推送
if ! git ls-remote --tags origin | grep -q "refs/tags/v$VERSION"; then
    echo "📤 Tag未推送，正在推送..."
    ./scripts/smart-push.sh
    echo ""
fi

# 读取发布说明
RELEASE_NOTES_FILE="RELEASE_v$VERSION.md"
if [ ! -f "$RELEASE_NOTES_FILE" ]; then
    echo "⚠️  发布说明文件不存在: $RELEASE_NOTES_FILE"
    echo "使用默认发布说明..."
    RELEASE_NOTES="Release v$VERSION

See CHANGELOG.md for details."
else
    RELEASE_NOTES=$(cat "$RELEASE_NOTES_FILE")
fi

echo "📝 准备创建GitHub Release..."
echo ""

# 创建Release
if gh release view "v$VERSION" &> /dev/null; then
    echo "⚠️  Release v$VERSION 已存在"
    read -p "是否删除并重新创建? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gh release delete "v$VERSION" -y
        echo "🗑️  已删除旧Release"
    else
        echo "❌ 取消操作"
        exit 1
    fi
fi

# 创建新Release
echo "🎉 创建GitHub Release v$VERSION..."
gh release create "v$VERSION" \
    --title "v$VERSION - $(grep -m 1 '^#' $RELEASE_NOTES_FILE | sed 's/# //' || echo 'Release')" \
    --notes "$RELEASE_NOTES" \
    --draft=false \
    --prerelease=false

echo ""
echo "✅ GitHub Release创建成功！"
echo ""

# 上传截图（如果存在）
SCREENSHOT_DIR="docs/screenshots/v$VERSION"
if [ -d "$SCREENSHOT_DIR" ]; then
    echo "📸 上传产品截图..."
    SCREENSHOTS=$(find "$SCREENSHOT_DIR" -name "*.png" -o -name "*.jpg" -o -name "*.gif")
    if [ -n "$SCREENSHOTS" ]; then
        gh release upload "v$VERSION" $SCREENSHOTS
        echo "✅ 截图上传完成"
    fi
    echo ""
fi

# 上传构建产物（如果存在）
if [ -d "dist" ]; then
    echo "📦 检查构建产物..."
    BUILD_FILES=$(find dist -name "*.dmg" -o -name "*.exe" -o -name "*.AppImage" -o -name "*.zip")
    if [ -n "$BUILD_FILES" ]; then
        read -p "是否上传构建产物? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            gh release upload "v$VERSION" $BUILD_FILES
            echo "✅ 构建产物上传完成"
        fi
    fi
    echo ""
fi

# 显示Release URL
RELEASE_URL=$(gh release view "v$VERSION" --json url -q .url)
echo "🔗 Release URL:"
echo "   $RELEASE_URL"
echo ""

# 统计信息
echo "📊 Release统计:"
gh release view "v$VERSION" --json tagName,createdAt,author,assets --jq '{
  tag: .tagName,
  created: .createdAt,
  author: .author.login,
  assets: (.assets | length)
}'
echo ""

echo "🎊 发布流程完成！"
echo ""
echo "后续步骤:"
echo "  1. 验证Release页面: $RELEASE_URL"
echo "  2. 更新项目网站/文档"
echo "  3. 在社交媒体宣布"
echo "  4. 监控Issues和反馈"
