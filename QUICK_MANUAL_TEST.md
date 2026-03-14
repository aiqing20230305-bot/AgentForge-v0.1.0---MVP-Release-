# 🧪 快速手动测试清单

**测试时间：** 2026-03-14 深夜
**目标：** 验证所有5个标签页功能

---

## ✅ 测试步骤

### 1. 打开应用
```bash
浏览器访问: http://localhost:5173/
```

### 2. 跳过欢迎向导
- 点击"跳过向导"按钮

### 3. 逐个测试标签页

#### 📋 标签 1: 任务管理
- [ ] 点击"任务管理"标签
- [ ] 验证：任务列表显示
- [ ] 验证：可以创建新任务
- [ ] 验证：可以查看任务详情

**预期：** ✅ 正常显示任务列表

---

#### ⚡ 标签 2: 能耗仪表板
- [ ] 点击"能耗仪表板"标签
- [ ] 验证：3个圆形进度环（今日/本周/本月）
- [ ] 验证：实时速率显示
- [ ] 验证：本月成本显示
- [ ] 验证：Top 5 能耗任务

**预期：** ✅ **已验证正常**

**截图证据：**
- 3个圆形进度环：0% / 0% / 0%
- 实时速率：0 tokens/小时
- 本月成本：$0.00 USD

---

#### 🌳 标签 3: 技能树
- [ ] 点击"技能树"标签
- [ ] 验证：技能树标题显示
- [ ] 验证：可用技能点显示
- [ ] 验证：5个技能分支显示

**当前状态：** ⚠️ 显示"技能树数据未初始化"

**原因：** Agent数据缺少skillTree字段

**解决方案：**
1. 已添加initializeAgentExtendedData()函数
2. 需要刷新页面触发初始化
3. 或者手动在浏览器控制台运行：
```javascript
// 打开浏览器Console，运行：
const store = window.__ZUSTAND_DEVTOOLS__?.getState()
console.log('Agent数据:', store?.agentsCache[0])
// 检查是否有skillTree字段
```

---

#### 🏆 标签 4: 成就
- [ ] 点击"成就"标签
- [ ] 验证：成就面板显示
- [ ] 验证：31个成就卡片
- [ ] 验证：类别筛选工作

**预期：** ⚠️ 可能显示空白或"暂无数据"

---

#### ⚔️ 标签 5: PvP对战
- [ ] 点击"PvP对战"标签
- [ ] 验证：战斗准备界面
- [ ] 验证：对手列表
- [ ] 验证：胜率预测

**预期：** ⚠️ 可能需要多个Agent才能显示对手

---

## 🔧 故障排查

### 如果技能树/成就/PvP显示空白：

**步骤1：刷新页面**
```
按 F5 或 Cmd+R 刷新浏览器
```

**步骤2：清除缓存重新加载**
```
按 Cmd+Shift+R (Mac) 或 Ctrl+Shift+R (Windows)
```

**步骤3：检查浏览器控制台**
```
1. 按 F12 打开开发者工具
2. 切换到 Console 标签
3. 查看是否有错误信息
4. 截图错误信息
```

**步骤4：手动初始化Agent数据**

在浏览器Console中运行：
```javascript
// 获取Store
const useDataSourceStore = window.__ZUSTAND_DEVTOOLS__

// 查看当前Agent数据
const agents = useDataSourceStore.getState().agentsCache
console.log('Agents:', agents)

// 手动初始化第一个Agent
if (agents[0]) {
  const agent = agents[0]

  if (!agent.skillTree) {
    agent.skillTree = {
      unlockedSkills: [],
      activeSkills: [],
      skillPoints: 5,
      skillLevels: {}
    }
  }

  if (!agent.achievements) {
    agent.achievements = {
      unlocked: [],
      progress: {}
    }
  }

  if (!agent.levelSystem) {
    agent.levelSystem = {
      currentLevel: agent.level || 1,
      currentExp: agent.exp || 0,
      expToNextLevel: 100,
      totalExp: agent.exp || 0,
      prestigeLevel: 0,
      levelHistory: []
    }
  }

  // 更新Store
  useDataSourceStore.getState().updateAgentsCache([...agents])

  console.log('✅ Agent数据已初始化！刷新页面查看效果')
}
```

---

## 📊 测试结果记录

| 标签页 | 状态 | 问题 | 解决方案 |
|--------|------|------|----------|
| 任务管理 | ⏳ 待测试 | - | - |
| 能耗仪表板 | ✅ 通过 | 无 | - |
| 技能树 | ⚠️ 数据未初始化 | skillTree undefined | 刷新页面 |
| 成就 | ⏳ 待测试 | - | - |
| PvP对战 | ⏳ 待测试 | - | - |

---

## 🎯 成功标准

### 必须通过（阻塞发布）
- [ ] 至少3个标签页正常显示
- [ ] 能耗仪表板完全正常
- [ ] 无JavaScript错误

### 建议达到（质量目标）
- [ ] 5个标签页全部正常
- [ ] 所有组件可交互
- [ ] 数据正确显示

---

## 📝 测试笔记

**测试人员：** 开发者 / 用户
**测试时间：** ___________
**浏览器：** Chrome / Firefox / Safari
**操作系统：** Mac / Windows / Linux

**发现的问题：**
```
1.
2.
3.
```

**建议改进：**
```
1.
2.
3.
```

---

**测试完成时间：** ___________
**总体评价：** ⭐⭐⭐⭐⭐ (1-5星)
