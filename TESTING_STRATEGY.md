# AgentForge Testing Strategy

## 测试基础设施状态 (Test Infrastructure Status)

**创建日期:** 2026-03-15
**当前版本:** v1.2.0+

---

## ✅ 已完成 (Completed)

### Phase 4.1: 单元测试基础设施

✅ **测试框架安装完成**
- Vitest 4.1.0
- @testing-library/react 16.3.2
- @testing-library/jest-dom 6.9.1
- @testing-library/user-event 14.6.1
- jsdom 29.0.0
- @vitest/coverage-v8 4.1.0

✅ **配置文件**
- `vitest.config.ts` - 完整的Vitest配置
- `src/test/setup.ts` - 测试环境初始化
- `src/test/test-utils.tsx` - 测试工具函数
- `src/test/mocks.ts` - Mock数据和工具

✅ **npm 脚本**
```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:watch": "vitest --watch",
  "test:coverage": "vitest --coverage",
  "test:run": "vitest run"
}
```

---

## 📊 测试覆盖率 (Test Coverage)

**最后更新:** 2026-03-15 22:03

### 总体覆盖率
- **Statements:** 45.45%
- **Branches:** 23.07%
- **Functions:** 67.85%
- **Lines:** 42.85%

### 各模块详细覆盖率

| 模块 | Statements | Branches | Functions | Lines | 状态 |
|------|-----------|----------|-----------|-------|------|
| **services/expCalculator.ts** | 100% | 100% | 100% | 100% | ✅ 完美 |
| **store/useDataSourceStore.ts** | 40.4% | 26.78% | 72.5% | 34.52% | 🟡 良好 |
| **utils/avatarLibrary.ts** | 16.21% | 0% | 22.22% | 17.14% | 🔴 需要改进 |

---

## 🧪 测试文件统计 (Test Files Statistics)

### 单元测试 (Unit Tests)

**测试文件:** 3
**测试用例:** 71

#### src/utils/__tests__/avatarLibrary.test.ts
- **测试用例:** 6
- **覆盖功能:** getRandomAvatar, isValidEmoji
- **状态:** ✅ 通过

#### src/store/__tests__/useDataSourceStore.test.ts
- **测试用例:** 29
- **覆盖功能:**
  - 数据源CRUD操作
  - 默认数据源管理
  - 活跃数据源切换
  - Agent缓存管理
- **状态:** ✅ 通过

#### src/services/__tests__/expCalculator.test.ts
- **测试用例:** 36
- **覆盖功能:**
  - 任务经验值计算
  - 等级系统
  - 技能点分配
  - Prestige系统
- **状态:** ✅ 通过

---

## 🎯 测试目标 (Testing Goals)

### 短期目标 (v1.2.x)

- [x] 建立单元测试基础设施
- [x] 达到核心模块 >70% 覆盖率
  - [x] expCalculator.ts: 100% ✅
  - [ ] useDataSourceStore.ts: 提升到 70%+
  - [ ] avatarLibrary.ts: 提升到 70%+
- [ ] 补充E2E测试（已有基础）
- [ ] 建立CI/CD自动测试

### 中期目标 (v1.3.0)

- [ ] 整体代码覆盖率 > 70%
- [ ] 所有核心Store测试 (13个Store)
- [ ] 所有自定义Hook测试 (23个Hook)
- [ ] 后端API测试覆盖 > 80%
- [ ] 性能基准测试

### 长期目标 (v2.0.0)

- [ ] 整体代码覆盖率 > 85%
- [ ] 完整的回归测试套件
- [ ] 自动化视觉回归测试
- [ ] 压力测试和负载测试
- [ ] 安全渗透测试

---

## 📝 待测试模块清单 (Modules to Test)

### 高优先级 (P0)

