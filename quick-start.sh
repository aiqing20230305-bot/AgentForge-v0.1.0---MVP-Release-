#!/bin/bash

# AgentForge - 快速启动脚本
# Quick start script for testing before release

echo "🏰 AgentForge - Quick Start"
echo "=================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装：https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js $(node --version)"
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    echo ""
fi

# 运行验证
echo "🔍 运行环境验证..."
node scripts/verify-setup.js
echo ""

# 询问启动模式
echo "🚀 选择启动模式："
echo "  1) Electron 应用（推荐）"
echo "  2) Web 版本"
echo ""
read -p "请选择 (1/2): " choice

case $choice in
    1)
        echo ""
        echo "🚀 启动 Electron 应用..."
        echo "   如果看到窗口，说明一切正常！"
        echo ""
        npm run electron:dev
        ;;
    2)
        echo ""
        echo "🌐 启动 Web 版本..."
        echo "   浏览器将自动打开 http://localhost:5173"
        echo ""
        npm run dev
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac
