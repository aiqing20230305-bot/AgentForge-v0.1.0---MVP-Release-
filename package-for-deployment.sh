#!/bin/bash

# World of Claudecraft 打包脚本
# 用于将项目打包给新电脑部署

set -e

echo "🚀 开始打包 World of Claudecraft..."

# 项目名称和版本
PROJECT_NAME="world-of-claudecraft"
VERSION=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="${PROJECT_NAME}_${VERSION}"
TEMP_DIR="/tmp/${PACKAGE_NAME}"
OUTPUT_FILE="${HOME}/${PACKAGE_NAME}.tar.gz"

# 创建临时目录
echo "📁 创建临时目录: ${TEMP_DIR}"
rm -rf "${TEMP_DIR}"
mkdir -p "${TEMP_DIR}"

# 复制项目文件，排除不必要的内容
echo "📋 复制项目文件..."
rsync -av --progress \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='dist-electron' \
  --exclude='release' \
  --exclude='.git' \
  --exclude='.DS_Store' \
  --exclude='*.log' \
  --exclude='.env' \
  ./ "${TEMP_DIR}/"

# 确保关键文件存在
echo "✅ 验证关键文件..."
REQUIRED_FILES=(
  "package.json"
  "package-lock.json"
  ".env.example"
  "README.md"
  "DEPLOYMENT_SETUP.md"
  "tsconfig.json"
  "vite.config.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "${TEMP_DIR}/${file}" ]; then
    echo "❌ 缺少关键文件: ${file}"
    exit 1
  fi
done

# 添加打包信息
echo "📝 添加打包信息..."
cat > "${TEMP_DIR}/PACKAGE_INFO.txt" << EOF
项目名称: World of Claudecraft
打包时间: $(date '+%Y-%m-%d %H:%M:%S')
打包机器: $(hostname)
Git 分支: $(git branch --show-current 2>/dev/null || echo "N/A")
Git 提交: $(git rev-parse --short HEAD 2>/dev/null || echo "N/A")

========================================
部署说明
========================================
1. 解压: tar -xzf ${PACKAGE_NAME}.tar.gz
2. 进入: cd ${PROJECT_NAME}
3. 安装: npm install
4. 配置: cp .env.example .env (可选)
5. 启动: npm run dev

详细说明请查看 DEPLOYMENT_SETUP.md
EOF

# 计算项目大小
SOURCE_SIZE=$(du -sh "${TEMP_DIR}" | awk '{print $1}')
echo "📊 项目大小: ${SOURCE_SIZE}"

# 打包
echo "📦 正在压缩..."
cd /tmp
tar -czf "${OUTPUT_FILE}" "${PACKAGE_NAME}"

# 清理临时目录
echo "🧹 清理临时文件..."
rm -rf "${TEMP_DIR}"

# 显示结果
PACKAGE_SIZE=$(du -sh "${OUTPUT_FILE}" | awk '{print $1}')
echo ""
echo "✨ 打包完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 打包文件: ${OUTPUT_FILE}"
echo "💾 压缩前大小: ${SOURCE_SIZE}"
echo "💾 压缩后大小: ${PACKAGE_SIZE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 下一步操作："
echo "1. 将 ${PACKAGE_NAME}.tar.gz 复制到新电脑"
echo "2. 在新电脑上解压: tar -xzf ${PACKAGE_NAME}.tar.gz"
echo "3. 阅读 DEPLOYMENT_SETUP.md 开始部署"
echo ""
