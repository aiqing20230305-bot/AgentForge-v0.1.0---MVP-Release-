#!/bin/bash

# AgentForge - 一键发布到 GitHub

set -e

echo "🚀 AgentForge v0.1.0 - 一键发布"
echo "================================"
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查 Git 状态
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  警告：有未提交的更改"
    git status --short | head -10
    echo ""
    read -p "是否继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📋 当前状态："
echo "   分支：$(git branch --show-current)"
echo "   提交：$(git rev-parse --short HEAD)"
echo "   标签：$(git tag -l | tail -1)"
echo ""

# 推送代码
echo "📤 步骤 1/3：推送代码到 origin/main..."
if git push origin main 2>&1; then
    echo "✅ 主分支推送成功"
else
    echo "❌ 推送失败"
    echo ""
    echo "💡 可能的原因："
    echo "   1. 网络连接问题"
    echo "   2. 需要认证（使用 Personal Access Token）"
    echo "   3. 权限不足"
    echo ""
    echo "🔧 手动推送方法："
    echo "   git push origin main"
    echo ""
    exit 1
fi

echo ""

# 推送标签
echo "🏷️  步骤 2/3：推送标签 v0.1.0..."
if git push origin v0.1.0 --force 2>&1; then
    echo "✅ 标签推送成功"
else
    echo "❌ 标签推送失败"
    exit 1
fi

echo ""

# 创建 Release
echo "📝 步骤 3/3：创建 GitHub Release..."
echo ""
echo "⚠️  GitHub Release 创建需要 GitHub Token"
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo "请输入 GitHub Personal Access Token："
    echo "（生成地址：https://github.com/settings/tokens）"
    echo "（需要 'repo' 权限）"
    echo ""
    read -s -p "Token: " GITHUB_TOKEN
    echo ""
    echo ""
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  未提供 Token，跳过自动创建 Release"
    echo ""
    echo "📍 请手动创建 Release："
    echo "   https://github.com/Summonair/world-of-claudecraft/releases/new"
    echo ""
    echo "   使用 GITHUB_RELEASE_COPY.txt 的内容"
    echo ""
else
    # 使用 Node.js 脚本创建 Release
    GITHUB_TOKEN=$GITHUB_TOKEN node scripts/auto-publish.js
fi

echo ""
echo "🎊 AgentForge v0.1.0 发布完成！"
echo ""
echo "📍 项目地址："
echo "   https://github.com/Summonair/world-of-claudecraft"
echo ""
echo "🎉 恭喜！AgentForge 已开源！"
