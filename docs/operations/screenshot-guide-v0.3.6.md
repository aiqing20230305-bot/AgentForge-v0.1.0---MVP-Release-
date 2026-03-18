# 📸 v0.3.6 产品截图指南

**目标：** 快速拍摄关键功能截图，展示v0.3.6新特性

---

## 🎯 需要的截图（6张）

### 1. **任务搜索系统** ⭐⭐⭐
**文件名：** `v0.3.6-task-search.png`
**分辨率：** 1920x1080
**内容：**
- 打开"任务"标签
- 在搜索栏输入"安全"或"开发"
- 显示过滤后的任务列表
- 确保搜索历史下拉框可见（点击输入框）

**步骤：**
1. 点击主导航"任务"标签
2. 点击搜索栏（会显示历史）
3. 输入搜索词"安全"
4. 截图（Cmd+Shift+4 on Mac）

**重点展示：**
- ✅ 搜索输入框
- ✅ 搜索历史下拉框
- ✅ 过滤后的任务结果
- ✅ 清除按钮（X图标）

---

### 2. **复制功能 - OpenClaw配置** ⭐⭐
**文件名：** `v0.3.6-copy-config.png`
**分辨率：** 1920x1080
**内容：**
- 打开OpenClaw配置模态框
- 显示APIKeyDisplay组件（遮罩状态）
- 显示Gateway URL的复制按钮

**步骤：**
1. 在设置或适当位置打开OpenClaw配置
2. 确保Auth Token显示为遮罩（e4d645ac...•••）
3. 鼠标悬停在复制按钮上
4. 截图

**重点展示：**
- ✅ 遮罩的API Key
- ✅ 显示/隐藏切换按钮
- ✅ 复制按钮
- ✅ Gateway URL复制功能

---

### 3. **任务执行日志 - 复制按钮** ⭐
**文件名：** `v0.3.6-log-copy.png`
**分辨率：** 1920x1080
**内容：**
- 打开任务详情抽屉
- 显示执行日志（带"复制日志"按钮）
- 日志有内容（绿色文字）

**步骤：**
1. 选择一个已完成或进行中的任务
2. 点击"详情"按钮打开抽屉
3. 滚动到执行日志部分
4. 截图（确保"复制日志"按钮可见）

**重点展示：**
- ✅ 黑客风格的日志（绿色文字）
- ✅ 右上角的"复制日志"按钮
- ✅ 日志内容示例

---

### 4. **ComponentShowcase - 搜索标签** ⭐⭐⭐
**文件名：** `v0.3.6-showcase-search.png`
**分辨率：** 1920x1080
**内容：**
- 打开"组件"标签
- 选择"搜索组件"标签
- 显示TaskSearchBar演示和代码示例

**步骤：**
1. 点击主导航"组件"标签（BookOpen图标）
2. 确保"搜索组件"标签激活
3. 滚动显示TaskSearchBar演示和useDebounce对比
4. 截图

**重点展示：**
- ✅ 标签页导航（4个标签）
- ✅ TaskSearchBar实时演示
- ✅ useDebounce即时值 vs 防抖值
- ✅ 代码示例区域

---

### 5. **ComponentShowcase - 复制标签** ⭐⭐
**文件名：** `v0.3.6-showcase-copy.png`
**分辨率：** 1920x1080
**内容：**
- ComponentShowcase → "复制组件"标签
- 显示多个复制组件演示

**步骤：**
1. 在ComponentShowcase中点击"复制组件"标签
2. 确保显示CopyableText, APIKeyDisplay等演示
3. 截图

**重点展示：**
- ✅ CopyableText演示
- ✅ APIKeyDisplay（遮罩/显示切换）
- ✅ CopyableCodeBlock（语法高亮）
- ✅ 代码示例

---

