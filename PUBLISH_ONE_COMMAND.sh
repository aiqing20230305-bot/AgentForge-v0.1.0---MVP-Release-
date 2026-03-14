#!/bin/bash

# AgentForge - 一键发布（只需替换 token）
# 将下面的 YOUR_TOKEN_HERE 替换为您的 GitHub Personal Access Token

TOKEN="YOUR_TOKEN_HERE"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 如果没有 Token，现在生成（2 分钟）：
# https://github.com/settings/tokens
# → Generate new token (classic)
# → 勾选 repo 权限
# → 复制 token 替换上面的 YOUR_TOKEN_HERE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if [ "$TOKEN" = "YOUR_TOKEN_HERE" ]; then
    echo "❌ 请先将 TOKEN 替换为您的 GitHub Personal Access Token"
    echo ""
    echo "生成 Token："
    echo "  https://github.com/settings/tokens"
    echo ""
    echo "然后编辑此文件，替换第 5 行的 YOUR_TOKEN_HERE"
    exit 1
fi

cd ~/Downloads/world-of-claudecraft

echo "🚀 AgentForge v0.1.0 - 开始发布..."
echo ""

# 推送主分支
echo "📤 推送代码..."
git push https://${TOKEN}@github.com/Summonair/world-of-claudecraft.git main

echo "✅ 代码推送成功"
echo ""

# 推送标签
echo "🏷️  推送标签..."
git push https://${TOKEN}@github.com/Summonair/world-of-claudecraft.git v0.1.0 --force

echo "✅ 标签推送成功"
echo ""

# 创建 Release
echo "📝 创建 Release..."
GITHUB_TOKEN=$TOKEN node scripts/auto-publish.js

echo ""
echo "🎉 发布完成！"
echo ""
echo "📍 查看项目："
echo "   https://github.com/Summonair/world-of-claudecraft"
echo ""
echo "🎊 AgentForge 已成功开源！"
