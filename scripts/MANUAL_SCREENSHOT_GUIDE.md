# 手动截图指南（推荐方案）

由于 Playwright 自动截图在 Electron 应用中可能遇到渲染问题，建议使用手动截图方法获得最佳质量。

## 🎯 准备工作

1. **启动应用**
   ```bash
   npm run dev
   ```

2. **等待加载完成**
   - 等待界面完全加载（约 5-10 秒）
   - 确保所有组件正确显示

3. **设置窗口大小（可选）**
   - 使用浏览器开发工具（F12）
   - 设置视口为 1920x1080

## 📸 需要截取的 7 个场景

### 1. 主仪表盘 (01-main-dashboard.png)
**路径：** `/`（主页）

**内容：**
- 顶部导航栏
- Agent 卡片展示
- 任务管理面板
- 左侧功能菜单

**截图方式：**
- macOS: `Cmd + Shift + 4` → 拖选区域
- Windows: `Win + Shift + S` → 截取区域
- 或使用浏览器右键 → 检查 → 截图

---

### 2. 生命力仪表盘 (02-vitality-dashboard.png)
**路径：** 点击任意 Agent 卡片 → 查看详情

**内容：**
- VitalityGauge（生命力仪表）
- HeartbeatChart（心跳波形图）
- VitalityTrendChart（趋势图）
- 健康建议卡片

**操作：**
1. 点击一个 Agent 卡片
2. 等待生命力数据加载
3. 截取仪表盘区域

---

### 3. 进化时间线 (03-evolution-timeline.png)
**路径：** Agent 详情 → Evolution 标签页

**内容：**
- EvolutionTimeline 组件
- 进化历史记录
- 进化类型和稀有度
- 时间轴展示

**操作：**
1. 进入 Agent 详情页
2. 切换到 "Evolution" 或 "进化" 标签
3. 截取时间线区域

---

### 4. 心跳监控器 (04-heartbeat-monitor.png)
**路径：** 主界面或全局监控面板

**内容：**
- HeartbeatIndicator（心跳指示器）
- 实时心跳动画
- 健康状态色彩
- 最后心跳时间

**操作：**
1. 找到带有心跳图标的区域
2. 等待心跳动画显示
3. 截取监控区域

---

### 5. 设置面板 (05-settings-panel.png)
**路径：** 点击右上角设置图标 ⚙️

**内容：**
- 设置选项卡
- 云同步设置
- CloudSyncToggle 组件
- 各种配置选项

**操作：**
1. 点击右上角设置按钮
2. 切换到 "Cloud Sync" 或相关标签
3. 截取整个设置面板

---

### 6. 任务列表视图 (06-task-list-view.png)
**路径：** 主界面任务面板

**内容：**
- VirtualizedTaskList 组件
- 多个任务卡片
- 任务状态指示器
- 虚拟滚动效果（显示大量任务）

**操作：**
1. 定位到任务管理面板
2. 确保显示多个任务
3. 截取任务列表区域

---

### 7. Agent 展示面板 (07-agent-display.png)
**路径：** 主界面 Agent 区域

**内容：**
- 多个 Agent 卡片
- Agent 头像和等级
- 状态指示器
- 统计数据

**操作：**
1. 回到主界面
2. 定位 Agent 展示区域
3. 截取包含多个 Agent 的区域

---

## 💡 截图技巧

### macOS 快捷键
- `Cmd + Shift + 3` - 全屏截图
- `Cmd + Shift + 4` - 选择区域截图（推荐）
- `Cmd + Shift + 4` 然后按空格 - 窗口截图

### Windows 快捷键
- `Win + Shift + S` - 截图工具（推荐）
- `PrtScn` - 全屏截图
- `Alt + PrtScn` - 当前窗口截图

### 浏览器开发工具截图
1. 按 `F12` 打开开发工具
2. 按 `Cmd/Ctrl + Shift + P` 打开命令面板
3. 输入 "screenshot"
4. 选择：
   - "Capture full size screenshot" - 全页面
   - "Capture screenshot" - 可见区域（推荐）
   - "Capture node screenshot" - 特定元素

---

## 📐 截图规格

- **分辨率：** 1920x1080 或更高
- **格式：** PNG（保留透明度）
- **命名：** 按照上述编号命名（01-07）
- **保存位置：** `/screenshots/v1.1.0/`

---

## ✅ 质量检查

截图后确保：
- [ ] 图像清晰，文字可读
- [ ] 没有加载状态或错误信息
- [ ] UI 完整显示，无截断
- [ ] 颜色和主题正确
- [ ] 文件大小合理（< 1MB per image）

---

## 🎨 后期处理（可选）

### 使用截图工具添加标注
- macOS: Preview（预览）或 Skitch
- Windows: Paint 3D 或 Snip & Sketch
- 跨平台: GIMP, Photoshop, Figma

### 优化文件大小
```bash
# 使用 ImageMagick
mogrify -quality 85 -resize 1920x1080 screenshots/v1.1.0/*.png

# 使用 pngquant
pngquant --quality=80-90 screenshots/v1.1.0/*.png --ext .png --force
```

### 添加阴影或边框（可选）
在图片编辑软件中添加：
- 轻微阴影（增加深度）
- 圆角边框（现代感）
- 渐变背景（专业感）

---

## 🚀 完成后

将截图文件放入：
```
/Users/zhangjingwei/Desktop/AgentForge/screenshots/v1.1.0/
```

文件清单：
- ✅ 01-main-dashboard.png
- ✅ 02-vitality-dashboard.png
- ✅ 03-evolution-timeline.png
- ✅ 04-heartbeat-monitor.png
- ✅ 05-settings-panel.png
- ✅ 06-task-list-view.png
- ✅ 07-agent-display.png

然后提交到 Git：
```bash
git add screenshots/v1.1.0/
git commit -m "docs: Add v1.1.0 product screenshots"
```

---

## 💡 提示

如果某些功能在演示模式下不可用：
- 创建一些测试数据（Agent、Task）
- 触发一些进化事件
- 或者使用现有的 docs/screenshots/ 作为参考

手动截图虽然需要更多时间，但能确保：
✅ 最佳画质
✅ 正确的内容展示
✅ 完整的UI渲染
✅ 无技术问题

**预计时间：** 15-20 分钟
