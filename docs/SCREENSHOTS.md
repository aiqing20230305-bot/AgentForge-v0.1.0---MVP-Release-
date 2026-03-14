# AgentForge - Screenshots & Documentation

本文档说明如何创建产品截图和GIF演示。

## 📋 截图清单

### ✅ 必需截图（4张）

所有截图分辨率：**1920x1080**，保存到 `docs/screenshots/` 目录。

#### 1. 主界面 (`screenshot-main.png`)
**内容：**
- ✅ 顶部：8个Agent头像横向排列
- ✅ 左侧：选中Agent的大头像和详细信息
- ✅ 右侧：任务管理面板，显示多个任务
- ✅ 底部：状态指示器（Demo Mode / OpenClaw Connected）
- ✅ 展示完整的主界面布局

**拍摄步骤：**
```bash
# 1. 启动应用
npm run dev

# 2. 等待加载完成，确保数据加载正常
# 3. 使用截图工具（macOS: Cmd+Shift+4, Windows: Snipping Tool）
# 4. 框选整个应用窗口（1920x1080）
# 5. 保存为 docs/screenshots/screenshot-main.png
```

---

#### 2. 任务管理界面 (`screenshot-tasks.png`)
**内容：**
- ✅ 选中某个Agent（如 CLIP 或 ATLAS）
- ✅ 右侧任务面板展开，显示5-10个任务
- ✅ 至少展开1个任务详情
- ✅ 显示任务状态选择器（pending/in_progress/completed）
- ✅ 显示任务优先级标签

**拍摄步骤：**
```bash
# 1. 在主界面选中一个Agent
# 2. 右侧任务面板自动显示该Agent的任务
# 3. 点击展开一个任务查看详情
# 4. 截图保存为 docs/screenshots/screenshot-tasks.png
```

---

#### 3. 数据源配置界面 (`screenshot-discovery.png`)
**内容：**
- ✅ 设置界面 → 数据源配置
- ✅ 显示自动发现结果（或手动配置表单）
- ✅ OpenClaw配置卡片
- ✅ 验证按钮和连接状态

**拍摄步骤：**
```bash
# 1. 点击顶部设置图标（⚙️）
# 2. 导航到"数据源管理"标签
# 3. 如果有OpenClaw运行，点击"自动发现"
# 4. 截图保存为 docs/screenshots/screenshot-discovery.png
```

---

#### 4. RPG装备系统 (`screenshot-equipment.png`)
**内容：**
- ✅ 左侧：角色装备槽位（HEAD, CHEST, HANDS, LEGS, FEET, RINGS, OFFHAND）
- ✅ 右侧：背包物品列表
- ✅ 显示拖拽操作（如果可以截图到拖拽状态）
- ✅ Token预算条和统计信息

**拍摄步骤：**
```bash
# 1. 进入装备编辑界面（Character Panel）
# 2. 确保左右两侧都有内容显示
# 3. 如果可能，在拖拽过程中截图
# 4. 保存为 docs/screenshots/screenshot-equipment.png
```

---

## 🎬 GIF动画清单（3个）

使用工具：[Kap](https://getkap.co/)（macOS）或 [LICEcap](https://www.cockos.com/licecap/)（跨平台）

**要求：**
- 帧率：30 FPS
- 文件大小：< 5MB
- 分辨率：1280x720（可以比截图小）

### 1. 快速演示 (`demo.gif`, ~5秒)
**流程：**
1. 应用启动画面 (1秒)
2. 显示8个Agent头像 (1秒)
3. 点击切换不同Agent (2秒)
4. 任务面板更新 (1秒)

**录制区域：** 完整应用窗口

---

### 2. 任务管理流程 (`task-management.gif`, ~10秒)
**流程：**
1. 选中一个Agent (1秒)
2. 点击"创建任务"按钮 (1秒)
3. 填写任务表单 (3秒)
4. 保存任务，列表更新 (2秒)
5. 修改任务状态（pending → in_progress） (2秒)
6. 查看任务详情 (1秒)

**录制区域：** 右侧任务面板

---

### 3. 自动发现流程 (`auto-discovery.gif`, ~8秒)
**流程：**
1. 打开设置界面 (1秒)
2. 点击"自动发现"按钮 (1秒)
3. 显示扫描动画 (2秒)
4. 显示发现的OpenClaw实例 (2秒)
5. 点击"验证连接" (1秒)
6. 显示✅连接成功 (1秒)

**录制区域：** 数据源配置面板

---

## 📤 发布检查清单

在完成所有截图和GIF后，执行以下检查：

```bash
# 1. 检查文件是否存在
ls -lh docs/screenshots/

# 应该看到：
# screenshot-main.png         (~500KB - 2MB)
# screenshot-tasks.png        (~500KB - 2MB)
# screenshot-discovery.png    (~500KB - 2MB)
# screenshot-equipment.png    (~500KB - 2MB)
# demo.gif                    (< 5MB)
# task-management.gif         (< 5MB)
# auto-discovery.gif          (< 5MB)

# 2. 验证README引用正确
grep -n "screenshots" README.md

# 3. 推送到GitHub测试显示
git add docs/screenshots/
git commit -m "docs: Add product screenshots and demo GIFs"
git push

# 4. 在GitHub上查看README预览，确保图片正确显示
```

---

## 🎨 截图建议

### 最佳实践：
1. **清晰度**：确保文字可读，UI元素清晰
2. **一致性**：所有截图使用相同的应用主题
3. **数据展示**：使用真实或接近真实的演示数据
4. **窗口大小**：保持1920x1080或相近比例
5. **背景**：建议深色背景以突出应用界面

### 图像优化：
```bash
# 使用 ImageOptim (macOS) 或 TinyPNG 压缩图片
# 目标：在保持清晰度的前提下，文件大小 < 2MB

# GIF优化（如果超过5MB）：
# - 降低帧率到 20 FPS
# - 减少颜色数到 128 colors
# - 裁剪到关键区域
```

---

## ✅ 完成标记

- [ ] screenshot-main.png
- [ ] screenshot-tasks.png
- [ ] screenshot-discovery.png
- [ ] screenshot-equipment.png
- [ ] demo.gif
- [ ] task-management.gif
- [ ] auto-discovery.gif
- [ ] README.md 更新完成
- [ ] GitHub 预览验证通过
