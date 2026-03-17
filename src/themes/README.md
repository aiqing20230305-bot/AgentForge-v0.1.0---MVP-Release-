# 主题系统使用指南

## 概述

AgentForge 现在支持 5 套预设主题，通过 CSS Variables 实现主题切换。

## 可用主题

1. **Dark (暗夜模式)** - 默认深色主题，适合夜间使用
2. **Light (明亮模式)** - 清新明亮主题，适合日间使用
3. **Neon (霓虹模式)** - 炫酷赛博朋克风格，充满未来感
4. **Forest (森林模式)** - 自然清新风格，让眼睛放松
5. **Ocean (深海模式)** - 平静深邃风格，如同海洋深处

## 使用方法

### 1. 在组件中使用主题

```tsx
import { useThemeStore } from '../store/useThemeStore'

function MyComponent() {
  const { currentTheme } = useThemeStore()

  return (
    <div>
      <p>当前主题: {currentTheme.name}</p>
      <p>描述: {currentTheme.description}</p>
    </div>
  )
}
```

### 2. 切换主题

```tsx
import { useThemeStore } from '../store/useThemeStore'

function ThemeButton() {
  const { setTheme } = useThemeStore()

  return (
    <button onClick={() => setTheme('neon')}>
      切换到霓虹主题
    </button>
  )
}
```

### 3. 使用 ThemeSwitcher 组件

```tsx
import { ThemeSwitcher } from '../components/ThemeSwitcher'

function Header() {
  return (
    <div>
      <h1>My App</h1>
      <ThemeSwitcher />
    </div>
  )
}
```

### 4. 使用紧凑版主题切换器

```tsx
import { ThemeSwitcherCompact } from '../components/ThemeSwitcher'

function Toolbar() {
  return (
    <div>
      <ThemeSwitcherCompact />
    </div>
  )
}
```

## CSS Variables

主题系统通过以下 CSS Variables 实现:

```css
/* 背景色 */
--color-bg-primary
--color-bg-secondary
--color-bg-tertiary

/* 文本色 */
--color-text-primary
--color-text-secondary
--color-text-muted

/* 主色调 */
--color-accent-primary
--color-accent-secondary
--color-accent-tertiary

/* 边框色 */
--color-border-primary
--color-border-secondary

/* 阴影效果 */
--shadow-primary
--shadow-secondary
--shadow-glow
```

## 在样式中使用

### Tailwind CSS

```tsx
<div className="bg-bg-primary text-text-primary border-border-primary">
  内容
</div>
```

### 内联样式

```tsx
<div style={{
  backgroundColor: 'var(--color-bg-primary)',
  color: 'var(--color-text-primary)'
}}>
  内容
</div>
```

### CSS 文件

```css
.my-class {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border-color: var(--color-border-primary);
}
```

## 本地存储

主题偏好会自动保存到本地存储 (localStorage)，下次打开应用时会自动应用上次选择的主题。

存储键: `agentforge-theme`

## API 参考

### useThemeStore

```typescript
interface ThemeStore {
  // 当前主题
  currentTheme: Theme

  // 切换主题
  setTheme: (themeId: string) => void

  // 获取所有可用主题
  getAvailableThemes: () => Theme[]

  // 重置为默认主题
  resetTheme: () => void
}
```

### Theme 接口

```typescript
interface Theme {
  id: string              // 主题ID
  name: string            // 主题名称
  description: string     // 主题描述
  colors: ThemeColors     // 颜色配置
}
```

## 扩展主题

如需添加新主题，编辑 `src/themes/themeDefinitions.ts`:

```typescript
export const customTheme: Theme = {
  id: 'custom',
  name: '自定义主题',
  description: '这是一个自定义主题',
  colors: {
    bgPrimary: '#000000',
    bgSecondary: '#111111',
    // ... 其他颜色
  }
}

// 添加到主题列表
export const themes: Theme[] = [
  darkTheme,
  lightTheme,
  neonTheme,
  forestTheme,
  oceanTheme,
  customTheme  // 新增
]
```