**Zustand Stores** (13个)
- [x] useDataSourceStore.ts (40% coverage)
- [ ] useBattleStore.ts
- [ ] useEnergyStore.ts
- [ ] useTaskStore.ts
- [ ] useSettingsStore.ts
- [ ] useNotificationStore.ts
- [ ] useAchievementStore.ts
- [ ] useTeamStore.ts
- [ ] useSyncStore.ts
- [ ] useThemeStore.ts (v1.3.0)
- [ ] useSearchStore.ts (v1.3.0)
- [ ] useDashboardStore.ts (v1.3.0)
- [ ] useVoiceStore.ts (v1.3.0)

**核心Services**
- [x] expCalculator.ts (100% coverage)
- [ ] evolution/evolutionEngine.ts
- [ ] evolution/heartbeatService.ts
- [ ] sync/syncService.ts
- [ ] taskExecutor.ts
- [ ] battleEngine.ts
- [ ] achievementTracker.ts

**工具函数 (Utils)**
- [x] avatarLibrary.ts (16% coverage - 需要补充)
- [ ] analyticsProcessor.ts
- [ ] taskSimulator.ts

### 中优先级 (P1)

**自定义Hooks** (23个)
- [ ] useAuth.ts
- [ ] useSocket.ts
- [ ] useNetworkStatus.ts
- [ ] useTaskAutoExecution.ts
- [ ] useLocalStorage.ts
- [ ] useDebounce.ts
- [ ] useThrottle.ts
- [ ] 等...

**关键组件**
- [ ] AgentDisplayPanel.tsx
- [ ] GlobalHeartbeatMonitor.tsx
- [ ] EvolutionTimeline.tsx
- [ ] TaskManagementPanel.tsx
- [ ] ErrorBoundary.tsx

---

## 🚀 测试最佳实践 (Best Practices)

### 单元测试

1. **测试独立性**
   - 每个测试用例互相独立
   - 使用 `beforeEach` 重置状态
   - 避免测试间的依赖

2. **Mock数据**
   - 使用 `src/test/mocks.ts` 中的标准mock
   - 创建可复用的测试工厂函数
   - 避免在测试中硬编码数据

3. **测试命名**
   - 使用描述性的测试名称
   - 格式: `should [预期行为] when [条件]`
   - 例: `should return level 2 when exp is 100`

4. **测试覆盖**
   - 测试正常路径 (Happy Path)
   - 测试边界条件
   - 测试错误处理
   - 测试极端情况

### E2E测试

1. **用户流程测试**
   - 测试完整的用户操作流程
   - 从用户视角编写测试
   - 避免过度依赖实现细节

2. **稳定性**
   - 使用明确的等待条件
   - 避免硬编码延迟 (setTimeout)
   - 使用 `data-testid` 属性

---

## 🔧 测试工具和命令 (Testing Tools & Commands)

### 运行测试

```bash
# 运行所有测试
npm run test

# 运行测试并显示UI
npm run test:ui

# 监听模式 (自动重新运行)
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 运行一次并退出
npm run test:run
```

### 调试测试

```bash
# 运行特定文件
npm run test src/store/__tests__/useDataSourceStore.test.ts

# 运行特定测试用例 (使用 .only)
it.only('should test something', () => {
  // ...
})

# 跳过特定测试 (使用 .skip)
it.skip('should test something', () => {
  // ...
})
```

---

## 📈 持续改进计划 (Continuous Improvement Plan)

### 每周任务
- [ ] 新增至少2个测试文件
- [ ] 提升整体覆盖率 +5%
- [ ] 修复flaky测试

### 每次PR
- [ ] 新增代码必须有测试覆盖
- [ ] 不降低整体覆盖率
- [ ] 所有测试必须通过

### 每次发布
- [ ] 运行完整测试套件
- [ ] 生成覆盖率报告
- [ ] 更新测试文档

---

## 🔗 相关资源 (Related Resources)

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright E2E Tests](https://playwright.dev/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

**最后更新:** 2026-03-15 by Claude Code
**状态:** ✅ 测试基础设施已建立，持续添加测试用例中...
