# OpenClaw 集成测试清单

## 测试前准备

- [ ] OpenClaw Gateway 已安装
- [ ] Gateway 正在运行（`ps aux | grep openclaw`）
- [ ] 已获取有效的 Token
- [ ] 浏览器开发者工具已打开（查看日志）

## 功能测试

### 1. 基础连接测试

#### 1.1 正常连接
- [ ] 点击右上角状态指示器
- [ ] 输入正确的 URL: `ws://127.0.0.1:18789`
- [ ] 输入正确的 Token
- [ ] 点击"立即连接"
- [ ] 状态变为"已连接"（绿色）
- [ ] 显示正确的 Agent 数量
- [ ] 控制台无错误日志

#### 1.2 错误处理
- [ ] 输入错误的 URL → 显示"连接失败"
- [ ] 输入错误的 Token → 显示"认证失败"
- [ ] Gateway 未运行 → 显示"连接超时"
- [ ] 错误信息清晰明确

#### 1.3 断开连接
- [ ] 点击"断开连接"按钮
- [ ] 状态变为"未连接"（灰色）
- [ ] Agent 列表清空
- [ ] 自动同步停止

### 2. 消息协议测试

#### 2.1 标准消息
- [ ] 认证消息正常发送
- [ ] 收到认证响应
- [ ] 获取 Agent 列表成功
- [ ] 心跳 ping/pong 正常

#### 2.2 Event 类型消息（新增）
- [ ] 能够接收 `type: 'event'` 消息
- [ ] Event 消息正确转换为标准格式
- [ ] Agent 更新事件正常处理
- [ ] 控制台显示 `[OpenClawWS] 📨 Event: xxx`

### 3. 连接质量监控（新增）

#### 3.1 质量指标显示
- [ ] 连接后显示连接质量
- [ ] 显示延迟（ms）
- [ ] 显示质量等级（优秀/良好/一般/较差）
- [ ] 质量指标实时更新

#### 3.2 质量变化
- [ ] 网络良好时显示"优秀"或"良好"
- [ ] 模拟网络延迟时质量等级下降
- [ ] 质量较差时有警告提示

### 4. 自动重连测试（优化）

#### 4.1 正常重连
- [ ] 手动断开 Gateway
- [ ] 观察自动重连尝试
- [ ] 重启 Gateway
- [ ] 自动重连成功
- [ ] Agent 数据恢复

#### 4.2 指数退避策略（新增）
- [ ] 第1次重连延迟 ~2秒
- [ ] 第2次重连延迟 ~4秒
- [ ] 第3次重连延迟 ~8秒
- [ ] 第4次重连延迟 ~16秒
- [ ] 第5次重连延迟 ~30秒（最大）
- [ ] 达到最大次数后停止并提示

#### 4.3 手动重连
- [ ] 重连失败后点击"立即连接"
- [ ] 手动重连成功
- [ ] 重连计数器重置

### 5. 心跳机制测试（优化）

#### 5.1 正常心跳
- [ ] 每30秒发送一次 ping
- [ ] 收到 pong 响应
- [ ] 控制台显示心跳日志

#### 5.2 心跳丢失检测（新增）
- [ ] 模拟 pong 丢失（断开网络）
- [ ] 连续3次未收到 pong
- [ ] 自动触发重连
- [ ] 控制台显示警告

### 6. 自动同步测试

#### 6.1 基础同步
- [ ] 连接后自动启动同步
- [ ] 默认5秒间隔
- [ ] Agent 数据定期更新
- [ ] 显示最后同步时间

#### 6.2 同步控制
- [ ] 切换自动同步开关
- [ ] 同步停止/启动正常
- [ ] 手动触发同步（`window.autoSync.syncNow()`）
- [ ] 同步状态正确显示

#### 6.3 同步错误处理
- [ ] 连接断开时同步失败
- [ ] 错误计数增加
- [ ] 连续3次失败后停止
- [ ] 错误信息记录

### 7. 配置管理测试（新增）

