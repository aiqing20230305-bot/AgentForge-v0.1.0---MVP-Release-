#!/bin/bash

###############################################################################
# AgentForge 增长营销自动化 - 快速启动脚本
# 使用Google账号统一管理，一键启动所有增长营销任务
###############################################################################

echo "🚀 AgentForge 增长营销自动化系统"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查依赖
echo "📋 检查系统依赖..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 未安装Node.js，请先安装: https://nodejs.org/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"

# 检查gh CLI
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  未安装gh CLI，将无法追踪GitHub数据${NC}"
    echo -e "${YELLOW}   安装: brew install gh${NC}"
else
    echo -e "${GREEN}✅ GitHub CLI: $(gh --version | head -n 1)${NC}"
fi

echo ""

# 菜单选择
echo "请选择要执行的任务:"
echo ""
echo "  1️⃣  启动GitHub Stars追踪 (推荐)"
echo "  2️⃣  查看当前Stars数量"
echo "  3️⃣  查看增长趋势"
echo "  4️⃣  打开发布内容文件夹"
echo "  5️⃣  查看执行指南"
echo "  6️⃣  安装自动化依赖"
echo "  0️⃣  退出"
echo ""
read -p "请输入选项 (0-6): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}🚀 启动GitHub Stars追踪系统...${NC}"
        echo ""
        node scripts/track-github-stars.js
        ;;
    2)
        echo ""
        echo -e "${BLUE}⭐ 正在查询当前Stars...${NC}"
        gh repo view aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release- --json stargazerCount,forkCount,watchers --jq '{stars:.stargazerCount,forks:.forkCount,watchers:.watchers.totalCount}'
        echo ""
        ;;
    3)
        echo ""
        if [ -f "growth-history.csv" ]; then
            echo -e "${BLUE}📊 增长历史数据:${NC}"
            echo ""
            cat growth-history.csv | tail -n 10
            echo ""
            echo -e "${YELLOW}完整数据: cat growth-history.csv${NC}"
        else
            echo -e "${YELLOW}⚠️  还没有历史数据，请先运行追踪系统${NC}"
        fi
        echo ""
        ;;
    4)
        echo ""
        echo -e "${BLUE}📂 打开发布内容文件夹...${NC}"
        open .
        echo ""
        echo "已打开！查看这些文件："
        echo "  - READY_TO_POST_TWITTER_1.txt"
        echo "  - READY_TO_POST_REDDIT_PROGRAMMING.txt"
        echo "  - READY_TO_POST_REDDIT_OPENSOURCE.txt"
        echo ""
        ;;
    5)
        echo ""
        echo -e "${BLUE}📖 打开执行指南...${NC}"
        open EXECUTE_NOW.md
        echo ""
        ;;
    6)
        echo ""
        echo -e "${BLUE}📦 安装自动化依赖...${NC}"
        echo ""

        # 检查package.json
        if [ ! -f "package.json" ]; then
            echo "创建package.json..."
            cat > package.json << 'EOF'
{
  "name": "agentforge-growth-automation",
  "version": "1.0.0",
  "description": "AgentForge增长营销自动化系统",
  "scripts": {
    "track": "node scripts/track-github-stars.js",
    "start": "npm run track"
  },
  "keywords": ["growth", "automation", "marketing"],
  "author": "AgentForge Team",
  "license": "MIT"
}
EOF
        fi

        echo "安装Node.js依赖..."
        npm install

        echo ""
        echo -e "${GREEN}✅ 依赖安装完成！${NC}"
        echo ""
        ;;
    0)
        echo ""
        echo -e "${GREEN}👋 再见！加油小伙伴们！${NC}"
        echo ""
        exit 0
        ;;
    *)
        echo ""
        echo -e "${RED}❌ 无效选项，请输入0-6${NC}"
        echo ""
        exit 1
        ;;
esac

# 显示快捷命令
echo ""
echo -e "${YELLOW}💡 快捷命令提示:${NC}"
echo "  追踪Stars:  npm run track"
echo "  查看Stars:  gh repo view aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release- --json stargazerCount"
echo "  快速启动:  ./scripts/quick-start.sh"
echo ""
