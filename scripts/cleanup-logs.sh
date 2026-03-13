#!/bin/bash

# 自动清理不必要的 console.log，保留关键日志

cd "$(dirname "$0")/.."

echo "🧹 清理调试日志..."

# 需要移除的日志（调试用）
FILES_TO_CLEAN=(
  "src/components/AgentTaskHistory.tsx"
  "src/components/ConnectionDiagnostics.tsx"
  "src/components/AgentChat.tsx"
  "src/stores/buildStore.ts"
)

# 需要保留的日志标记（关键日志）
# [AgentLoader], [TaskPanel], [AgentDisplay], [AdapterManager]

for file in "${FILES_TO_CLEAN[@]}"; do
  if [ -f "$file" ]; then
    # 注释掉 console.log（不删除，方便以后调试）
    sed -i.bak 's/^\([[:space:]]*\)console\.log(/\1\/\/ console.log(/g' "$file"
    rm -f "$file.bak"
    echo "✓ 清理: $file"
  fi
done

echo ""
echo "保留的关键日志："
echo "  - [AgentLoader] 系列（帮助诊断 Agent 加载）"
echo "  - [TaskPanel] 系列（帮助诊断任务过滤）"
echo "  - [AgentDisplay] 系列（帮助诊断 Agent 选择）"
echo "  - [AdapterManager] 系列（帮助诊断适配器）"

echo ""
echo "✅ 清理完成！"