#### 7.1 保存配置
- [ ] 点击"保存配置"按钮
- [ ] 输入配置名称
- [ ] 配置保存到 localStorage
- [ ] 可以在列表中看到保存的配置

#### 7.2 导出配置
- [ ] 点击"导出"按钮
- [ ] 下载 JSON 文件
- [ ] 文件包含完整配置（url, token）
- [ ] JSON 格式正确

#### 7.3 导入配置
- [ ] 点击"导入"按钮
- [ ] 选择之前导出的 JSON 文件
- [ ] 配置自动填充
- [ ] 可以直接连接

#### 7.4 配置验证
- [ ] 导入无效 JSON → 显示错误
- [ ] 缺少必需字段 → 显示错误
- [ ] URL 格式错误 → 显示错误
- [ ] Token 长度不足 → 显示错误

### 8. 错误处理测试（完善）

#### 8.1 用户友好提示
- [ ] 连接失败 → 清晰的错误信息
- [ ] 认证失败 → 提示检查 Token
- [ ] 超时 → 提示检查网络
- [ ] 所有错误都有中文提示

#### 8.2 错误监听
- [ ] 错误触发 `onError` 回调
- [ ] 错误信息包含详细信息
- [ ] 控制台显示完整错误堆栈

#### 8.3 错误恢复
- [ ] 错误后可以重新连接
- [ ] 状态正确重置
- [ ] 不影响其他功能

### 9. UI/UX 测试

#### 9.1 状态指示器
- [ ] 颜色正确（绿/黄/红/灰）
- [ ] 图标正确（Wifi/WifiOff/Loader）
- [ ] 文本清晰（已连接/连接中/错误/未连接）
- [ ] 动画流畅（连接中旋转，已连接脉冲）

#### 9.2 快速连接面板
- [ ] 面板布局美观
- [ ] 输入框可用性好
- [ ] 按钮状态正确（禁用/启用）
- [ ] 加载状态显示清晰

#### 9.3 连接质量显示（新增）
- [ ] 质量指标位置合理
- [ ] 颜色编码清晰（绿/蓝/黄/红）
- [ ] 延迟数值准确
- [ ] 更新及时

### 10. 性能测试

#### 10.1 连接性能
- [ ] 连接建立时间 < 2秒
- [ ] 认证响应时间 < 1秒
- [ ] 获取 Agent 列表 < 3秒

#### 10.2 同步性能
- [ ] 单次同步时间 < 1秒
- [ ] 5秒间隔不影响 UI 响应
- [ ] 大量 Agent（>100）时性能正常

#### 10.3 内存使用
- [ ] 长时间运行无内存泄漏
- [ ] 连接断开后资源释放
- [ ] 浏览器内存使用稳定

### 11. 兼容性测试

#### 11.1 浏览器兼容
- [ ] Chrome/Edge（最新版）
- [ ] Firefox（最新版）
- [ ] Safari（最新版）

#### 11.2 协议版本
- [ ] OpenClaw Gateway v1.0.0+
- [ ] 向后兼容 v0.9.x（部分功能）

### 12. 调试工具测试

#### 12.1 控制台工具
- [ ] `window.testOpenClaw()` 可用
- [ ] `window.autoSync.start()` 可用
- [ ] `window.autoSync.stop()` 可用
- [ ] `window.autoSync.syncNow()` 可用
- [ ] `window.autoSync.getStatus()` 可用

#### 12.2 日志输出
- [ ] 所有关键操作有日志
- [ ] 日志带有清晰的前缀（[OpenClawWS], [AutoSync]）
- [ ] 错误日志包含详细信息
- [ ] 日志级别合理（info/warn/error）

## 边界情况测试

### 1. 网络异常
- [ ] 网络突然断开 → 自动重连
- [ ] 网络恢复 → 重连成功
- [ ] 网络不稳定 → 质量指标反映

### 2. Gateway 异常
- [ ] Gateway 崩溃 → 显示错误
- [ ] Gateway 重启 → 自动重连
- [ ] Gateway 响应慢 → 超时处理

