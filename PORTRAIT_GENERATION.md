# 🎨 形象库生成指南

使用 SeeDream 5.0 和 SeeDance 1.5 为 SEMAS 团队生成专属形象。

---

## 📋 目标

- ✅ **30张三国主题图片**：9:16竖版，使用 SeeDream 5.0 生成
- ✅ **30个科幻主题视频**：9:16竖版，使用 SeeDance 1.5 生成

---

## 🚀 快速开始（3步）

### 1️⃣ 配置 API 密钥

```bash
# 方式 A: 环境变量（推荐）
export SEEDREAM_API_KEY=your_seedream_key_here
export SEEDANCE_API_KEY=your_seedance_key_here

# 方式 B: 创建 .env 文件
cp .env.example .env
# 编辑 .env 填入你的密钥
```

### 2️⃣ 测试 API 连接

```bash
# 先测试单个生成（推荐）
node scripts/test-generation.js

# 如果测试通过，查看生成的测试文件
ls -lh public/portraits/test-*
```

### 3️⃣ 批量生成所有形象

```bash
# 运行完整生成脚本
node scripts/generate-with-seedream.js

# 预计耗时：约 75 分钟
# - 图片生成：~30秒/张 × 30 = 15分钟
# - 视频生成：~2分钟/个 × 30 = 60分钟
```

---

## 📁 文件说明

| 文件 | 说明 |
|------|------|
| `scripts/generate-with-seedream.js` | 主生成脚本 |
| `scripts/test-generation.js` | API 测试脚本 |
| `scripts/api-adapters.js` | API 适配器（支持多种服务） |
| `scripts/SEEDREAM_GUIDE.md` | 详细使用指南 |
| `public/portraits/generation-prompts.json` | 所有角色的 Prompt 配置 |
| `.env.example` | 环境变量配置模板 |

---

## 🎯 生成清单

### 三国主题图片 (30张)

**蜀汉阵营 (8人)**
- 关羽、张飞、赵云、马超、黄忠（五虎将）
- 诸葛亮、庞统、法正（谋士）

**曹魏阵营 (7人)**
- 曹操、司马懿、郭嘉、典韦、许褚、张辽、夏侯惇

**东吴阵营 (5人)**
- 孙权、周瑜、陆逊、甘宁、太史慈

**女性角色 (4人)**
- 貂蝉、大乔、小乔、孙尚香

**其他知名 (6人)**
- 吕布、董卓、袁绍、刘备、姜维、魏延

### 科幻主题视频 (30个)

**战斗型机器人 (5个)**
- Atlas、Titan、Sentinel、Striker、Phantom

**智能型AI (5个)**
- Oracle、Nexus、Cortex、Cipher、Matrix

**辅助型机器人 (5个)**
- Medic、Engineer、Scout、Carrier、Reaper

**赛博朋克 (5个)**
- Neon、Chrome、Ghost、Blade、Pulse

**未来战士 (5个)**
- Nova、Vanguard、Spectre、Aurora、Apex

**外星种族 (5个)**
- Zephyr、Xenon、Void、Aether、Quantum

---

## 🛠️ 常见问题

### Q1: API 密钥从哪里获取？

**A:** 访问以下网站注册并获取 API Key：
- SeeDream: `https://seedream.ai/`
- SeeDance: `https://seedance.ai/`

### Q2: 如果 API 格式不匹配怎么办？

**A:** 编辑 `scripts/api-adapters.js`，修改对应的适配器类：
```javascript
// 修改请求格式
const requestData = {
  // 根据实际 API 文档修改
  prompt: prompt,
  size: { width: 768, height: 1344 },
  // ...
};

// 修改响应解析
return {
  url: response.data.image_url,  // 根据实际字段名
  // ...
};
```

### Q3: 生成速度太慢/API 限流？

**A:** 调整延迟时间：
```bash
# 修改 .env
GENERATION_DELAY_MS=10000  # 增加到 10 秒
```

### Q4: 想先测试几个角色？

**A:** 修改 `generate-with-seedream.js`：
```javascript
// 只生成前 3 个
for (let i = 0; i < Math.min(3, PROMPTS.threeKingdoms.length); i++) {
  // ...
}
```

### Q5: 生成失败如何重试？

**A:** 脚本会自动跳过已存在的文件，直接重新运行即可：
```bash
node scripts/generate-with-seedream.js
```

### Q6: 想使用其他 AI 服务（Midjourney/Replicate）？

**A:** 使用适配器工厂：
```javascript
const { AdapterFactory } = require('./api-adapters');

// Replicate
const adapter = AdapterFactory.create('replicate', {
  apiKey: 'your_key'
});

// 自定义 API
const adapter = AdapterFactory.create('custom', {
  endpoint: 'https://your-api.com/generate',
  headers: { 'Authorization': 'Bearer your_key' },
  buildRequest: (prompt, options) => ({
    prompt: prompt,
    width: options.width,
    height: options.height
  }),
  parseResponse: (response) => ({
    url: response.image_url
  })
});
```

---

## 📊 生成进度

运行后会显示实时进度：

```
╔══════════════════════════════════════════════════════╗
║   SeeDream 5.0 + SeeDance 1.5 形象生成器            ║
╚══════════════════════════════════════════════════════╝

📜 开始生成三国主题图片...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 [SeeDream] 生成图片: guanyu.png
   Prompt: Guan Yu, legendary Chinese warrior...
   ✅ 已保存: guanyu.png
   ⏳ 等待 3 秒...

🎨 [SeeDream] 生成图片: zhangfei.png
   ...

🤖 开始生成科幻主题视频...

🎬 [SeeDance] 生成视频: atlas-warrior.mp4
   ...
```

---

## 💰 预算估算

**示例价格**（仅供参考）：
- SeeDream 图片：$0.02/张
- SeeDance 视频：$0.10/个

**总成本**：
- 图片：30 × $0.02 = $0.60
- 视频：30 × $0.10 = $3.00
- **合计：~$3.60**

实际价格以服务商为准。

---

## ✅ 检查清单

生成完成后检查：

```bash
# 检查图片数量
ls public/portraits/3kingdoms/*.{png,jpg} | wc -l
# 应该显示 30

# 检查视频数量
ls public/portraits/scifi/*.mp4 | wc -l
# 应该显示 30

# 检查视频缩略图
ls public/portraits/scifi/*-thumb.{png,jpg} | wc -l
# 应该显示 30
```

---

## 🎉 完成后

### 1. 更新文件扩展名

如果生成的是 PNG 格式，更新 `src/store/portraitData.ts`：

```bash
# 批量替换
sed -i '' 's/\.svg/.png/g' src/store/portraitData.ts
```

### 2. 重启服务

```bash
# 重启前端（如果需要）
# Vite 会自动热更新，通常不需要重启
```

### 3. 刷新页面测试

```
http://localhost:5174/
```

点击 Agent 头像 → 选择形象 → 查看新生成的 60 个形象！

---

## 📞 帮助

- 📖 [详细使用指南](scripts/SEEDREAM_GUIDE.md)
- 🐛 [问题反馈](https://github.com/your-repo/issues)
- 💬 [技术讨论](https://discord.gg/your-server)

---

**预祝生成顺利！** 🚀

最后更新：2026-03-12
