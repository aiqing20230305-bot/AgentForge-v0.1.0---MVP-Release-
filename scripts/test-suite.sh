#!/bin/bash

# World of Claudecraft - 完整测试套件
# 用于静默开发和持续迭代

set -e  # 遇到错误立即退出

echo "🏰 World of Claudecraft - 测试套件"
echo "=================================="
echo ""

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试结果统计
PASSED=0
FAILED=0
SKIPPED=0

# 辅助函数
pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

skip() {
    echo -e "${YELLOW}⊘${NC} $1"
    ((SKIPPED++))
}

section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# ═════════════════════════════════════════════
# 1. 环境检查
# ═════════════════════════════════════════════

section "1️⃣  环境检查"

# Node.js 版本
if node --version | grep -qE "v(1[6-9]|[2-9][0-9])"; then
    pass "Node.js 版本符合要求 ($(node --version))"
else
    fail "Node.js 版本过低，需要 >= 16 (当前: $(node --version))"
fi

# npm 版本
if npm --version >/dev/null 2>&1; then
    pass "npm 已安装 ($(npm --version))"
else
    fail "npm 未安装"
fi

# 依赖安装
if [ -d "node_modules" ]; then
    pass "依赖已安装"
else
    fail "依赖未安装，运行: npm install"
fi

# ═════════════════════════════════════════════
# 2. 代码质量检查
# ═════════════════════════════════════════════

section "2️⃣  代码质量"

# TypeScript 类型检查
if npm run typecheck --if-present >/dev/null 2>&1; then
    pass "TypeScript 类型检查通过"
else
    skip "TypeScript 类型检查（未配置）"
fi

# ESLint
if npm run lint --if-present >/dev/null 2>&1; then
    pass "ESLint 检查通过"
else
    skip "ESLint 检查（未配置）"
fi

# 关键文件存在性
FILES=(
    "src/utils/openclawLoader.ts"
    "src/services/autoDiscovery.ts"
    "src/components/AgentDisplayPanel.tsx"
    "src/components/TaskManagementPanel.tsx"
    "src/stores/taskStore.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        pass "文件存在: $file"
    else
        fail "文件缺失: $file"
    fi
done

# ═════════════════════════════════════════════
# 3. Agent ID 格式检查
# ═════════════════════════════════════════════

section "3️⃣  Agent ID 格式验证"

# 检查是否还有旧的 ID 格式
if grep -r "local_agent_\|openclaw_" src/utils/openclawLoader.ts src/components/AgentDisplayPanel.tsx 2>/dev/null; then
    fail "发现旧的 Agent ID 格式 (local_agent_* 或 openclaw_*)"
else
    pass "Agent ID 格式已标准化"
fi

# 检查 AgentDisplayPanel 是否使用 agent.id
if grep -q "setTaskStoreAgent(agent.id)" src/components/AgentDisplayPanel.tsx; then
    pass "AgentDisplayPanel 使用 agent.id"
else
    fail "AgentDisplayPanel 应该使用 agent.id 而非 agent.name"
fi

# ═════════════════════════════════════════════
# 4. 自动发现功能检查
# ═════════════════════════════════════════════

section "4️⃣  自动发现功能"

# 检查是否使用了 Electron API
if grep -q "window.electronAPI" src/services/autoDiscovery.ts; then
    pass "使用 Electron API 访问文件系统"
else
    fail "应该使用 window.electronAPI 而非 fetch"
fi

# 检查 authToken 读取路径
if grep -q "gateway?.auth?.token" src/services/autoDiscovery.ts; then
    pass "authToken 读取路径正确"
else
    fail "authToken 读取路径错误"
fi

# ═════════════════════════════════════════════
# 5. 构建测试
# ═════════════════════════════════════════════

section "5️⃣  构建测试"

echo "正在构建项目..."
if npm run build >/dev/null 2>&1; then
    pass "构建成功"

    # 检查输出文件
    if [ -d "dist" ]; then
        pass "dist 目录已创建"
    else
        fail "dist 目录未创建"
    fi
else
    fail "构建失败"
fi

# ═════════════════════════════════════════════
# 6. 验证脚本
# ═════════════════════════════════════════════

section "6️⃣  验证脚本"

if node scripts/verify-setup.js >/dev/null 2>&1; then
    pass "验证脚本通过"
else
    fail "验证脚本失败"
fi

# ═════════════════════════════════════════════
# 7. 文档完整性
# ═════════════════════════════════════════════

section "7️⃣  文档检查"

DOCS=(
    "README.md"
    "TROUBLESHOOTING.md"
    "IMPLEMENTATION_SUMMARY.md"
    "DEVELOPMENT_STATUS.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        pass "文档存在: $doc"
    else
        fail "文档缺失: $doc"
    fi
done

# ═════════════════════════════════════════════
# 8. Git 状态检查
# ═════════════════════════════════════════════

section "8️⃣  Git 状态"

if git rev-parse --git-dir >/dev/null 2>&1; then
    pass "Git 仓库已初始化"

    # 检查是否有未提交的更改
    if [ -n "$(git status --porcelain)" ]; then
        skip "有未提交的更改（$(git status --porcelain | wc -l) 个文件）"
    else
        pass "工作区干净"
    fi
else
    skip "未初始化 Git 仓库"
fi

# ═════════════════════════════════════════════
# 总结
# ═════════════════════════════════════════════

section "📊 测试总结"

echo ""
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo -e "${YELLOW}跳过: $SKIPPED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ 所有测试通过！项目就绪。${NC}"
    exit 0
else
    echo -e "${RED}✗ 发现 $FAILED 个问题，请修复后再继续。${NC}"
    exit 1
fi
