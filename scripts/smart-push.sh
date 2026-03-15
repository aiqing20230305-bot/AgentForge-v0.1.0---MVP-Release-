#!/bin/bash
# Smart Git Push - 自动处理SSH/HTTPS切换
# 如果SSH失败，自动切换到HTTPS

set -e

echo "🚀 Smart Git Push"
echo "================="
echo ""

# 检查是否有待推送的提交
if [ -z "$(git log origin/main..HEAD 2>/dev/null)" ]; then
    echo "✅ 没有待推送的提交"
    exit 0
fi

# 获取当前远程URL
CURRENT_URL=$(git remote get-url origin)
echo "📍 当前远程: $CURRENT_URL"
echo ""

# 尝试SSH推送
if [[ $CURRENT_URL == git@* ]] || [[ $CURRENT_URL == ssh://* ]]; then
    echo "🔑 尝试SSH推送..."
    if git push origin main --tags 2>/dev/null; then
        echo "✅ SSH推送成功！"
        exit 0
    else
        echo "⚠️  SSH推送失败，切换到HTTPS..."
        echo ""

        # 提取仓库信息
        if [[ $CURRENT_URL =~ github\.com[:/](.+)/(.+)(\.git)?$ ]]; then
            USER="${BASH_REMATCH[1]}"
            REPO="${BASH_REMATCH[2]%.git}"
            HTTPS_URL="https://github.com/$USER/$REPO.git"

            echo "📝 切换到HTTPS: $HTTPS_URL"
            git remote set-url origin "$HTTPS_URL"

            echo ""
            echo "⚠️  需要GitHub凭证："
            echo "   用户名: $USER"
            echo "   密码: 使用Personal Access Token (不是密码!)"
            echo ""
            echo "💡 如何获取Token:"
            echo "   1. 访问: https://github.com/settings/tokens"
            echo "   2. 点击'Generate new token (classic)'"
            echo "   3. 选择权限: repo (全部)"
            echo "   4. 复制生成的token"
            echo ""

            # 推送（会提示输入凭证）
            if git push origin main --tags; then
                echo ""
                echo "✅ HTTPS推送成功！"
                echo "💡 提示: 为避免每次输入，可以配置credential helper:"
                echo "   git config --global credential.helper store"
                exit 0
            else
                echo ""
                echo "❌ HTTPS推送也失败了"
                echo ""
                echo "🔧 可能的原因:"
                echo "   1. Token权限不足（需要repo权限）"
                echo "   2. Token已过期"
                echo "   3. 用户名错误"
                echo "   4. 分支保护规则"
                echo ""
                exit 1
            fi
        fi
    fi
else
    # 已经是HTTPS，直接推送
    echo "🌐 使用HTTPS推送..."
    if git push origin main --tags; then
        echo "✅ 推送成功！"
        exit 0
    else
        echo "❌ 推送失败"
        exit 1
    fi
fi
