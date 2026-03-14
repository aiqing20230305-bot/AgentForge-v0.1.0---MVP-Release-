#!/bin/bash

# AgentForge 截图更新自动化脚本
# 用于快速删除旧图并准备新截图

set -e

echo "🎨 AgentForge 截图更新脚本"
echo "================================"

# 1. 删除根目录旧截图
echo ""
echo "📌 步骤 1: 删除旧截图..."
if [ -f "main.png" ]; then
    rm main.png
    echo "  ✅ 删除 main.png"
fi

if [ -f "image-1.png" ]; then
    rm image-1.png
    echo "  ✅ 删除 image-1.png"
fi

if [ -f "image-2.png" ]; then
    rm image-2.png
    echo "  ✅ 删除 image-2.png"
fi

if [ -f "image-3.png" ]; then
    rm image-3.png
    echo "  ✅ 删除 image-3.png"
fi

# 2. 确保screenshots目录存在
echo ""
echo "📌 步骤 2: 准备截图目录..."
mkdir -p docs/screenshots
echo "  ✅ docs/screenshots/ 已就绪"

# 3. 列出当前截图
echo ""
echo "📌 步骤 3: 当前截图列表"
ls -lh docs/screenshots/ | grep ".png" || echo "  暂无截图"

# 4. 显示待截取清单
echo ""
echo "📌 步骤 4: 待截取清单"
echo ""
echo "🆕 新功能截图（必需）："
echo "  ⏳ screenshot-leaderboard.png    - 排行榜系统"
echo "  ⏳ screenshot-invite.png         - 邀请码系统"
echo "  ⏳ screenshot-qr-code.png        - QR码模态框"
echo "  ⏳ screenshot-settings.png       - 设置面板"
echo "  ⏳ screenshot-performance.png    - 性能Dashboard"
echo ""
echo "🔄 更新现有截图："
echo "  ⏳ screenshot-main.png           - 主界面（新增标签）"
echo "  ✅ screenshot-tasks.png          - 任务管理"
echo "  ✅ screenshot-skill-tree.png     - 技能树"
echo "  ✅ screenshot-energy-dashboard.png - 能耗"
echo "  ✅ screenshot-achievements.png   - 成就"
echo "  ✅ screenshot-pvp-battle.png     - PVP对战"

# 5. 检查缺失的截图
echo ""
echo "📌 步骤 5: 缺失截图检测"
missing_count=0

screenshots=(
    "screenshot-leaderboard.png"
    "screenshot-invite.png"
    "screenshot-qr-code.png"
    "screenshot-settings.png"
    "screenshot-performance.png"
)

for screenshot in "${screenshots[@]}"; do
    if [ ! -f "docs/screenshots/$screenshot" ]; then
        echo "  ❌ 缺失: $screenshot"
        ((missing_count++))
    else
        echo "  ✅ 存在: $screenshot"
    fi
done

echo ""
if [ $missing_count -eq 0 ]; then
    echo "🎉 所有新功能截图已就绪！"
else
    echo "⚠️  还需要 $missing_count 张截图"
fi

# 6. 显示后续步骤
echo ""
echo "================================"
echo "📋 后续步骤："
echo ""
echo "1. 启动应用: npm run dev"
echo "2. 按照 docs/SCREENSHOT_GUIDE.md 指南截图"
echo "3. 截图保存到 docs/screenshots/ 目录"
echo "4. 运行: ./scripts/verify-screenshots.sh"
echo "5. 提交: git add docs/screenshots/ && git commit -m 'docs: Update v0.3.1 screenshots'"
echo ""
echo "🔗 详细指南: docs/SCREENSHOT_GUIDE.md"
echo "================================"
