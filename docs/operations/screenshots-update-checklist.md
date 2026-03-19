# 📸 v1.2.0 截图更新清单

**目的：** 确保产品截图反映最新的 UI 改进和功能

---

## 🎯 截图标准

### 技术规范
- **分辨率：** 1920×1080 (Full HD) 或更高
- **格式：** PNG (支持透明度)
- **文件大小：** < 500KB（优化后）
- **命名规范：** `序号-功能名称.png`

### 内容要求
- ✅ 展示完整功能，避免空白状态
- ✅ 使用美观的演示数据
- ✅ 选择最佳主题（推荐 Dark Mode）
- ✅ 确保文字清晰可读
- ✅ 避免敏感信息（API keys, 个人数据）

---

## 📋 必须更新的截图

### 1. Agent 列表视图
**文件名：** `screenshots/1-agent-list.png`
**优先级：** 🔴 高

**展示内容：**
- [ ] 至少 4-6 个 Agent 卡片
- [ ] 新的 Avatar 库头像（多样化）
- [ ] 心跳指示器动画
- [ ] 生命力进度条
- [ ] 云同步状态图标
- [ ] 优化后的卡片布局

**准备数据：**
```json
{
  "agents": [
    { "name": "Code Wizard", "avatar": "🧙‍♂️", "vitality": 95 },
    { "name": "Debug Master", "avatar": "🔍", "vitality": 88 },
    { "name": "Test Guardian", "avatar": "🛡️", "vitality": 92 },
    { "name": "Doc Keeper", "avatar": "📚", "vitality": 85 }
  ]
}
```

---

### 2. Task 管理面板
**文件名：** `screenshots/2-task-management.png`
**优先级：** 🔴 高

**展示内容：**
- [ ] 虚拟滚动列表（显示多个任务）
- [ ] 任务状态标签（pending, running, completed）
- [ ] 任务优先级指示
- [ ] 筛选和搜索功能
- [ ] Task 详情抽屉（部分打开）

**准备数据：**
- 至少 10 个不同状态的任务
- 包含不同优先级和类型

---

### 3. 进化仪表盘
**文件名：** `screenshots/3-evolution-dashboard.png`
**优先级：** 🟡 中

**展示内容：**
- [ ] Vitality 仪表盘组件
- [ ] 心跳图表（实时数据）
- [ ] 进化时间线
- [ ] 健康预测曲线
- [ ] 生命力趋势图

**说明：**
- 确保图表有实际数据（不是空白）
- 显示至少 7 天的历史数据

---

### 4. 设置面板
**文件名：** `screenshots/4-settings.png`
**优先级：** 🟡 中

**展示内容：**
- [ ] 云同步设置
- [ ] 离线模式配置
- [ ] 通知设置
- [ ] 主题选择器（准备中）
- [ ] 性能优化选项

---

### 5. 移动端适配
**文件名：** `screenshots/5-mobile-view.png`
**优先级：** 🔴 高

**展示内容：**
- [ ] 手机竖屏视图（375×812 iPhone 模拟）
- [ ] 响应式布局
- [ ] 触摸友好的按钮（≥48px）
- [ ] 移动端导航

**工具：**
- 使用浏览器 DevTools 移动端模拟器
- 推荐设备：iPhone 13 Pro, Samsung Galaxy S21

---

## 🆕 新增截图（功能实现后）

### 6. 全局搜索 (Cmd+K)
**文件名：** `screenshots/6-global-search.png`
**优先级：** 🟢 低（功能未完成）

**展示内容：**
- [ ] 搜索模态框
- [ ] 搜索结果列表
- [ ] 快捷键提示

**状态：** ⏳ 等待 #74 完成

---

### 7. Agent 详情页
**文件名：** `screenshots/7-agent-details.png`
**优先级：** 🟢 低（功能未完成）

**展示内容：**
- [ ] 完整的 Agent 信息面板
- [ ] 技能树
- [ ] 统计图表
- [ ] 历史记录

**状态：** ⏳ 等待 #72 完成

---

### 8. 主题切换
**文件名：** `screenshots/8-theme-switcher.png`
**优先级：** 🟢 低（功能未完成）

**展示内容：**
- [ ] 主题选择界面
- [ ] 5 种主题预览
- [ ] 实时切换效果

**状态：** ⏳ 等待 #71 完成

---

### 9. 数据可视化仪表盘
**文件名：** `screenshots/9-analytics-dashboard.png`
**优先级：** 🟢 低（功能未完成）