### 6. **ComponentShowcase - 加载状态** ⭐
**文件名：** `v0.3.6-showcase-loading.png`
**分辨率：** 1920x1080
**内容：**
- ComponentShowcase → "加载状态"标签
- 显示各种加载组件演示
- 触发一些交互（点击"显示Toast"或"开始加载"）

**步骤：**
1. 在ComponentShowcase中点击"加载状态"标签
2. 点击"显示Toast"或"开始加载"按钮
3. 等待动画效果出现
4. 截图

**重点展示：**
- ✅ Toast通知
- ✅ LoadingSpinner
- ✅ ProgressBar
- ✅ 控制按钮

---

## 📐 截图规格

### 推荐设置
- **分辨率：** 1920x1080 (Full HD)
- **格式：** PNG（高质量）
- **保存位置：** `/docs/screenshots/v0.3.6/`

### macOS 截图快捷键
```bash
Cmd + Shift + 4  # 区域截图
Cmd + Shift + 3  # 全屏截图
Cmd + Shift + 5  # 截图工具（推荐）
```

### Windows 截图快捷键
```bash
Win + Shift + S  # 截图工具
Win + PrtScn     # 全屏截图
```

---

## 🎨 截图优化建议

1. **窗口尺寸：** 最大化窗口或设置为1920x1080
2. **主题：** 使用深色主题（默认）
3. **数据：** 使用示例数据（已有60+任务）
4. **光标：** 隐藏光标或指向关键功能
5. **清洁度：** 关闭不相关的通知/弹窗

---

## 📦 截图后步骤

### 1. 创建目录
```bash
mkdir -p docs/screenshots/v0.3.6
```

### 2. 移动文件
```bash
mv ~/Desktop/v0.3.6-*.png docs/screenshots/v0.3.6/
```

### 3. 优化图片（可选）
```bash
# 使用 ImageOptim (Mac) 或 TinyPNG
# 减小文件大小，保持质量
```

### 4. 更新文档
编辑 `docs/SCREENSHOTS.md` 添加新截图：
```markdown
## v0.3.6 Screenshots

### Task Search System
![Task Search](./screenshots/v0.3.6/v0.3.6-task-search.png)
*Intelligent search with history and animations*

### Copy Enhancements
![Copy Config](./screenshots/v0.3.6/v0.3.6-copy-config.png)
*One-click copy for URLs and API keys*

...
```

---

## ⚡ 快速脚本

```bash
#!/bin/bash
# quick-screenshot.sh

echo "📸 v0.3.6 截图准备"
echo ""
echo "请按照以下顺序拍摄截图："
echo "1. 任务搜索系统（搜索'安全'）"
echo "2. OpenClaw配置（显示遮罩API Key）"
echo "3. 任务日志（带复制按钮）"
echo "4. ComponentShowcase - 搜索"
echo "5. ComponentShowcase - 复制"
echo "6. ComponentShowcase - 加载"
echo ""
echo "完成后运行: ./organize-screenshots.sh"
```

---

## ✅ 验证清单

拍摄完成后检查：
- [ ] 6张截图全部拍摄
- [ ] 分辨率正确（1920x1080）
- [ ] 文件名正确
- [ ] 关键功能清晰可见
- [ ] 无敏感信息（真实Token等）
- [ ] 图片已优化（< 500KB per file）
- [ ] 移动到正确目录
- [ ] README.md/SCREENSHOTS.md已更新

---

## 🚀 可选：动画截图（GIF）

如果时间允许，录制1-2个GIF展示交互：

### GIF 1: 任务搜索流程
- 输入搜索词
- 显示历史
- 过滤任务
- 清除搜索
- **时长：** 5-8秒

### GIF 2: 复制功能演示
- 点击复制按钮
- 显示"已复制"反馈
- 2秒后恢复
- **时长：** 3-5秒

**工具推荐：**
- macOS: Kap, Gifski
- Windows: ScreenToGif
- 跨平台: LICEcap

---

**准备好后，运行发布流程！**
