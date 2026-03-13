# 🇨🇳 中文版使用指南

## ✅ 已完成的工作

### 1. 中文语言包 ✅
已创建 `src/i18n/zh-CN.ts`，包含完整的中文翻译：
- 应用标题和菜单
- 组件类别名称
- 按钮和提示文本
- OpenClaw Agents 相关术语

### 2. OpenClaw Agents 集成 ✅
已创建 `src/utils/openclawLoader.ts`，实现：
- Agent 数据解析
- 从 AGENT_PROFILES.md 读取角色信息
- Agent 转换为配置组件
- 支持你的 4 个 Agents：ATLAS、CLIP、ORACLE、SENTINEL

### 3. Agents 展示面板 ✅
已创建 `src/components/OpenClawAgentsPanel.tsx`：
- 显示所有 OpenClaw Agents
- 显示等级、经验、状态
- 技能和描述
- 加载角色到背包功能

## 📁 新增文件

```
src/
├── i18n/
│   └── zh-CN.ts                     # 中文语言包
├── utils/
│   └── openclawLoader.ts            # OpenClaw 加载器
└── components/
    └── OpenClawAgentsPanel.tsx      # Agents 面板
```

## 🎯 如何使用

### 方式 A: 查看当前功能（推荐）

当前界面虽然是英文的，但：
1. 打开 http://localhost:5174/
2. 你会看到完整的 RPG 风格装备界面
3. 可以拖拽配置 Agents
4. 左侧是背包，中间是装备槽，右侧是预览

示例组件在 `sample-components/` 和 `openclaw-components/` 目录。

### 方式 B: 集成中文版（需要修改代码）

要启用中文和 OpenClaw Agents 面板，需要：

#### 1. 集成 OpenClawAgentsPanel

在 `src/App.tsx` 中添加：

```tsx
import OpenClawAgentsPanel from './components/OpenClawAgentsPanel'
import zhCN from './i18n/zh-CN'

// 在侧边栏添加新面板
<OpenClawAgentsPanel />
```

#### 2. 替换英文文本

在各个组件中用 `zhCN.xxx` 替换硬编码的英文文本。

例如在 `TopBar.tsx`:
```tsx
import zhCN from '../i18n/zh-CN'

// 替换
<span>Export</span>
// 为
<span>{zhCN.topBar.export}</span>
```

#### 3. 完整中文化

由于这是一个 React 应用，完整中文化需要：
1. 修改约 10 个组件文件
2. 替换所有硬编码的英文文本
3. 测试所有功能

## 🚀 快速演示（已经可用）

虽然界面还是英文，但功能完全可用：

### 1. 查看你的 OpenClaw 组件
```bash
ls -la ~/world-of-claudecraft/openclaw-components/
```

已经有 11 个中文组件：
- `feishu-bot-master.md` - 飞书机器人主控制器
- `ai-orchestrator.md` - AI 编排者
- `feishu-api-expert.md` - 飞书 API 专家
- `multi-model-caller.md` - 多模型调用
- `code-reviewer.md` - 代码审查
- ...等等

### 2. 打开界面配置
1. 访问: http://localhost:5174/
2. 点击右上角 ⚙️ Settings
3. 选择 `openclaw-components` 目录
4. 组件会加载到左侧背包

### 3. 配置你的 Agent
- 从左边拖组件到中间的装备槽
- 右上角选择平台（OpenClaw 🦞）
- 点击 Preview 查看生成的配置
- 点击 Export 保存

## 🎮 OpenClaw Agents 数据

Web 版本预加载了你的 4 个 Agents：

| Agent | 等级 | 职位 | 状态 |
|-------|------|------|------|
| ATLAS | Lv.45 | Team Leader | 🟢 工作中 |
| CLIP | Lv.38 | Full Stack Dev | 🟢 工作中 |
| ORACLE | Lv.50 | Knowledge Keeper | 🟢 在线 |
| SENTINEL | Lv.48 | Security Chief | 🔴 离线 |

在 Electron 版本中，可以从以下位置读取真实数据：
- `~/Desktop/openclaw-agents-team/AGENT_PROFILES.md`
- `~/.openclaw/agents/main/`
- `~/.openclaw/agents/newbot/`

## 📋 下一步选择

### 选项 1: 使用当前英文版（快速）
**优点**:
- 立即可用
- 功能完整
- 已有 11 个中文组件可用

**使用方法**:
```bash
# 访问
open http://localhost:5174/

# 配置组件
1. Settings → 选择 openclaw-components
2. 拖拽组件配置 Agent
3. Export → OpenClaw 平台
```

### 选项 2: 我帮你完成中文化（需要10分钟）
我可以修改所有组件文件，完成完整的中文化。

需要修改的文件：
- `src/App.tsx`
- `src/components/TopBar.tsx`
- `src/components/InventoryPanel.tsx`
- `src/components/PreviewPanel.tsx`
- `src/components/SaveAgentModal.tsx`
- `src/components/SettingsModal.tsx`
- 等等...

### 选项 3: 混合方案（推荐）
1. **现在**: 使用英文界面，加载中文组件
2. **测试**: 验证功能是否满足需求
3. **决定**: 如果满意，再完整中文化

## 🎁 你已经拥有的

✅ **11 个中文 OpenClaw 组件**
- 全部在 `openclaw-components/` 目录
- 包含飞书、多模型、代码审查等功能
- 可以直接在界面中使用

✅ **多平台支持**
- Claude
- OpenAI
- Gemini
- **OpenClaw** (你的飞书机器人)
- Custom

✅ **RPG 风格界面**
- 拖拽配置
- Token 管理
- 稀有度系统
- 配置预览

## 💡 建议

**立即体验**：
```bash
# 1. 确保服务器运行
ps aux | grep vite

# 2. 打开浏览器
open http://localhost:5174/

# 3. 开始配置
点击 Settings → 选择 openclaw-components 目录
```

**你想要**：
1. 现在就用英文版？→ 直接打开 http://localhost:5174/
2. 完整中文化？→ 告诉我，我立即开始修改
3. 先测试功能？→ 先用，满意了再中文化

---

🦞 **OpenClaw Edition** - 现在就能用，随时能中文化！
