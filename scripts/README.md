# 📁 Scripts 目录说明

## 🎨 形象生成相关

### 核心脚本

| 文件 | 用途 | 运行命令 |
|------|------|---------|
| `generate-portraits.js` | 生成 Prompt 配置 | `node scripts/generate-portraits.js` |
| `create-placeholder-images.js` | 生成 SVG 占位图 | `node scripts/create-placeholder-images.js` |
| `generate-with-seedream.js` | 🔥 主生成脚本 | `node scripts/generate-with-seedream.js` |
| `test-generation.js` | 🧪 API 测试工具 | `node scripts/test-generation.js` |
| `api-adapters.js` | API 适配器库 | `require('./api-adapters')` |

### 文档

| 文件 | 说明 |
|------|------|
| `SEEDREAM_GUIDE.md` | 详细使用指南 |
| `../PORTRAIT_GENERATION.md` | 快速开始指南 |

---

## 🚀 快速使用流程

```bash
# 1. 生成 Prompt 配置（已完成）
node scripts/generate-portraits.js

# 2. 生成 SVG 占位图（已完成）
node scripts/create-placeholder-images.js

# 3. 配置 API 密钥
export SEEDREAM_API_KEY=your_key
export SEEDANCE_API_KEY=your_key

# 4. 测试 API
node scripts/test-generation.js

# 5. 批量生成
node scripts/generate-with-seedream.js
```

---

## 📦 其他脚本

### OpenClaw Bridge

| 文件 | 用途 |
|------|------|
| `openclaw-bridge.js` | OpenClaw API 桥接 |
| `openclaw-bridge-semas.js` | SEMAS 团队 API 桥接 |

### 任务数据

| 文件 | 用途 |
|------|------|
| `semas-tasks-data.json` | SEMAS 任务历史数据 |

---

## 🔧 工具函数

所有脚本共享的工具函数位于 `api-adapters.js`：

```javascript
const { AdapterFactory } = require('./api-adapters');

// 创建适配器
const seedream = AdapterFactory.create('seedream', {
  apiKey: 'your_key',
  baseUrl: 'https://api.seedream.ai/v1'
});

// 生成图片
const result = await seedream.generateImage('prompt here');
```

---

## 📊 生成的文件

### Prompt 配置
```
public/portraits/generation-prompts.json
```

### SVG 占位图
```
public/portraits/3kingdoms/*.svg  (30个)
public/portraits/scifi/*-thumb.svg  (30个)
```

### 真实生成的形象
```
public/portraits/3kingdoms/*.png  (将来)
public/portraits/scifi/*.mp4      (将来)
public/portraits/scifi/*-thumb.jpg (将来)
```

---

## 💡 开发提示

### 添加新的 AI 服务

1. 在 `api-adapters.js` 中添加新的适配器类：
```javascript
class NewServiceAdapter {
  async generateImage(prompt, options) {
    // 实现你的 API 调用
  }
}
```

2. 在 `AdapterFactory` 中注册：
```javascript
case 'newservice':
  return new NewServiceAdapter(config);
```

3. 使用：
```javascript
const adapter = AdapterFactory.create('newservice', { apiKey: 'key' });
```

---

## 🐛 调试

### 查看 API 请求
```javascript
// 在 api-adapters.js 的 httpRequest 函数中添加
console.log('Request:', url, options);
```

### 查看 API 响应
```javascript
// 在适配器的 generate 方法中添加
console.log('Response:', response);
```

### 测试单个生成
```bash
# 修改 generate-with-seedream.js
# 注释掉循环，只保留第一个
```

---

最后更新：2026-03-12
