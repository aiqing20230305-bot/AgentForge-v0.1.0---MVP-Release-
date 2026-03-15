#!/bin/bash

# AgentForge v1.1.0 自动化创建 GitHub Release 脚本

echo "🚀 AgentForge v1.1.0 Release 自动化脚本"
echo "========================================"
echo ""

# 检查 gh CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI 未安装"
    echo "请运行: brew install gh"
    exit 1
fi

# 检查认证状态
echo "📋 检查 GitHub 认证状态..."
if ! gh auth status &> /dev/null; then
    echo ""
    echo "⚠️  未登录 GitHub"
    echo ""
    echo "请选择认证方式："
    echo "1. 使用 Personal Access Token"
    echo "2. 使用浏览器登录（可能需要稳定网络）"
    echo ""
    read -p "选择 (1/2): " auth_choice

    if [ "$auth_choice" = "1" ]; then
        echo ""
        echo "📝 创建 Personal Access Token："
        echo "   1. 访问: https://github.com/settings/tokens/new"
        echo "   2. 勾选 'repo' 权限"
        echo "   3. 生成 Token 并复制"
        echo ""
        read -p "请输入 Token: " github_token
        echo "$github_token" | gh auth login --with-token
    else
        echo ""
        echo "🌐 正在打开浏览器登录..."
        gh auth login --web
    fi
fi

# 验证认证成功
if ! gh auth status &> /dev/null; then
    echo "❌ 认证失败，请重试"
    exit 1
fi

echo "✅ GitHub 认证成功"
echo ""

# 创建 Release
echo "📦 正在创建 v1.1.0 Release..."
echo ""

# 检查截图文件
SCREENSHOT_DIR="screenshots/v1.1.0"
if [ ! -d "$SCREENSHOT_DIR" ]; then
    echo "❌ 截图目录不存在: $SCREENSHOT_DIR"
    exit 1
fi

SCREENSHOT_COUNT=$(ls -1 "$SCREENSHOT_DIR"/*.png 2>/dev/null | wc -l)
if [ "$SCREENSHOT_COUNT" -lt 7 ]; then
    echo "❌ 截图数量不足: 找到 $SCREENSHOT_COUNT 张，需要 7 张"
    exit 1
fi

echo "✅ 找到 $SCREENSHOT_COUNT 张截图"
echo ""

# 检查发布说明文件
RELEASE_NOTES="release/RELEASE_NOTES_v1.1.0.md"
if [ ! -f "$RELEASE_NOTES" ]; then
    echo "❌ 发布说明文件不存在: $RELEASE_NOTES"
    exit 1
fi

echo "✅ 发布说明文件就绪"
echo ""

# 创建 Release
echo "🎯 开始创建 Release..."
gh release create v1.1.0 \
  screenshots/v1.1.0/*.png \
  --title "v1.1.0 - Core Evolution System 🫀" \
  --notes-file "$RELEASE_NOTES" \
  --repo aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Release 创建成功！"
    echo ""
    echo "🔗 查看 Release:"
    echo "   https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-/releases/tag/v1.1.0"
    echo ""
else
    echo ""
    echo "❌ Release 创建失败"
    echo ""
    echo "📋 手动创建步骤："
    echo "   1. 访问: https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-/releases/new"
    echo "   2. 选择标签: v1.1.0"
    echo "   3. 标题: v1.1.0 - Core Evolution System 🫀"
    echo "   4. 复制描述: cat release/RELEASE_NOTES_v1.1.0.md"
    echo "   5. 上传截图: screenshots/v1.1.0/ (7张)"
    echo "   6. 勾选 'Set as the latest release'"
    echo "   7. 点击 'Publish release'"
    echo ""
    exit 1
fi