**展示内容：**
- [ ] Agent 性能分析图表
- [ ] 多维度数据展示
- [ ] 交互式图表

**状态：** ⏳ 等待 #50 完成

---

## 🛠 截图生成流程

### 方法 1：自动化脚本（推荐）
```bash
# 使用 Playwright 自动截图
npm run screenshots

# 脚本会自动：
# 1. 启动应用
# 2. 填充演示数据
# 3. 遍历所有视图
# 4. 生成截图
# 5. 优化文件大小
```

### 方法 2：手动截图
```bash
# 1. 启动开发服务器
npm run dev

# 2. 打开浏览器 http://localhost:5173
# 3. 准备演示数据（见上方数据模板）
# 4. 使用截图工具：
#    - macOS: Cmd + Shift + 4
#    - Windows: Win + Shift + S
#    - Linux: Gnome Screenshot

# 5. 保存到 screenshots/ 目录
# 6. 优化文件大小（可选）
#    使用工具：TinyPNG, ImageOptim, pngquant
```

### 方法 3：浏览器 DevTools
```bash
# 1. 打开 Chrome DevTools (F12)
# 2. 切换到移动端模拟器 (Ctrl/Cmd + Shift + M)
# 3. 选择设备（iPhone, iPad, Android等）
# 4. Cmd/Ctrl + Shift + P
# 5. 输入 "Capture screenshot"
# 6. 选择 "Capture full size screenshot"
```

---

## 📊 截图检查清单

在提交截图前，请确认：

### 质量检查
- [ ] 分辨率符合标准（≥1920×1080）
- [ ] 图片清晰，无模糊
- [ ] 文字可读，无截断
- [ ] 颜色对比度良好
- [ ] 无明显视觉 bug

### 内容检查
- [ ] 展示真实功能，非空白状态
- [ ] 演示数据合理且美观
- [ ] 无敏感信息泄露
- [ ] UI 元素完整显示
- [ ] 动画效果捕获得当

### 技术检查
- [ ] 文件格式正确（PNG）
- [ ] 文件大小合理（< 500KB）
- [ ] 命名规范符合要求
- [ ] 保存在 screenshots/ 目录
- [ ] Git 已追踪文件

---

## 🔄 更新 README.md

截图更新后，记得同步更新 README.md 中的引用：

```markdown
## 📸 Screenshots

### Agent Management
![Agent List](screenshots/1-agent-list.png)

### Task Execution
![Task Management](screenshots/2-task-management.png)

### Evolution Dashboard
![Evolution Dashboard](screenshots/3-evolution-dashboard.png)

### Settings
![Settings Panel](screenshots/4-settings.png)

### Mobile View
![Mobile View](screenshots/5-mobile-view.png)
```

---

## 🎨 美化技巧

### 1. 演示数据准备
- 使用多样化的 Agent 名称和头像
- 任务描述简洁且专业
- 数值和进度条使用不同状态（高、中、低）

### 2. 主题选择
- **Dark Mode** - 推荐用于主要截图（更专业、现代）
- **Light Mode** - 可用于对比展示
- 确保主题切换后所有元素可见

### 3. 窗口布局
- 居中显示主要内容
- 避免过度留白
- 确保关键功能在视野内

### 4. 动画捕获
- 使用 Gif 或短视频展示动画效果
- 对于静态截图，选择动画的最佳帧

---

## 📅 截图更新时间表

| 阶段 | 截图 | 预计时间 | 负责人 |
|------|------|---------|--------|
| Phase 1 | 1-5（必须） | 2026-03-15 | Doc Specialist |
| Phase 2 | 6-9（可选） | 2026-03-20 | 等待功能完成 |
| Phase 3 | 优化和补充 | 2026-03-22 | Team Lead |

---

## ✅ 完成标准

截图更新完成的标志：

1. ✅ 5 张必须截图全部更新
2. ✅ 图片质量符合标准
3. ✅ README.md 引用已更新
4. ✅ Git 已提交所有截图
5. ✅ 在真实设备上验证显示效果

---

## 🔗 参考资源

- [Playwright Screenshots文档](https://playwright.dev/docs/screenshots)
- [TinyPNG 图片压缩](https://tinypng.com/)
- [Chrome DevTools Screenshots](https://developer.chrome.com/docs/devtools/device-mode/)
- [Product Screenshot Best Practices](https://uxdesign.cc/product-screenshot-best-practices)

---

**最后更新：** 2026-03-15
**版本：** v1.2.0
