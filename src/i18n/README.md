# 🌍 AgentForge 国际化 (i18n) 系统

## 概述

AgentForge 支持4种语言的完整国际化：
- 🇨🇳 简体中文 (zh-CN)
- 🇺🇸 English (en-US)
- 🇯🇵 日本語 (ja-JP)
- 🇰🇷 한국어 (ko-KR)

## 技术栈

- **i18next** - 国际化框架核心
- **react-i18next** - React 绑定
- **i18next-browser-languagedetector** - 自动语言检测

## 项目结构

```
src/i18n/
├── config.ts                    # i18n 配置入口
├── locales/                     # 翻译资源目录
│   ├── zh-CN/
│   │   └── common.json         # 中文翻译
│   ├── en-US/
│   │   └── common.json         # 英文翻译
│   ├── ja-JP/
│   │   └── common.json         # 日文翻译
│   └── ko-KR/
│       └── common.json         # 韩文翻译
└── README.md                    # 本文档

src/components/
└── LanguageSwitcher.tsx         # 语言切换组件

src/hooks/
└── useTranslation.ts            # 翻译 Hook（类型安全）
```

## 使用指南

### 1. 在组件中使用翻译

```typescript
import { useTranslation } from '@/hooks/useTranslation'

function MyComponent() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('agent.title')}</h1>
      <button>{t('common.create')}</button>
      <p>{t('welcome', { name: 'John' })}</p>
    </div>
  )
}
```

### 2. 添加语言切换器

```typescript
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

// 紧凑版（适合顶栏）
<LanguageSwitcher variant="compact" />

// 完整版（适合设置页面）
<LanguageSwitcher variant="full" />
```

### 3. 手动切换语言

```typescript
import { useTranslation } from '@/hooks/useTranslation'

function LanguageSettings() {
  const { changeLanguage, currentLanguage } = useTranslation()

  return (
    <button onClick={() => changeLanguage('en-US')}>
      Switch to English
    </button>
  )
}
```

## 翻译资源结构

所有语言的翻译文件遵循相同的JSON结构：

```json
{
  "app_name": "AgentForge",
  "welcome": "Welcome, {{name}}!",
  "common": {
    "create": "Create",
    "delete": "Delete",
    "edit": "Edit",
    // ...更多通用操作
  },
  "agent": {
    "title": "Agent",
    "create": "Create Agent",
    "status": {
      "active": "Active",
      "idle": "Idle",
      "working": "Working",
      "offline": "Offline"
    }
  },
  "task": { /* 任务相关翻译 */ },
  "subscription": { /* 订阅相关翻译 */ },
  "features": { /* 功能相关翻译 */ }
}
```

## 支持的翻译键

### 通用操作 (common)
- `common.create` - 创建
- `common.delete` - 删除
- `common.edit` - 编辑
- `common.save` - 保存
- `common.cancel` - 取消
- `common.confirm` - 确认
- `common.close` - 关闭
- `common.search` - 搜索
- `common.filter` - 筛选
- `common.refresh` - 刷新
- `common.export` - 导出
- `common.import` - 导入
- `common.settings` - 设置
- `common.help` - 帮助
- `common.logout` - 退出登录
- `common.loading` - 加载中...
- `common.error` - 错误
- `common.success` - 成功
- `common.warning` - 警告
- `common.info` - 信息

### Agent 相关 (agent)
- `agent.title` - Agent / エージェント / 에이전트
- `agent.create` - 创建Agent
- `agent.list` - Agent列表
- `agent.detail` - Agent详情
- `agent.name` - 名称
- `agent.avatar` - 头像
- `agent.level` - 等级
- `agent.experience` - 经验值
- `agent.vitality` - 生命力
- `agent.skills` - 技能
- `agent.status.active` - 活跃 / Active / アクティブ / 활성
- `agent.status.idle` - 空闲 / Idle / アイドル / 대기
- `agent.status.working` - 工作中 / Working / 作業中 / 작업 중
- `agent.status.offline` - 离线 / Offline / オフライン / 오프라인

