#!/bin/bash

# AgentForge - 清理敏感数据和测试文件

cd "$(dirname "$0")/.."

echo "🧹 清理敏感数据和测试文件..."
echo ""

# 1. 删除包含真实密钥/隐私的文档
SENSITIVE_FILES=(
  "上海小龙虾OpenClaw连接状态.md"
  "deploy-with-key.sh"
  "PUBLISH_ONE_COMMAND.sh"
  ".publish-helper.txt"
  "debug-tasks.html"
)

echo "📝 删除包含隐私数据的文件..."
for file in "${SENSITIVE_FILES[@]}"; do
  if [ -f "$file" ]; then
    rm "$file"
    echo "  ✓ 删除: $file"
  fi
done

# 2. 删除测试数据文件
echo ""
echo "🗑️  删除测试数据..."
rm -f test-*.json test-*.html debug-*.html *.local *.bak

# 3. 清理临时和缓存文件
echo ""
echo "🧹 清理临时文件..."
find . -name ".DS_Store" -delete
find . -name "*.bak" -delete
find . -name "*.tmp" -delete
find . -name "*~" -delete

# 4. 确保 .env 被忽略
echo ""
echo "🔒 检查环境变量文件..."
if [ -f ".env" ]; then
    echo "  ⚠️  警告：发现 .env 文件，应该删除或确认不含敏感数据"
    echo "  .env 内容预览："
    head -5 .env | sed 's/\(.*=\).*/\1***/'
fi

# 5. 检查是否还有硬编码的密钥
echo ""
echo "🔍 扫描硬编码密钥..."
FOUND_KEYS=0

# 检查明显的密钥模式
if grep -r "ghp_\|github_pat_\|sk-\|pk-" --include="*.md" --include="*.json" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -v ".git"; then
    echo "  ⚠️  警告：发现可能的硬编码密钥"
    FOUND_KEYS=1
fi

# 检查飞书配置
if grep -r "cli_a906f00e64785bd9\|9KM2QqlzirWBkYHrsqR16b" --include="*.md" . 2>/dev/null | grep -v node_modules; then
    echo "  ⚠️  警告：发现飞书配置，建议移除"
    FOUND_KEYS=1
fi

if [ $FOUND_KEYS -eq 0 ]; then
    echo "  ✓ 未发现硬编码密钥"
fi

# 6. 更新 .gitignore
echo ""
echo "📝 更新 .gitignore..."
cat >> .gitignore <<'EOF'

# Sensitive data
.env
.env.*
!.env.example
*.secret
*.key
*.pem
openclaw.json
上海小龙虾*.md
*密钥*.md
*token*.txt
*secret*.txt

# Test and debug files
debug-*.html
test-*.json
*.local
EOF

echo "  ✓ .gitignore 已更新"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 清理完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "建议检查："
echo "  1. 查看删除的文件列表"
echo "  2. 运行 git status 确认"
echo "  3. 提交更改"
echo ""
