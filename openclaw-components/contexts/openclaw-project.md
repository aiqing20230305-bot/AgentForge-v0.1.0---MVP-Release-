# OpenClaw 项目上下文 🦞

## 项目概述
OpenClaw 是一个智能飞书机器人网关系统，支持多 AI 平台接入。

## 技术栈
- **后端**: Node.js / Python
- **AI 平台**: Tezign LiteLLM
- **消息平台**: 飞书开放平台
- **配置管理**: JSON 配置文件

## 目录结构
```
~/.openclaw/
├── openclaw.json          # 主配置文件
├── logs/
│   └── gateway.log       # 运行日志
├── plugins/              # 插件目录
└── cache/                # 缓存数据
```

## 配置文件位置
- 主配置: `~/.openclaw/openclaw.json`
- 日志文件: `~/.openclaw/logs/gateway.log`

## 当前机器人

### 上海小龙虾 (主力)
- App ID: `cli_a906f00e64785bd9`
- 状态: ✅ 正常运行
- 用途: 生产环境

### 湖北小龙虾 (测试)
- App ID: `cli_a922e8f4a538dbd2`
- 状态: 🧪 测试中
- 用途: 功能测试和开发

## AI API 配置
- **提供商**: Tezign LiteLLM
- **地址**: https://cloudnative.tezign.com/litellm/api/v1
- **可用模型**:
  - Claude Haiku 4.5 (快速)
  - Claude Sonnet 4.5 (平衡)
  - Claude Sonnet 4 (稳定)

## 开发原则
1. **稳定优先**: 生产环境变更需充分测试
2. **日志完善**: 关键操作必须记录日志
3. **错误处理**: 所有 API 调用需要错误处理
4. **配置驱动**: 避免硬编码，使用配置文件
5. **插件化**: 新功能优先考虑插件方式
