# 🎨 SeeDream 5.0 + SeeDance 1.5 使用指南

## 📋 概述

使用 SeeDream 5.0 生成 30 张三国主题竖版图片，使用 SeeDance 1.5 生成 30 个科幻主题竖版视频。

---

## 🚀 快速开始

### 步骤 1: 配置 API 密钥

```bash
# 复制环境变量配置模板
cp .env.example .env

# 编辑 .env 文件，填入你的 API 密钥
vim .env
```

**需要配置的变量：**
```bash
SEEDREAM_API_KEY=your_actual_api_key
SEEDANCE_API_KEY=your_actual_api_key
```

### 步骤 2: 运行生成脚本

```bash
# 方式 1: 使用环境变量
export SEEDREAM_API_KEY=your_key
export SEEDANCE_API_KEY=your_key
node scripts/generate-with-seedream.js

# 方式 2: 使用 dotenv (推荐)
npm install dotenv
node -r dotenv/config scripts/generate-with-seedream.js
```

### 步骤 3: 查看生成结果

```bash
# 三国图片
ls -lh public/portraits/3kingdoms/

# 科幻视频
ls -lh public/portraits/scifi/
```

---

## 🔧 API 对接说明

### SeeDream 5.0 API 格式

**请求示例：**
```javascript
POST https://api.seedream.ai/v1/generate
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_API_KEY

Body:
{
  "model": "seedream-5.0",
  "prompt": "Guan Yu, legendary Chinese warrior...",
  "width": 768,
  "height": 1344,
  "num_inference_steps": 50,
  "guidance_scale": 7.5,
  "negative_prompt": "blurry, low quality..."
}
```

**响应示例：**
```json
{
  "image_url": "https://cdn.seedream.ai/...",
  "image_base64": "iVBORw0KGgoAAAANS...",
  "seed": 42
}
```

### SeeDance 1.5 API 格式

**请求示例：**
```javascript
POST https://api.seedance.ai/v1/generate
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_API_KEY

Body:
{
  "model": "seedance-1.5",
  "prompt": "Futuristic warrior robot Atlas...",
  "width": 576,
  "height": 1024,
  "num_frames": 120,
  "fps": 30,
  "guidance_scale": 7.5
}
```

**响应示例：**
```json
{
  "video_url": "https://cdn.seedance.ai/...",
  "thumbnail_url": "https://cdn.seedance.ai/...",
  "duration": 4.0
}
```

---

## 📊 生成任务清单

### 三国主题图片 (30张)

**人物列表：**
1. 关羽、张飞、赵云、马超、黄忠（五虎将）
2. 诸葛亮、庞统、法正（蜀汉谋士）
3. 曹操、司马懿、郭嘉、典韦、许褚、张辽、夏侯惇（曹魏）
4. 孙权、周瑜、陆逊、甘宁、太史慈（东吴）
5. 貂蝉、大乔、小乔、孙尚香（女性）
6. 吕布、董卓、袁绍、刘备、姜维、魏延（其他）

**生成参数：**
- 尺寸: 768 x 1344 (9:16)
- 风格: Chinese ancient warrior portrait
- 质量: High detailed, cinematic lighting

### 科幻主题视频 (30个)

**角色列表：**
1. 战斗型机器人（5个）：Atlas、Titan、Sentinel、Striker、Phantom
2. 智能型AI（5个）：Oracle、Nexus、Cortex、Cipher、Matrix
3. 辅助型（5个）：Medic、Engineer、Scout、Carrier、Reaper
4. 赛博朋克（5个）：Neon、Chrome、Ghost、Blade、Pulse
5. 未来战士（5个）：Nova、Vanguard、Spectre、Aurora、Apex
6. 外星种族（5个）：Zephyr、Xenon、Void、Aether、Quantum

**生成参数：**
- 尺寸: 576 x 1024 (9:16)
- 时长: 4秒 @ 30fps
- 风格: Futuristic sci-fi character video
- 质量: Smooth motion, cinematic

---

## 🛠️ 脚本修改指南

### 如果 API 格式不同

编辑 `scripts/generate-with-seedream.js`：

**1. 修改请求格式**
```javascript
// 在 generateImageWithSeeDream 函数中
const requestData = {
  // 根据实际 API 文档修改字段名
  model: 'seedream-5.0',
  prompt: prompt,
  // ...
};
```

**2. 修改响应处理**
```javascript
// 根据 API 返回的字段名修改
if (result.image_url) {
  // 或 result.data.url、result.images[0] 等
  await downloadFile(result.image_url, outputPath);
}
```

**3. 添加错误重试**
```javascript
async function generateWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`   ⚠️  重试 ${i + 1}/${maxRetries}...`);
      await delay(5000);
    }
  }
}
```

---

## 💡 常见问题

### Q: API 限流怎么办？

**A:** 增加延迟时间
```bash
# 修改 .env
GENERATION_DELAY_MS=10000  # 10秒
```

### Q: 生成失败如何重试？

**A:** 脚本支持自动重试，修改重试次数：
```bash
MAX_RETRIES=5
```

### Q: 想先测试单个生成？

**A:** 修改脚本，注释掉循环：
```javascript
// 只生成第一个
const char = PROMPTS.threeKingdoms[0];
await generateImageWithSeeDream(char.prompt, char.file);
```

### Q: 生成的文件格式不对？

**A:** 检查并修改文件扩展名：
```javascript
// PNG 格式
char.file.replace('.jpg', '.png')

// WEBP 格式
char.file.replace('.jpg', '.webp')
```

---

## 📦 批量下载工具

如果 API 返回的是 URL，创建批量下载脚本：

```bash
# download-batch.sh
#!/bin/bash

while IFS= read -r url; do
  filename=$(basename "$url")
  wget -O "public/portraits/3kingdoms/$filename" "$url"
  sleep 3
done < urls.txt
```

---

## 🎯 优化建议

### 1. 使用队列系统
```javascript
const queue = require('bull');
const imageQueue = new queue('image-generation');

imageQueue.process(async (job) => {
  return await generateImageWithSeeDream(job.data.prompt, job.data.file);
});
```

### 2. 添加进度条
```bash
npm install cli-progress
```

```javascript
const cliProgress = require('cli-progress');
const bar = new cliProgress.SingleBar({});

bar.start(30, 0);
// 每次生成后
bar.increment();
bar.stop();
```

### 3. 保存生成记录
```javascript
const log = {
  timestamp: new Date().toISOString(),
  success: [],
  failed: []
};

fs.writeFileSync('generation-log.json', JSON.stringify(log, null, 2));
```

---

## 📞 技术支持

- **SeeDream 文档**: https://docs.seedream.ai/
- **SeeDance 文档**: https://docs.seedance.ai/
- **问题反馈**: [GitHub Issues](https://github.com/your-repo/issues)

---

**生成时间估算：**
- 图片生成：~30秒/张 × 30张 = ~15分钟
- 视频生成：~2分钟/个 × 30个 = ~60分钟
- **总计：~75分钟**（含延迟）

**预算估算：**（示例）
- SeeDream: $0.02/张 × 30 = $0.60
- SeeDance: $0.10/个 × 30 = $3.00
- **总计：~$3.60**

---

最后更新：2026-03-12
