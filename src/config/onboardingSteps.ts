/**
 * 新手引导步骤配置
 * Onboarding Steps Configuration
 */

import { OnboardingStep } from '../services/onboardingManager'

/**
 * AgentForge 新手引导步骤
 */
export const onboardingSteps: OnboardingStep[] = [
  // 步骤 1: 欢迎
  {
    id: 'welcome',
    title: '欢迎来到 AgentForge',
    content:
      'AgentForge 是一个强大的 AI Agent 管理平台。让我们通过快速引导，帮助你了解核心功能。',
    placement: 'center',
    media: {
      type: 'image',
      url: '/assets/onboarding/welcome.png',
    },
  },

  // 步骤 2: Agent 面板
  {
    id: 'agent-panel',
    title: 'Agent 管理面板',
    content:
      '这里显示所有的 Agent。你可以查看 Agent 的状态、等级、技能和生命力指标。点击 Agent 卡片可查看详细信息。',
    target: '[data-tour="agent-panel"]',
    placement: 'right',
    beforeShow: () => {
      // 确保 Agent 面板可见
      console.log('[Onboarding] Showing agent panel')
    },
  },

  // 步骤 3: 数据源连接
  {
    id: 'data-source',
    title: '连接数据源',
    content:
      'AgentForge 尊重用户隐私，不会自动扫描外部服务。点击"数据源"按钮，手动配置 OpenClaw 或其他数据源连接。',
    target: '[data-tour="data-source-button"]',
    placement: 'bottom',
  },

  // 步骤 4: 任务管理
  {
    id: 'task-management',
    title: '任务管理',
    content:
      '在右侧面板可以查看和管理所有任务。支持创建新任务、分配给 Agent、跟踪进度等功能。',
    target: '[data-tour="task-panel"]',
    placement: 'left',
  },

  // 步骤 5: 快捷键
  {
    id: 'hotkeys',
    title: '强大的快捷键系统',
    content:
      '使用快捷键提升效率！按 Cmd+K (Mac) 或 Ctrl+K (Windows) 打开全局搜索。按 Cmd+/ 或 Ctrl+/ 查看所有快捷键。',
    placement: 'center',
    action: {
      label: '查看快捷键',
      onClick: () => {
        // 打开快捷键帮助
        console.log('[Onboarding] Open hotkey help')
      },
    },
  },

  // 步骤 6: 通知中心
  {
    id: 'notifications',
    title: '通知中心',
    content:
      '点击铃铛图标查看所有通知。系统会在 Agent 状态变化、任务完成等事件时发送通知。',
    target: '[data-tour="notification-bell"]',
    placement: 'bottom',
  },

  // 步骤 7: 主题切换
  {
    id: 'theme',
    title: '个性化主题',
    content:
      'AgentForge 支持亮色和暗色主题。点击主题切换按钮，选择你喜欢的外观。Pro 用户还可以自定义主题颜色。',
    target: '[data-tour="theme-switcher"]',
    placement: 'bottom',
  },

  // 步骤 8: 完成
  {
    id: 'complete',
    title: '准备就绪！',
    content:
      '你已经了解了 AgentForge 的核心功能。现在可以开始使用了！如果需要帮助，随时点击右上角的设置按钮，选择"重新开始引导"。',
    placement: 'center',
    action: {
      label: '开始使用',
      onClick: () => {
        console.log('[Onboarding] Start using')
      },
    },
  },
]

/**
 * 根据用户角色过滤步骤
 */
export function getOnboardingStepsByRole(role: 'free' | 'pro'): OnboardingStep[] {
  if (role === 'free') {
    // 免费用户跳过 Pro 相关步骤
    return onboardingSteps.filter((step) => step.id !== 'custom-theme')
  }
  return onboardingSteps
}

/**
 * 获取步骤数量
 */
export function getOnboardingStepsCount(): number {
  return onboardingSteps.length
}

export default onboardingSteps
