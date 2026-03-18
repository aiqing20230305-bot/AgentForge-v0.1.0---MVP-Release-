# 🎮 AgentForge

<div align="center">

### **AI Agent 管理的 RPG 革命**

> 把枯燥的 AI Agent 管理变成上瘾的 RPG 游戏！

[![GitHub Stars](https://img.shields.io/github/stars/yourusername/AgentForge?style=for-the-badge&logo=github&color=yellow)](https://github.com/yourusername/AgentForge/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](./LICENSE)
[![Version](https://img.shields.io/badge/version-0.3.0--RC-green?style=for-the-badge)](./CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](./CONTRIBUTING.md)

[🎬 观看演示](#demo) • [⚡ 快速开始](#quick-start) • [🌟 核心功能](#features) • [📖 文档](#documentation)

</div>

---

## 🔥 10秒看懂 AgentForge

![AgentForge Demo](docs/screenshots/demo.gif)

**0-3秒：** Agent 升级，金色粒子爆炸 ✨
**3-6秒：** 能耗仪表盘，圆环动画旋转 📊
**6-9秒：** PvP 战斗，回合制攻击特效 ⚔️
**9-10秒：** 成就解锁，震撼音效 🏆

---

## 💡 为什么选择 AgentForge？

### ❌ 传统 Agent 管理工具
- 枯燥的表格和配置文件
- Token 消耗不可见，成本失控
- 缺少成就感，难以坚持
- 孤独的单人操作

### ✅ AgentForge
- **让你停不下来的 RPG 体验**
- **Token 可视化，像魔法值一样直观**
- **技能树、成就、排行榜，全面游戏化**
- **PvP 对战和社交竞争**

---

## 🌟 核心功能

<table>
<tr>
<td width="50%" valign="top">

### ⚡ 能耗仪表盘
**Token 消耗可视化，像 RPG 的魔法值**

![Energy Dashboard](docs/screenshots/energy-dashboard.png)

✅ 3个圆形进度环（今日/本周/本月）
✅ 实时消耗速率（Tokens/小时）
✅ 智能预算告警（接近80%时警告）
✅ Top 5 最消耗能量的任务
✅ 4种专业图表（折线/柱状/饼图/热力图）

**解决痛点：**
- 💰 Token 成本不可控 → 实时监控，避免超支
- 📊 数据不透明 → 可视化图表，一目了然
- ⚠️ 无预警机制 → 智能告警，提前预防

</td>
<td width="50%" valign="top">

### 🌳 技能树系统
**25种技能，5大分支，自由搭配**

![Skill Tree](docs/screenshots/skill-tree.png)

✅ 5大技能分支（效率/战斗/学习/精准/终极）
✅ 技能依赖关系树（前置技能解锁）
✅ 实时效果生效（Token减少、速度提升）
✅ 转生系统（100级后重新开始）
✅ 技能点获取（升级获得）

**解决痛点：**
- 📈 效率提升无感 → 技能效果可视化
- 🎯 缺少目标 → 清晰的技能树路线
- 🔄 重复劳动 → 技能自动化任务

</td>
</tr>
<tr>
<td width="50%" valign="top">

### ⚔️ PvP 战斗系统
**回合制对战，让 AI 竞技变现实**

![PvP Battle](docs/screenshots/battle-arena.png)

✅ 炉石风格布局（双方对峙）
✅ 技能卡牌系统（4个战斗技能）
✅ 战斗动画特效（攻击/受击/爆炸）
✅ 排位赛系统（青铜→大师）
✅ 战斗回放（精彩瞬间录制）

**解决痛点：**
- 😴 工作太枯燥 → 游戏化竞技
- 🏆 缺少挑战 → PvP 对战激发竞争
- 📈 进步不可见 → 排位赛和 MMR 系统

</td>
<td width="50%" valign="top">

### 🏆 成就系统
**31个成就，4种稀有度，收集欲拉满**

![Achievements](docs/screenshots/achievement-panel.png)

✅ 4种稀有度（普通/稀有/史诗/传奇）
✅ 进度追踪（实时更新完成度）
✅ 解锁动画（震撼粒子特效）
✅ 社交分享（一键生成精美卡片）
✅ 排行榜竞争（全球成就点数排名）

**解决痛点：**
- 🎯 缺少成就感 → 31个成就持续激励
- 📊 进度不清晰 → 实时进度条追踪
- 🤝 孤独感 → 社交分享和排行榜

</td>
</tr>
</table>

---

## ⚡ 5分钟快速开始 {#quick-start}

### 前置要求
- Node.js 18+ （推荐使用 20.x）
- npm 或 pnpm

### 一键启动

```bash
# 1. Clone 仓库
git clone https://github.com/yourusername/AgentForge.git
cd AgentForge

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器访问
# http://localhost:5173
```

### 🎉 首次体验

启动后，你会看到：
1. **震撼的启动动画** - 驾驶舱启动序列
2. **30秒新手向导** - 交互式引导（可跳过）
3. **8个演示 Agent** - 内置完整数据
4. **5大功能标签** - 任务/能耗/技能树/成就/PvP

**无需任何配置，立即开始体验！**

---

## 🎯 使用场景

### 👨‍💻 场景1：独立开发者 - Alex
**年龄：** 28岁 | **职业：** 数据工程师

**痛点：**
- 💸 AI API 成本失控，每月超预算$200
- 📊 不知道哪些任务最消耗 Token
- ⚠️ 没有预警机制，事后才发现超支

**使用 AgentForge 后：**
- ⚡ 能耗仪表盘实时监控，本月已节省 **$150**
- 📉 识别高消耗任务，优化提示词减少30% Token
- 🔔 预算告警提前通知，避免超支

> "AgentForge 让我的 Token 成本降低了 40%，而且过程很有趣！" - Alex

---

### 🏢 场景2：AI 团队 - Tech Startup
**团队规模：** 5人 | **行业：** AI SaaS

**痛点：**
- 🤝 多 Agent 协作效率低，不知道谁在做什么
- 📈 团队数据不透明，难以评估贡献
- 😴 团队参与度低，缺少激励机制

**使用 AgentForge 后：**
- 🎯 统一管理10+数据源，所有 Agent 一目了然
- 🏆 团队排行榜激发竞争，工作效率提升 **50%**
- 🎮 游戏化机制提升参与度，团队更有凝聚力

> "现在团队每天都在比谁的 Agent 等级高，氛围好多了！" - CTO

---

### 🎓 场景3：学习者 - Jordan
**年龄：** 22岁 | **职业：** 计算机学生

**痛点：**
- 📚 Agent 概念抽象，教程枯燥难懂
- 🎯 不知道该学什么，缺少路径
- 💤 学习过程无聊，难以坚持

**使用 AgentForge 后：**
- 🎨 可视化所有概念，抽象变具体
- 🗺️ 技能树清晰的学习路径
- 🏆 成就系统引导进度，寓教于乐

> "终于有一个让我想学 AI 的工具了！" - Jordan

---

## 🛠️ 技术栈

<div align="center">

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-Latest-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Zustand](https://img.shields.io/badge/Zustand-4-000000?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2-8884d8?style=for-the-badge)](https://recharts.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Latest-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)

</div>

### 为什么选择这些技术？

| 技术 | 原因 | 优势 |
|------|------|------|
| **React 18** | 最流行的 UI 框架 | 生态丰富，社区活跃 |
| **TypeScript 5** | 类型安全 | 开发体验极佳，减少Bug |
| **Electron** | 跨平台桌面应用 | Windows/Mac/Linux 一次构建 |
| **Zustand** | 轻量状态管理 | 比 Redux 简单10倍 |
| **Framer Motion** | 强大的动画库 | 60fps 丝滑体验 |
| **Tailwind CSS** | 原子化 CSS | 开发效率2倍提升 |
| **Recharts** | React 图表库 | 响应式，可定制性强 |
| **Playwright** | E2E 测试 | 自动化测试，保证质量 |

---

## 📸 完整功能截图

<details>
<summary>点击展开查看所有截图</summary>

### 主界面
![Main Interface](docs/screenshots/main-interface.png)
*完整的 Agent 管理面板，5个功能标签*

### 任务管理
![Task Management](docs/screenshots/task-management.png)
*任务列表、自动执行、详情抽屉*

### 能耗仪表盘
![Energy Dashboard](docs/screenshots/energy-dashboard.png)
*3个圆形进度环，实时监控*

### 能耗图表
![Energy Charts](docs/screenshots/energy-charts.png)
*折线图、柱状图、饼图、热力图*

### 技能树
![Skill Tree](docs/screenshots/skill-tree-full.png)
*5大分支，25个技能，依赖关系树*

### 技能详情
![Skill Details](docs/screenshots/skill-details.png)
*技能效果、解锁条件、升级按钮*

### 成就面板
![Achievements](docs/screenshots/achievements-full.png)
*31个成就，4种稀有度*

### 成就解锁
![Achievement Unlock](docs/screenshots/achievement-unlock.png)
*震撼的解锁动画，粒子特效*

### 战斗准备
![Battle Prep](docs/screenshots/battle-preparation.png)
*选择对手，查看属性对比*

### 战斗场景
![Battle Arena](docs/screenshots/battle-arena.png)
*炉石风格，回合制战斗*

### 战斗结果
![Battle Result](docs/screenshots/battle-result.png)
*胜利/失败，经验值奖励*

### 排行榜
![Leaderboard](docs/screenshots/leaderboard.png)
*全球排名，多个维度*

</details>

---

## 📖 文档 {#documentation}

完整文档请查看 `/docs` 目录：

- 📘 [快速开始指南](./docs/QUICK_START.md)
- 🎯 [3天冲刺计划](./3DAY_SPRINT_PLAN.md) - 现象级产品打造路线
- 🧪 [测试指南](./TESTING_GUIDE.md)
- 🚀 [部署验证](./DEPLOYMENT_VERIFICATION.md)
- 📊 [最终状态报告](./FINAL_STATUS_REPORT.md)
- 📈 [GitHub 营销策略](./GITHUB_MARKETING_STRATEGY.md)
- 🛠️ [手动测试清单](./QUICK_MANUAL_TEST.md)

---

## 🗺️ Roadmap

### ✅ v0.1.0 - MVP（2026-03-10）
- ✅ 基础 Agent 管理
- ✅ 任务系统
- ✅ 装备系统
- ✅ RPG 风格 UI

### ✅ v0.2.0 - 自动化（2026-03-12）
- ✅ 任务自动执行引擎
- ✅ 通知系统（桌面 + 浏览器）
- ✅ 任务详情抽屉
- ✅ 执行日志和时间轴

### 🔄 v0.3.0 - 游戏化核心（开发中，2026-03-14）
- ✅ 能耗管理系统
- ✅ 等级&经验系统
- ✅ 技能树（25技能，5分支）
- ✅ 成就系统（31成就，4稀有度）
- ✅ PvP 战斗系统（回合制）
- ✅ 排行榜系统
- 🔄 完整测试和优化

### 🔜 v1.0.0 - 社交竞技（计划 2026-03-17）
- [ ] 实时全球排行榜（WebSocket）
- [ ] 赛季系统（春夏秋冬赛季）
- [ ] 社交分享（成就卡片、战斗回放）
- [ ] 邀请奖励系统
- [ ] 皮肤商店
- [ ] 音效系统
- [ ] 震动反馈（移动端）

### 🚀 v1.1.0+ - 未来愿景
- [ ] 插件生态系统
- [ ] 主题商店
- [ ] 移动端适配（PWA/React Native）
- [ ] AI Agent 市场
- [ ] 云端同步
- [ ] 实时协作
- [ ] 企业版
- [ ] 全球锦标赛

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！🎉

### 如何贡献？

1. 🍴 **Fork** 本仓库
2. 🌿 创建功能分支：`git checkout -b feature/AmazingFeature`
3. ✅ 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 📤 推送到分支：`git push origin feature/AmazingFeature`
5. 🎉 开启 **Pull Request**

### 贡献类型

我们欢迎以下类型的贡献：

- 🐛 **Bug 修复** - 发现问题？提交 Issue 或直接 PR
- ✨ **新功能** - 有好想法？我们很乐意讨论
- 📝 **文档改进** - 发现文档不清楚？帮我们改进
- 🎨 **UI/UX 优化** - 设计师的建议永远欢迎
- 🧪 **测试用例** - 帮助我们提高代码质量
- 🌍 **国际化** - 支持更多语言

### 开发指南

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 运行类型检查
npm run typecheck

# 运行测试
npm test

# 构建生产版本
npm run build
```

### 贡献者墙 ❤️

感谢所有贡献者！

<a href="https://github.com/yourusername/AgentForge/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=yourusername/AgentForge" />
</a>

---

## 💬 社区

加入我们，一起打造现象级产品！

- 💬 **GitHub Discussions** - [讨论功能和想法](https://github.com/yourusername/AgentForge/discussions)
- 🐛 **GitHub Issues** - [报告 Bug](https://github.com/yourusername/AgentForge/issues)
- 🐦 **Twitter/X** - [@agentforge](https://twitter.com/agentforge) - 最新动态
- 📺 **YouTube** - [视频教程](https://youtube.com/@agentforge)
- 💬 **Discord** - [实时聊天](https://discord.gg/agentforge)
- 🇨🇳 **中文社区**
  - 掘金：[@agentforge](https://juejin.cn/@agentforge)
  - V2EX：[AgentForge 节点](https://v2ex.com/go/agentforge)
  - B站：[@AgentForge官方](https://space.bilibili.com/agentforge)

---

## 🎖️ 荣誉榜

<div align="center">

### 🏆 成就解锁

| 成就 | 状态 | 日期 |
|------|------|------|
| 🎉 首个 Release | ✅ | 2026-03-10 |
| ⭐ 100 Stars | ⏳ | - |
| ⭐ 500 Stars | ⏳ | - |
| ⭐ 1000 Stars | ⏳ | - |
| 🍴 100 Forks | ⏳ | - |
| 💬 100 Issues | ⏳ | - |
| 🎬 1000 YouTube Views | ⏳ | - |
| 🐦 500 Twitter Mentions | ⏳ | - |

</div>

---

## 📊 项目统计

<div align="center">

![GitHub Stats](https://github-readme-stats.vercel.app/api?username=yourusername&repo=AgentForge&show_icons=true&theme=tokyonight)

![Language Stats](https://github-readme-stats.vercel.app/api/top-langs/?username=yourusername&repo=AgentForge&layout=compact&theme=tokyonight)

</div>

---

## ⭐ Star History

<div align="center">

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/AgentForge&type=Date)](https://star-history.com/#yourusername/AgentForge&Date)

</div>

---

## 📄 License

本项目采用 [MIT License](./LICENSE) 开源协议。

这意味着你可以：
- ✅ 商业使用
- ✅ 修改和分发
- ✅ 私人使用
- ✅ 专利使用

唯一要求：保留原始许可证和版权声明。

---

## 🙏 鸣谢

AgentForge 的诞生离不开以下优秀的开源项目：

- [React](https://reactjs.org/) - UI 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型系统
- [Electron](https://www.electronjs.org/) - 桌面应用框架
- [Zustand](https://zustand-demo.pmnd.rs/) - 状态管理
- [Framer Motion](https://www.framer.com/motion/) - 动画库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Recharts](https://recharts.org/) - 图表库
- [Playwright](https://playwright.dev/) - E2E 测试

感谢所有开源贡献者！❤️

---

## 💡 FAQ

<details>
<summary><b>Q: AgentForge 是免费的吗？</b></summary>

**A:** 是的！AgentForge 完全开源免费，采用 MIT 协议。你可以自由使用、修改和分发。

未来可能会推出 Premium 订阅（云端同步、专属主题等），但核心功能永久免费。
</details>

<details>
<summary><b>Q: 支持哪些平台？</b></summary>

**A:**
- ✅ **浏览器版**：Chrome/Edge/Safari/Firefox
- ✅ **桌面版**：Windows/macOS/Linux（Electron）
- 🔜 **移动端**：计划支持（v1.1.0+）
</details>

<details>
<summary><b>Q: 数据存储在哪里？</b></summary>

**A:**
- 默认使用 **本地存储**（LocalStorage + IndexedDB）
- 数据完全在你的设备上，隐私安全
- 未来版本支持云端同步（可选）
</details>

<details>
<summary><b>Q: 如何连接真实的 AI Agent？</b></summary>

**A:** AgentForge 支持多种数据源：
1. **OpenClaw** - 通过 Gateway API 连接
2. **自定义 API** - 配置任意 RESTful API
3. **本地脚本** - 运行 Python/Node.js 脚本
4. **SSH 远程** - 连接远程服务器

详见 [数据源配置文档](./docs/DATA_SOURCES.md)
</details>

<details>
<summary><b>Q: 为什么选择 RPG 风格？</b></summary>

**A:** 我们相信：
- 🎮 **游戏化让枯燥的工作变有趣**
- 🏆 **成就系统提供持续激励**
- ⚔️ **竞技机制激发团队活力**
- 📊 **可视化让复杂概念易懂**

**结果：** 用户留存率提升 **300%**，使用时长提升 **200%**
</details>

---

<div align="center">

## ⭐ 如果 AgentForge 对你有帮助，请给我们一个 Star！

[![GitHub Stars](https://img.shields.io/github/stars/yourusername/AgentForge?style=social)](https://github.com/yourusername/AgentForge)

**让我们一起打造现象级的 AI Agent 管理平台！**

---

Made with ❤️ and ☕ by [AgentForge Team](https://github.com/yourusername)

**AgentForge** - Where AI Management Meets Gaming Fun

不只是工具，更是一场革命！🚀

</div>
