#!/bin/bash
# Pre-release 自动检查清单
# AgentForge 发布前验证脚本

set -e  # Exit on error

echo "🔍 执行发布前检查..."
echo ""

# 1. Git 工作树清洁度
echo "📋 检查 1/7: Git 工作树清洁度..."
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ 工作树不干净，有未提交的更改："
  git status --short
  echo ""
  echo "请先提交或暂存所有更改后再发布"
  exit 1
fi
echo "✅ Git 工作树干净"
echo ""

# 2. 分支验证
echo "📋 检查 2/7: 验证当前分支..."
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
  echo "❌ 必须在 main 分支发布（当前分支: $current_branch）"
  echo "   请切换到 main 分支: git checkout main"
  exit 1
fi
echo "✅ 当前在 main 分支"
echo ""

# 3. 前后端版本号一致性
echo "📋 检查 3/7: 版本号一致性..."
frontend_version=$(node -p "require('./package.json').version")
backend_version=$(node -p "require('./backend/package.json').version")
if [ "$frontend_version" != "$backend_version" ]; then
  echo "❌ 版本号不一致:"
  echo "   前端: $frontend_version"
  echo "   后端: $backend_version"
  echo ""
  echo "   请同步更新版本号"
  exit 1
fi
echo "✅ 版本号一致: v$frontend_version"
echo ""

# 4. TypeScript 编译检查
echo "📋 检查 4/7: TypeScript 编译..."
if npm run typecheck > /tmp/typecheck.log 2>&1; then
  echo "✅ TypeScript 编译通过"
else
  echo "❌ TypeScript 编译失败"
  echo ""
  cat /tmp/typecheck.log
  exit 1
fi
echo ""

# 5. 测试通过
echo "📋 检查 5/7: 运行测试..."
if grep -q '"test":' package.json; then
  if npm run test > /tmp/test.log 2>&1; then
    echo "✅ 所有测试通过"
  else
    echo "❌ 测试失败"
    echo ""
    cat /tmp/test.log
    exit 1
  fi
else
  echo "⚠️  未配置测试脚本，跳过"
fi
echo ""

# 6. 构建成功
echo "📋 检查 6/7: 构建验证..."
echo "   (这可能需要几分钟...)"
if npm run build > /tmp/build.log 2>&1; then
  echo "✅ 构建成功"
  # 检查构建产物
  if [ -d "dist" ]; then
    dist_size=$(du -sh dist | cut -f1)
    echo "   构建大小: $dist_size"
  fi
else
  echo "❌ 构建失败"
  echo ""
  tail -50 /tmp/build.log
  exit 1
fi
echo ""

# 7. 截图完整性
echo "📋 检查 7/7: 截图完整性..."
if [ -d "screenshots" ]; then
  screenshot_count=$(ls screenshots/*.png 2>/dev/null | wc -l | tr -d ' ')
  if [ "$screenshot_count" -ge 5 ]; then
    echo "✅ 截图完整（共 $screenshot_count 张）"
    ls -1 screenshots/*.png 2>/dev/null | sed 's/^/   - /'
  else
    echo "⚠️  截图不足（仅 $screenshot_count 张），建议补充"
    echo "   运行: npm run screenshots"
  fi
else
  echo "⚠️  screenshots 目录不存在"
  echo "   建议创建产品截图"
fi
echo ""

# 额外检查：CHANGELOG 更新
echo "📋 额外检查: CHANGELOG..."
if [ -f "CHANGELOG.md" ]; then
  if grep -q "$frontend_version" CHANGELOG.md; then
    echo "✅ CHANGELOG 包含当前版本"
  else
    echo "⚠️  CHANGELOG 未包含 v$frontend_version 的更新日志"
  fi
else
  echo "⚠️  CHANGELOG.md 不存在"
fi
echo ""

# 最终报告
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 所有关键检查通过！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "准备发布 v$frontend_version"
echo ""
echo "建议的发布步骤："
echo "  1. 创建 git tag: git tag v$frontend_version"
echo "  2. 推送代码: git push origin main --tags"
echo "  3. 创建 GitHub Release"
echo "  4. 更新文档和宣传材料"
echo ""

exit 0