### 3. 并发操作
- [ ] 快速点击连接/断开 → 状态正确
- [ ] 同时多个同步请求 → 正确处理
- [ ] 连接中修改配置 → 不影响当前连接

### 4. 极端数据
- [ ] 0 个 Agent → 正确显示
- [ ] 大量 Agent（>1000） → 性能正常
- [ ] 超长 Token → 正确处理
- [ ] 特殊字符 Token → 正确处理

## 安全测试

### 1. Token 保护
- [ ] Token 在 UI 中掩码显示
- [ ] Token 不出现在日志中
- [ ] 导出配置时提示 Token 敏感性

### 2. 配置存储
- [ ] localStorage 数据加密（可选）
- [ ] 配置文件权限正确
- [ ] 敏感信息不泄露

## 文档测试

### 1. 文档完整性
- [ ] 完整文档（OPENCLAW_INTEGRATION.md）存在
- [ ] 快速参考（OPENCLAW_QUICK_REFERENCE.md）存在
- [ ] 故障排除（OPENCLAW_TROUBLESHOOTING.md）存在
- [ ] 测试清单（本文档）存在

### 2. 文档准确性
- [ ] API 文档与实际代码一致
- [ ] 示例代码可以运行
- [ ] 配置示例正确
- [ ] 故障排除方案有效

### 3. 文档可读性
- [ ] 结构清晰
- [ ] 代码格式正确
- [ ] 中英文混排合理
- [ ] 有足够的示例

## 回归测试

在每次代码更改后，至少执行以下核心测试：

- [ ] 基础连接（1.1）
- [ ] 错误处理（1.2）
- [ ] Event 消息（2.2）
- [ ] 连接质量（3.1）
- [ ] 自动重连（4.1）
- [ ] 配置导入/导出（7.2, 7.3）

## 测试报告模板

```markdown
## OpenClaw 集成测试报告

**测试日期**: 2026-03-16
**测试人员**: [姓名]
**测试环境**:
- OS: macOS 14.0
- Browser: Chrome 120
- OpenClaw Gateway: v1.0.0
- AgentForge: v1.0.0

**测试结果**:
- 总测试项: 150
- 通过: 148
- 失败: 2
- 跳过: 0

**失败项**:
1. [7.4] 配置验证 - Token 长度检查未生效
2. [10.2] 同步性能 - 大量 Agent 时同步超时

**问题详情**:
1. Token 长度验证逻辑有误，需要修复
2. 需要优化批量 Agent 处理性能

**建议**:
- 修复 Token 验证逻辑
- 添加 Agent 分页加载
- 增加性能监控

**总体评价**: ✅ 通过（98.7%）
```

## 自动化测试脚本

```bash
#!/bin/bash
# run-openclaw-tests.sh

echo "🧪 OpenClaw Integration Tests"
echo "=============================="

# 1. 检查 Gateway
echo "1. Checking Gateway..."
if pgrep -f openclaw > /dev/null; then
  echo "   ✅ Gateway is running"
else
  echo "   ❌ Gateway is not running"
  exit 1
fi

# 2. 测试连接
echo "2. Testing connection..."
node test-openclaw-connection.js
if [ $? -eq 0 ]; then
  echo "   ✅ Connection test passed"
else
  echo "   ❌ Connection test failed"
  exit 1
fi

# 3. 运行单元测试
echo "3. Running unit tests..."
npm test -- openclaw
if [ $? -eq 0 ]; then
  echo "   ✅ Unit tests passed"
else
  echo "   ❌ Unit tests failed"
  exit 1
fi

echo ""
echo "=============================="
echo "✅ All tests passed!"
```

## 持续集成

在 CI/CD 流程中添加 OpenClaw 测试：

```yaml
# .github/workflows/openclaw-tests.yml
name: OpenClaw Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run OpenClaw tests
        run: npm run test:openclaw
```

---

**测试完成后，请在任务跟踪中更新状态！**
