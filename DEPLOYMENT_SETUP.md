# World of Claudecraft - 新电脑部署指南

## 📦 项目说明
这是一个基于 Electron + React + TypeScript 的 AI Agent 可视化构建工具。

## 🔧 系统要求
- Node.js >= 18.x
- npm >= 9.x
- Git

## 🚀 快速开始

### 1. 解压项目
```bash
tar -xzf world-of-claudecraft.tar.gz
cd world-of-claudecraft
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量（可选）
如果需要使用 SeeDream/SeeDance API：
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 API Key
```

### 4. 启动开发服务器
```bash
# Web 开发模式
npm run dev

# Electron 桌面应用开发模式
npm run electron:dev
```

### 5. 构建生产版本
```bash
npm run build
```

## 📂 项目结构
```
world-of-claudecraft/
├── src/                    # 源代码
│   ├── components/         # React 组件
│   ├── stores/            # 状态管理
│   ├── services/          # 服务层
│   └── types/             # TypeScript 类型定义
├── electron/              # Electron 主进程代码
├── public/                # 静态资源
├── scripts/               # 工具脚本
├── sample-components/     # 示例组件
├── openclaw-components/   # OpenClaw 组件
└── dist/                  # 构建产物（需要构建后生成）
```

## 🔑 关键功能
1. **可视化 Agent 构建** - 类似魔兽世界的装备系统
2. **OpenClaw 集成** - 连接飞书机器人
3. **多数据源管理** - 支持不同平台的 Agent
4. **拖拽式界面** - 直观的角色构建体验

## 📝 开发文档
- `README.md` - 项目总览
- `QUICKSTART.md` - 快速开始指南
- `OPENCLAW对接指南.md` - OpenClaw 集成说明
- `TEAM_SETUP_GUIDE.md` - 团队配置指南

## ⚠️ 注意事项
1. 首次运行需要安装依赖，可能需要几分钟
2. 如果遇到权限问题，尝试使用 `sudo npm install`
3. Electron 应用需要下载对应平台的二进制文件
4. 确保防火墙允许 Node.js 访问网络

## 🐛 常见问题

### 依赖安装失败
```bash
# 清除缓存后重试
rm -rf node_modules package-lock.json
npm install
```

### Electron 启动失败
```bash
# 重新安装 Electron
npm install electron --force
```

### 端口被占用
默认端口是 5173，如果被占用可以修改 `vite.config.ts`

## 📧 支持
如遇问题请查看项目文档或联系开发团队。
