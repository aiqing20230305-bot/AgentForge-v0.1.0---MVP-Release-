#!/bin/bash

# 新电脑上的验证脚本
# 用于检查解压后的项目完整性

echo "🔍 World of Claudecraft - 包完整性验证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查必要文件
echo "📋 检查关键文件..."
REQUIRED_FILES=(
  "package.json"
  "package-lock.json"
  "tsconfig.json"
  "vite.config.ts"
  ".env.example"
  "README.md"
  "DEPLOYMENT_SETUP.md"
  "PACKAGE_INFO.txt"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (缺失)"
    MISSING_FILES=$((MISSING_FILES + 1))
  fi
done

echo ""

# 检查目录
echo "📂 检查关键目录..."
REQUIRED_DIRS=(
  "src"
  "electron"
  "public"
  "scripts"
  "sample-components"
  "openclaw-components"
)

MISSING_DIRS=0
for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    FILE_COUNT=$(find "$dir" -type f | wc -l | xargs)
    echo "  ✅ $dir/ ($FILE_COUNT 文件)"
  else
    echo "  ❌ $dir/ (缺失)"
    MISSING_DIRS=$((MISSING_DIRS + 1))
  fi
done

echo ""

# 检查系统环境
echo "🔧 检查系统环境..."

# Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  echo "  ✅ Node.js: $NODE_VERSION"
  
  # 检查版本是否满足要求
  NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "  ⚠️  警告: Node.js 版本过低，建议使用 18.x 或更高版本"
  fi
else
  echo "  ❌ Node.js 未安装"
fi

# npm
if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  echo "  ✅ npm: v$NPM_VERSION"
else
  echo "  ❌ npm 未安装"
fi

# Git
if command -v git &> /dev/null; then
  GIT_VERSION=$(git --version)
  echo "  ✅ $GIT_VERSION"
else
  echo "  ⚠️  Git 未安装（可选）"
fi

echo ""

# 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $MISSING_FILES -eq 0 ] && [ $MISSING_DIRS -eq 0 ]; then
  echo "✨ 验证通过！项目包完整。"
  echo ""
  echo "🚀 下一步："
  echo "  1. npm install          # 安装依赖"
  echo "  2. npm run dev          # 启动开发服务器"
  echo ""
  echo "📚 详细说明请查看 DEPLOYMENT_SETUP.md"
else
  echo "❌ 验证失败！"
  echo "  缺失文件: $MISSING_FILES"
  echo "  缺失目录: $MISSING_DIRS"
  echo ""
  echo "请检查解压过程是否完整，或重新下载打包文件。"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
