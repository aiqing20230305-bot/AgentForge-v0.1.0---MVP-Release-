# AgentForge 示例代码

本目录包含AgentForge各项功能的示例代码。

## 可用示例

### AI助手示例 (`ai-assistant-demo.ts`)

演示如何使用AI助手服务的完整示例。

#### 运行方式

```bash
# 使用 ts-node 直接运行
npx ts-node examples/ai-assistant-demo.ts

# 或者编译后运行
npm run build
node dist/examples/ai-assistant-demo.js
```

#### 包含的演示

1. **Demo 1: 生成智能建议**
   - 分析任务数据
   - 生成各类型建议
   - 展示建议详情

2. **Demo 2: 性能指标分析**
   - 计算任务吞吐量
   - 分析平均完成时间
   - 识别性能瓶颈

3. **Demo 3: 自然语言命令**
   - 测试命令解析
   - 演示意图识别
   - 展示智能回复

4. **Demo 4: 用户习惯分析**
   - 学习工作模式
   - 统计任务完成率
   - 识别常用标签

5. **Demo 5: 针对特定Agent**
   - 为单个Agent生成建议
   - 个性化优化方案

#### 在代码中使用

```typescript
import { aiAssistant } from '../src/services/aiAssistant'
import type { Task } from '../src/types/task'

// 生成建议
const suggestions = await aiAssistant.generateSuggestions(tasks)

// 获取指标
const metrics = aiAssistant.getPerformanceMetrics(tasks)

// 解析命令
const result = await aiAssistant.parseCommand('优化任务队列', tasks)

// 查看习惯
const habits = aiAssistant.getUserHabits()
```

## 更多示例

更多示例正在开发中，敬请期待：

- [ ] 任务管理示例
- [ ] 技能树示例
- [ ] 成就系统示例
- [ ] 对战系统示例
- [ ] 自定义Hooks示例

## 贡献示例

欢迎提交你的示例代码！请遵循以下规范：

1. 在 `examples/` 目录下创建新文件
2. 使用TypeScript编写
3. 添加详细的注释说明
4. 在本README中添加说明
5. 提交Pull Request

## 许可证

与主项目相同的MIT许可证。
