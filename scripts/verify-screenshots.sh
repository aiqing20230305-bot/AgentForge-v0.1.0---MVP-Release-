#!/bin/bash

# AgentForge 截图验证脚本
# 检查所有必需截图是否存在且符合规范

echo "🔍 AgentForge 截图验证"
echo "================================"

# 必需截图列表
required_screenshots=(
    "screenshot-main.png"
    "screenshot-tasks.png"
    "screenshot-skill-tree.png"
    "screenshot-energy-dashboard.png"
    "screenshot-achievements.png"
    "screenshot-pvp-battle.png"
    "screenshot-leaderboard.png"
    "screenshot-invite.png"
    "screenshot-qr-code.png"
    "screenshot-settings.png"
    "screenshot-performance.png"
)

total=0
existing=0
missing=0
oversized=0

echo ""
echo "📊 检查结果："
echo ""

for screenshot in "${required_screenshots[@]}"; do
    ((total++))
    filepath="docs/screenshots/$screenshot"

    if [ -f "$filepath" ]; then
        ((existing++))
        # 检查文件大小（2MB = 2097152 bytes）
        filesize=$(stat -f%z "$filepath" 2>/dev/null || stat -c%s "$filepath" 2>/dev/null)
        filesize_mb=$(echo "scale=2; $filesize/1048576" | bc)

        if [ $filesize -gt 2097152 ]; then
            echo "  ⚠️  $screenshot ($filesize_mb MB - 超过2MB)"
            ((oversized++))
        else
            echo "  ✅ $screenshot ($filesize_mb MB)"
        fi
    else
        echo "  ❌ $screenshot (缺失)"
        ((missing++))
    fi
done

echo ""
echo "================================"
echo "📈 统计："
echo "  总计: $total 张"
echo "  存在: $existing 张"
echo "  缺失: $missing 张"
echo "  超大: $oversized 张"

echo ""
if [ $missing -eq 0 ] && [ $oversized -eq 0 ]; then
    echo "🎉 所有截图验证通过！"
    echo ""
    echo "✨ 下一步："
    echo "   git add docs/screenshots/"
    echo "   git commit -m 'docs: Update v0.3.1 product screenshots'"
    exit 0
elif [ $missing -gt 0 ]; then
    echo "⚠️  还缺少 $missing 张截图，请继续补充"
    echo ""
    echo "📋 参考: docs/SCREENSHOT_GUIDE.md"
    exit 1
else
    echo "⚠️  有 $oversized 张截图超过2MB，建议压缩"
    echo ""
    echo "💡 压缩方法："
    echo "   brew install imagemagick"
    echo "   mogrify -resize 1920x1080 -quality 85 docs/screenshots/*.png"
    exit 1
fi
