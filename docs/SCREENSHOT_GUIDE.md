# 📸 AgentForge v0.3.1 截图指南

**目标：** 更新所有产品截图以展示v0.3.0和v0.3.1的新功能

**截图时间：** 2026-03-15
**版本：** v0.3.1
**分辨率：** 1920x1080 (Full HD)

---

## 🎯 必需截图清单

### 1. 主界面 (screenshot-main.png) - ✅ 已存在，需更新
**内容：**
- Agent展示面板（左侧）
- 主导航标签（右侧）- 显示新增的"性能"和"设置"标签
- 全局经验条（顶部）
- 星空背景
- 至少显示2-3个Agent卡片

**操作步骤：**
1. 启动应用 `npm run dev`
2. 等待加载完成
3. 切换到"任务"标签
4. 截取完整窗口 (Cmd+Shift+3 on Mac)

---

### 2. 排行榜系统 (screenshot-leaderboard.png) - 🆕 需新建
**内容：**
- 排行榜面板完整视图
- 显示Top 10玩家
- 金银铜奖牌（前3名）
- 手动刷新按钮（右上角）
- 多个标签（等级/PVP/任务/能耗/成就）

**操作步骤：**
1. 点击"排行"标签
2. 确保有数据显示
3. 截取右侧面板

**保存路径：** `docs/screenshots/screenshot-leaderboard.png`

---

### 3. 邀请码系统 (screenshot-invite.png) - 🆕 需新建
**内容：**
- 邀请码生成界面
- 我的邀请码列表（显示2-3个）
- 奖励配置卡片（紫色和青色）
- "生成新邀请码"按钮
- 过期警告徽章（如果有）

**操作步骤：**
1. 点击"邀请"标签
2. 生成2-3个邀请码
3. 截取右侧面板

**保存路径：** `docs/screenshots/screenshot-invite.png`

---

### 4. QR码模态框 (screenshot-qr-code.png) - 🆕 需新建
**内容：**
- QR码模态框打开状态
- 显示完整二维码
- 邀请码大字显示
- 下载和复制按钮
- 青色边框设计

**操作步骤：**
1. 在邀请面板点击QR按钮
2. 等待QR码生成完成
3. 截取模态框

**保存路径：** `docs/screenshots/screenshot-qr-code.png`

---

### 5. 设置面板 (screenshot-settings.png) - 🆕 需新建
**内容：**
- 设置面板完整视图
- 4个分类标签（通用/音效/UI/性能）
- 主题切换卡片（深色/浅色/自动）
- 音量滑块
- 导出/导入/重置按钮

**操作步骤：**
1. 点击"设置"标签
2. 停留在"通用"标签页
3. 截取右侧面板

**保存路径：** `docs/screenshots/screenshot-settings.png`

---

### 6. 性能监控Dashboard (screenshot-performance.png) - 🆕 需新建
**内容：**
- 性能仪表板完整视图
- 97.5%性能提升徽章（绿色）
- Core Web Vitals卡片（5个）
- 内存使用趋势图（青色）
- 综合性能得分（0-100）

**操作步骤：**
1. 点击"性能"标签
2. 等待数据加载（5-10秒）
3. 确保内存图表有数据点
4. 截取右侧面板

**保存路径：** `docs/screenshots/screenshot-performance.png`

---

### 7. 任务管理 (screenshot-tasks.png) - ✅ 已存在，需更新
**内容：**
- 任务列表（显示4-5个任务）
- 不同优先级标记（红/黄/蓝）
- 任务状态（待处理/进行中/完成）
- 进度条
- 创建任务按钮

**操作步骤：**
1. 点击"任务"标签
2. 确保有多个不同状态的任务
3. 截取右侧面板

---

### 8. 技能树 (screenshot-skill-tree.png) - ✅ 已存在
**内容：**
- 技能树布局
- 多个技能节点
- 已解锁/未解锁状态
- 技能点数显示

**操作步骤：**
1. 点击"技能"标签
2. 截取右侧面板

---

### 9. 能耗Dashboard (screenshot-energy-dashboard.png) - ✅ 已存在
**内容：**
- 能耗仪表盘
- Token使用图表
- 预算进度环
- 成本估算

**操作步骤：**
1. 点击"能耗"标签
2. 截取右侧面板

---

### 10. 成就系统 (screenshot-achievements.png) - ✅ 已存在
**内容：**
- 成就卡片网格
- 已解锁/未解锁成就
- 进度条
- 成就图标

**操作步骤：**
1. 点击"成就"标签
2. 截取右侧面板

---

### 11. PVP对战 (screenshot-pvp-battle.png) - ✅ 已存在
**内容：**
- 战斗准备界面或战斗场景
- Agent属性对比
- 技能按钮

**操作步骤：**
1. 点击"对战"标签
2. 截取战斗界面

---

### 12. 移动端响应式 (screenshot-mobile.png) - 🆕 需新建（可选）
**内容：**
- 手机尺寸视图（375x812）
- 紧凑布局
- 底部导航

**操作步骤：**
1. 浏览器开发者工具 (F12)
2. 切换到移动端模式 (Cmd+Shift+M)
3. 选择 iPhone X 尺寸
4. 截取

**保存路径：** `docs/screenshots/screenshot-mobile.png`

---

## 🔄 需要替换的旧截图

**根目录旧截图（删除）：**
- ❌ `/main.png` - 替换为新的主界面截图
- ❌ `/image-1.png` - 删除（旧UI）
- ❌ `/image-2.png` - 删除（旧UI）
- ❌ `/image-3.png` - 删除（旧UI）

---

## 📋 截图后检查清单

- [ ] 所有截图分辨率统一为1920x1080
- [ ] 文件大小合理（< 2MB per image）
- [ ] 文件命名规范（小写，连字符）
- [ ] 删除根目录旧截图
- [ ] 更新README.md引用
- [ ] 所有新功能都有对应截图

---

## 🎨 截图技巧

1. **清理环境：**
   - 关闭其他窗口
   - 使用演示数据（不要用真实敏感信息）
   - 确保UI完全加载

2. **统一主题：**
   - 使用深色主题（默认）
   - 保持一致的配色

3. **数据准备：**
   - 创建足够的测试Agent
   - 生成多个邀请码
   - 添加多个任务
   - 等待性能数据收集

4. **质量控制：**
   - 检查是否有UI Bug
   - 确保文字清晰可读
   - 避免模糊或失真

---

## 🚀 快速执行命令

```bash
# 1. 启动应用
npm run dev

# 2. 创建截图目录（如果不存在）
mkdir -p docs/screenshots

# 3. 截图后，删除旧图
rm -f main.png image-1.png image-2.png image-3.png

# 4. 优化图片大小（可选）
# brew install imagemagick
# mogrify -resize 1920x1080 -quality 85 docs/screenshots/*.png

# 5. 验证文件
ls -lh docs/screenshots/
```

---

## 📝 更新README.md

截图完成后，更新以下部分：

```markdown
## 📸 Screenshots

### 🏆 Global Leaderboards
![Leaderboard](docs/screenshots/screenshot-leaderboard.png)

### 💎 Invite & QR Code System
![Invite System](docs/screenshots/screenshot-invite.png)
![QR Code](docs/screenshots/screenshot-qr-code.png)

### ⚙️ Settings Panel
![Settings](docs/screenshots/screenshot-settings.png)

### 📊 Performance Monitoring
![Performance](docs/screenshots/screenshot-performance.png)
```

---

**准备时间：** 15-20分钟
**截图时间：** 10-15分钟
**总耗时：** 30-35分钟

**下一步：** 执行截图 → 更新README → 删除旧图 → 提交Git
