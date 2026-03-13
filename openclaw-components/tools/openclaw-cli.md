---
name: openclaw-cli
description: OpenClaw 命令行工具集
tools: [Bash, Read, Write]
---

# OpenClaw CLI 工具 🛠️

OpenClaw 项目的命令行工具和管理脚本。

## 常用命令

### 查看配置
```bash
cat ~/.openclaw/openclaw.json
```

### 查看日志
```bash
# 实时日志
tail -f ~/.openclaw/logs/gateway.log

# 最近50条
tail -n 50 ~/.openclaw/logs/gateway.log

# 搜索错误
grep ERROR ~/.openclaw/logs/gateway.log
```

### 重启服务
```bash
# 查找进程
ps aux | grep openclaw

# 重启 (假设使用 PM2)
pm2 restart openclaw

# 或直接重启
pkill -f openclaw && openclaw start
```

### 测试连接
```bash
# 测试飞书 API
curl -X POST "https://open.feishu.cn/open-apis/bot/v2/hook/xxx" \
  -H "Content-Type: application/json" \
  -d '{"msg_type":"text","content":{"text":"test"}}'

# 测试 LiteLLM
curl https://cloudnative.tezign.com/litellm/api/v1/models
```

### 配置管理
```bash
# 备份配置
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.bak

# 验证 JSON 格式
python -m json.tool ~/.openclaw/openclaw.json

# 查看差异
diff ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.bak
```

### 性能监控
```bash
# 内存使用
ps aux | grep openclaw | awk '{print $4"%"}'

# 磁盘空间
du -sh ~/.openclaw/*

# 日志大小
ls -lh ~/.openclaw/logs/
```

## 管理脚本

### 健康检查
```bash
#!/bin/bash
# check_health.sh
if pgrep -f openclaw > /dev/null; then
  echo "✅ OpenClaw is running"
else
  echo "❌ OpenClaw is not running"
  exit 1
fi
```

### 自动重启
```bash
#!/bin/bash
# auto_restart.sh
if ! pgrep -f openclaw > /dev/null; then
  echo "$(date): Restarting OpenClaw"
  openclaw start
fi
```

### 日志轮转
```bash
#!/bin/bash
# rotate_logs.sh
if [ -f ~/.openclaw/logs/gateway.log ]; then
  mv ~/.openclaw/logs/gateway.log \
     ~/.openclaw/logs/gateway.log.$(date +%Y%m%d)
  touch ~/.openclaw/logs/gateway.log
fi
```
