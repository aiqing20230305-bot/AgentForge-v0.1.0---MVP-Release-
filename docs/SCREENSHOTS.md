# AgentForge - Screenshots

## 主界面截图建议

### 1. 主界面 - Demo Mode
**文件名**: `screenshot-main.png`

**内容：**
- 顶部：8 个 Agent 头像横向排列
- 左侧：ATLAS 大头像和详细信息
- 右侧：任务管理面板，显示 4 个任务
- 状态指示器：🟡 Demo Mode | 8 agents

**拍摄方式：**
```bash
# 启动应用
cd ~/Downloads/world-of-claudecraft
npm run electron:dev

# 等待加载完成
# 按 Cmd+Shift+4 截图
# 保存为 docs/screenshot-main.png
```

---

### 2. 任务管理界面
**文件名**: `screenshot-tasks.png`

**内容：**
- 选中 CLIP Agent
- 右侧显示 5 个任务
- 展开一个任务显示详情
- 任务状态选择器

---

### 3. 自动发现界面
**文件名**: `screenshot-discovery.png`

**内容：**
- 设置 → 数据源 → 自动发现
- 显示扫描结果
- OpenClaw 配置卡片
- 验证按钮和状态

---

### 4. RPG 装备界面
**文件名**: `screenshot-equipment.png`

**内容：**
- 左侧：角色装备槽位
- 右侧：背包物品
- 拖拽操作演示
- Token 预算条

---

## 添加到 README

在 README.md 中添加：

```markdown
## 📸 Screenshots

### Agent Management
![AgentForge Main Interface](docs/screenshot-main.png)

### Task Management
![Task Management](docs/screenshot-tasks.png)

### Auto-Discovery
![Auto-Discovery](docs/screenshot-discovery.png)
```

---

## GIF 动画建议（可选）

使用 LICEcap 或 Kap 录制：

1. **demo.gif** - 5 秒快速演示
   - 启动 → 显示 8 Agent → 点击切换 → 任务更新

2. **task-management.gif** - 10 秒任务管理
   - 创建任务 → 修改状态 → 查看详情

3. **auto-discovery.gif** - 8 秒自动发现
   - 点击扫描 → 显示结果 → 验证通过