### Task 相关 (task)
- `task.title` - 任务
- `task.create` - 创建任务
- `task.list` - 任务列表
- `task.detail` - 任务详情
- `task.name` - 任务名称
- `task.description` - 任务描述
- `task.priority.high` - 高优先级
- `task.priority.medium` - 中优先级
- `task.priority.low` - 低优先级
- `task.status.pending` - 待处理
- `task.status.in_progress` - 进行中
- `task.status.completed` - 已完成
- `task.status.failed` - 失败
- `task.assign` - 分配任务
- `task.start` - 开始任务
- `task.complete` - 完成任务

### 订阅相关 (subscription)
- `subscription.free` - 免费版
- `subscription.pro` - Pro版
- `subscription.upgrade` - 升级到Pro
- `subscription.manage` - 管理订阅
- `subscription.usage` - 用量
- `subscription.limit_reached` - 已达到限制
- `subscription.unlimited` - 无限制

### 功能相关 (features)
- `features.ai_recommendation` - AI智能推荐
- `features.performance_optimization` - 性能优化
- `features.custom_theme` - 自定义主题
- `features.advanced_analytics` - 高级分析
- `features.team_collaboration` - 团队协作
- `features.priority_support` - 优先支持

## 语言检测机制

系统会按以下顺序自动检测用户语言：

1. **localStorage** - 用户上次选择的语言（`i18n_language` key）
2. **浏览器语言** - `navigator.language`
3. **HTML标签** - `<html lang="...">`

如果都未检测到，则使用 **zh-CN** 作为默认语言。

## 添加新翻译

### 1. 在所有语言文件中添加键值

编辑 `src/i18n/locales/{language}/common.json`：

```json
{
  "newFeature": {
    "title": "新功能标题",
    "description": "新功能描述"
  }
}
```

### 2. 更新类型定义（可选但推荐）

编辑 `src/hooks/useTranslation.ts` 添加新的类型：

```typescript
export type TranslationKeys =
  | 'newFeature.title'
  | 'newFeature.description'
  // ...existing keys
```

### 3. 在组件中使用

```typescript
const { t } = useTranslation()
console.log(t('newFeature.title'))
```

## 插值和复数

### 插值（变量替换）

```json
{
  "welcome": "Welcome, {{name}}!"
}
```

```typescript
t('welcome', { name: 'John' }) // "Welcome, John!"
```

### 复数形式

```json
{
  "items_count": "You have {{count}} item",
  "items_count_plural": "You have {{count}} items"
}
```

```typescript
t('items_count', { count: 1 })  // "You have 1 item"
t('items_count', { count: 5 })  // "You have 5 items"
```

## 调试

开发环境下，i18n 会输出调试日志到浏览器控制台：

```typescript
// config.ts
debug: process.env.NODE_ENV === 'development',
```

查看日志以检测：
- 缺失的翻译键
- 语言切换事件
- 加载的翻译资源

## 性能优化建议

1. **懒加载语言包** - 目前所有语言在初始化时加载，未来可优化为按需加载
2. **翻译缓存** - i18next 自动缓存翻译结果
3. **避免频繁切换语言** - 语言切换会触发整个应用重渲染

## 常见问题

### Q: 如何添加第5种语言？

1. 创建 `src/i18n/locales/{language-code}/common.json`
2. 在 `src/i18n/config.ts` 中导入并添加到 `resources`
3. 在 `LanguageSwitcher.tsx` 中添加到 `LANGUAGES` 数组

### Q: 翻译键不存在时会发生什么？

i18next 会返回翻译键本身作为fallback，例如：
```typescript
t('nonexistent.key') // 返回 "nonexistent.key"
```

### Q: 如何在服务器端使用翻译？

目前的配置是浏览器专用。若需服务器端渲染（SSR），需使用 `i18next-http-middleware`。

## 下一步优化

- [ ] 添加更多翻译资源（错误消息、提示文案等）
- [ ] 实现翻译文件的自动校验（确保所有语言键一致）
- [ ] 添加RTL语言支持（阿拉伯语、希伯来语）
- [ ] 集成翻译管理平台（如 Crowdin、Lokalise）
- [ ] 实现翻译的懒加载

## 相关文档

- [i18next 官方文档](https://www.i18next.com/)
- [react-i18next 文档](https://react.i18next.com/)
- [语言代码参考](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry)

---

**维护者注意**: 修改翻译时请同步更新所有4种语言的文件，保持键结构一致！
