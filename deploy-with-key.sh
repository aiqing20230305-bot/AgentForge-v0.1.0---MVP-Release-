#!/bin/bash

# AgentForge - 使用部署密钥发布
# 安全提示：密钥通过环境变量传递，不记录在历史中

cd ~/Downloads/world-of-claudecraft

echo "🚀 AgentForge - 自动发布"
echo "================================"
echo ""

# 检查密钥
if [ -z "$GITHUB_TOKEN" ]; then
    echo "请输入您的 GitHub Token/Deploy Key：SHA256:D3aFvXLqXrkJPpRvkkMX9k5VgFwqXJSYqV8Pe8c25CM"
    echo "（输入不会显示在屏幕上）"
    echo ""
    read -s -p "Token: " GITHUB_TOKEN
    export GITHUB_TOKEN
    echo ""
    echo ""
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ 未提供 Token"
    exit 1
fi

echo "✅ Token 已设置"
echo ""

# 推送主分支
echo "📤 [1/3] 推送代码到 GitHub..."
if git push https://${GITHUB_TOKEN}@github.com/Summonair/world-of-claudecraft.git main 2>&1 | grep -v "$GITHUB_TOKEN"; then
    echo "✅ 代码推送成功"
else
    echo "❌ 代码推送失败"
    exit 1
fi

echo ""

# 推送标签
echo "🏷️  [2/3] 推送标签 v0.1.0..."
if git push https://${GITHUB_TOKEN}@github.com/Summonair/world-of-claudecraft.git v0.1.0 --force 2>&1 | grep -v "$GITHUB_TOKEN"; then
    echo "✅ 标签推送成功"
else
    echo "❌ 标签推送失败"
    exit 1
fi

echo ""

# 创建 Release
echo "📝 [3/3] 创建 GitHub Release..."
if node scripts/auto-publish.js 2>&1; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 AgentForge 发布成功！"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📍 项目地址："
    echo "   https://github.com/Summonair/world-of-claudecraft"
    echo ""
    echo "🎊 恭喜！AgentForge 已成功开源！"
else
    echo "⚠️  Release 创建失败，请手动创建："
    echo "   https://github.com/Summonair/world-of-claudecraft/releases/new"
fi

# 清除密钥（安全）
unset GITHUB_TOKEN

echo ""
echo "✅ 完成！"
