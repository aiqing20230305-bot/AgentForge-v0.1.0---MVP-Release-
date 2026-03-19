# 🚀 AgentForge 部署指南

**目标**: 让用户能立即在线体验，无需安装

---

## 📋 部署前检查清单

### ✅ 准备工作
- [ ] 确保项目能本地运行 (`npm run dev`)
- [ ] 测试生产构建 (`npm run build:web`)
- [ ] 清理 `.env` 中的敏感信息
- [ ] 准备环境变量配置

### ✅ 必需文件
- [x] `config/vercel.json` ✅
- [x] `config/netlify.toml` ✅
- [x] `package.json` 配置 ✅
- [x] `.gitignore` 排除敏感文件 ✅

---

## 方式 1: 部署到 Vercel（推荐 - 最简单）

### 🎯 为什么选 Vercel?
- ✅ 自动检测 Vite 项目
- ✅ 零配置自动部署
- ✅ 全球 CDN加速
- ✅ 免费HTTPS
- ✅ 每次 git push 自动部署

### 📦 Step 1: 安装 Vercel CLI
```bash
npm i -g vercel
```

### 🚀 Step 2: 部署
```bash
# 登录Vercel（首次需要）
vercel login

# 部署到生产环境
vercel --prod
```

**按照提示操作**:
1. `Set up and deploy "~/Desktop/AgentForge"?` → Y
2. `Which scope?` → 选择你的账号
3. `Link to existing project?` → N
4. `What's your project's name?` → agentforge
5. `In which directory is your code located?` → ./
6. `Want to override the settings?` → N

### ✅ 完成！
```
🎉 Production: https://agentforge-xxx.vercel.app
```

### 🔧 配置环境变量（可选）
```bash
# 在Vercel Dashboard添加环境变量
# Settings → Environment Variables

# 或使用CLI:
vercel env add VITE_APP_NAME production
```

---

## 方式 2: 部署到 Netlify

### 📦 Step 1: 安装 Netlify CLI
```bash
npm i -g netlify-cli
```

### 🚀 Step 2: 部署
```bash
# 登录Netlify
netlify login

# 初始化项目
netlify init

# 部署
netlify deploy --prod --dir=dist
```

**构建设置**:
- Build command: `npm run build:web`
- Publish directory: `dist`

### ✅ 完成！
```
🎉 Website URL: https://agentforge-xxx.netlify.app
```

---

## 方式 3: 一键部署按钮（在README中添加）

### Vercel按钮
```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-)
```

### Netlify按钮
```markdown
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-)
```

---

## 方式 4: GitHub Pages（免费）

### 📝 Step 1: 添加GitHub Actions
创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build:web

      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist
          branch: gh-pages
```

### 🔧 Step 2: 启用GitHub Pages
1. GitHub仓库 → Settings → Pages
2. Source: Deploy from a branch
3. Branch: gh-pages, folder: / (root)
4. Save

### ✅ 完成！
```
🎉 Your site is live at: https://aiqing20230305-bot.github.io/AgentForge-v0.1.0---MVP-Release-/
```

---

## 🐛 常见问题

### Q1: 构建失败 - "tsc command not found"
```bash
# 解决方案：使用npx
npm run build:web
# 或直接跳过tsc检查
vite build
```

### Q2: 部署后页面空白
**原因**: 路由路径问题

**解决方案**: 在 `vite.config.ts` 添加:
```typescript
export default defineConfig({
  base: '/', // 或者 '/AgentForge-v0.1.0---MVP-Release-/'
  ...
})
```

### Q3: 图片/资源404
**原因**: 资源路径不对

**检查**:
- 所有资源都在 `public/` 目录
- 使用相对路径 `/images/...` 而不是 `./images/...`

### Q4: 环境变量不生效
**Vite要求**: 环境变量必须以 `VITE_` 开头

**正确示例**:
```bash
VITE_APP_NAME=AgentForge     # ✅
VITE_API_URL=...             # ✅
APP_NAME=AgentForge          # ❌ 不会生效
```

---

## 🔒 安全检查清单

### 部署前确认:
- [ ] 没有泄漏 API 密钥
- [ ] 没有提交 `.env` 文件
- [ ] `.env.example` 只包含示例值
- [ ] 环境变量通过部署平台设置
- [ ] CORS 配置正确

---

## 📊 部署后验证

### ✅ 功能检查
- [ ] 首页能正常访问
- [ ] 图片/图标正常加载
- [ ] 路由导航正常
- [ ] PWA manifest正常
- [ ] Service Worker注册成功

### ⚡ 性能检查
```bash
# 使用Lighthouse测试
npx lighthouse [YOUR_DEMO_URL] --view
```

**目标分数**:
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90

---

## 🎯 部署完成后的行动

### 1. 更新README
在顶部添加醒目的Demo按钮:
```markdown
<div align="center">

# 🎮 AgentForge

**让 AI Agent 开发像玩 RPG 一样有趣**

[🚀 Try Live Demo](https://agentforge.vercel.app) •
[⭐ Star on GitHub](https://github.com/xxx/agentforge) •
[📖 Documentation](https://docs.agentforge.dev)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/xxx/agentforge)

![AgentForge Demo](https://your-demo-url.com/demo.gif)

</div>
```

### 2. 更新GitHub About
- Website: https://agentforge.vercel.app
- Description: 让 AI Agent 开发像玩 RPG 一样有趣

### 3. 社交媒体宣布
使用 `MARKETING_KIT.md` 中的模板发布

### 4. 提交到目录网站
- [ ] AlternativeTo.net
- [ ] Product Hunt
- [ ] awesome-lists

---

## 🔄 持续部署

### Vercel自动部署
每次 `git push` 到 main 分支，Vercel 自动:
1. 拉取最新代码
2. 运行 `npm run build:web`
3. 部署到生产环境
4. 生成唯一预览URL

### Netlify自动部署
类似Vercel，每次推送自动部署

---

## 💡 优化建议

### 1. 启用Gzip压缩
Vercel/Netlify 默认启用

### 2. 添加CDN缓存
已在 `config/vercel.json` 配置

### 3. 图片优化
```bash
# 压缩图片
npm i -D imagemin imagemin-cli
npx imagemin public/images/* --out-dir=public/images/optimized
```

### 4. 代码分割
Vite默认启用，无需额外配置

---

## 📈 监控部署状态

### Vercel Analytics
```bash
# 添加analytics
npm i @vercel/analytics
```

在 `main.tsx` 添加:
```typescript
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

---

## 🎉 下一步

部署完成后：

1. ✅ 获取Demo URL
2. ✅ 更新README和GitHub About
3. ✅ 在社交媒体宣布
4. ✅ 开始使用 `MARKETING_KIT.md` 推广
5. ✅ 监控流量和反馈

**现在就开始部署吧！** 🚀

```bash
# 一键部署
vercel --prod
```

**5分钟后，您的Demo就上线了！**
