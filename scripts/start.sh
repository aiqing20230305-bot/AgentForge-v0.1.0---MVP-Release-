#!/bin/bash

echo "🦞⚔️ World of Claudecraft - OpenClaw Edition"
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# 启动开发服务器
echo "🚀 Starting development server..."
echo ""
echo "✨ Application will open automatically"
echo "📁 OpenClaw components: ./openclaw-components"
echo "🎮 Use Settings (⚙️) to load components"
echo ""

npm run dev
