/**
 * 功能开关 - Feature Gate
 * 控制免费版和Pro版功能访问权限
 */

export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
}

export enum Feature {
  // 基础功能（免费版可用）
  AGENT_MANAGEMENT = 'agent_management',
  TASK_MANAGEMENT = 'task_management',
  BASIC_ANALYTICS = 'basic_analytics',
  BASIC_THEME = 'basic_theme',

  // Pro功能
  AI_RECOMMENDATION = 'ai_recommendation',
  AI_OPTIMIZATION = 'ai_optimization',
  AI_ASSISTANT_ENHANCED = 'ai_assistant_enhanced',
  ACHIEVEMENT_CARD = 'achievement_card',
  DAILY_REPORT = 'daily_report',
  TEAM_ADVANCED = 'team_advanced',
  CUSTOM_THEME = 'custom_theme',
  ADVANCED_ANALYTICS = 'advanced_analytics',
  ADVANCED_EXPORT = 'advanced_export',
  PRIORITY_SUPPORT = 'priority_support',
  UNLIMITED_AGENTS = 'unlimited_agents',
  UNLIMITED_TASKS = 'unlimited_tasks',
}

// 功能所需的最低订阅级别
const FEATURE_PLAN_MAP: Record<Feature, SubscriptionPlan> = {
  // 免费版功能
  [Feature.AGENT_MANAGEMENT]: SubscriptionPlan.FREE,
  [Feature.TASK_MANAGEMENT]: SubscriptionPlan.FREE,
  [Feature.BASIC_ANALYTICS]: SubscriptionPlan.FREE,
  [Feature.BASIC_THEME]: SubscriptionPlan.FREE,

  // Pro功能
  [Feature.AI_RECOMMENDATION]: SubscriptionPlan.PRO,
  [Feature.AI_OPTIMIZATION]: SubscriptionPlan.PRO,
  [Feature.AI_ASSISTANT_ENHANCED]: SubscriptionPlan.PRO,
  [Feature.ACHIEVEMENT_CARD]: SubscriptionPlan.PRO,
  [Feature.DAILY_REPORT]: SubscriptionPlan.PRO,
  [Feature.TEAM_ADVANCED]: SubscriptionPlan.PRO,
  [Feature.CUSTOM_THEME]: SubscriptionPlan.PRO,
  [Feature.ADVANCED_ANALYTICS]: SubscriptionPlan.PRO,
  [Feature.ADVANCED_EXPORT]: SubscriptionPlan.PRO,
  [Feature.PRIORITY_SUPPORT]: SubscriptionPlan.PRO,
  [Feature.UNLIMITED_AGENTS]: SubscriptionPlan.PRO,
  [Feature.UNLIMITED_TASKS]: SubscriptionPlan.PRO,
}

// 功能描述（用于显示）
export const FEATURE_DESCRIPTIONS: Record<Feature, string> = {
  [Feature.AGENT_MANAGEMENT]: 'Agent创建和管理',
  [Feature.TASK_MANAGEMENT]: '任务管理',
  [Feature.BASIC_ANALYTICS]: '基础数据分析',
  [Feature.BASIC_THEME]: '基础主题',
  [Feature.AI_RECOMMENDATION]: 'AI智能任务推荐',
  [Feature.AI_OPTIMIZATION]: 'AI性能优化建议',
  [Feature.AI_ASSISTANT_ENHANCED]: '增强AI对话助手',
  [Feature.ACHIEVEMENT_CARD]: 'Agent成就卡片生成',
  [Feature.DAILY_REPORT]: '每日战报自动生成',
  [Feature.TEAM_ADVANCED]: '高级团队协作',
  [Feature.CUSTOM_THEME]: '自定义主题编辑器',
  [Feature.ADVANCED_ANALYTICS]: '高级数据分析',
  [Feature.ADVANCED_EXPORT]: '高级数据导出',
  [Feature.PRIORITY_SUPPORT]: '优先客户支持',
  [Feature.UNLIMITED_AGENTS]: '无限Agent数量',
  [Feature.UNLIMITED_TASKS]: '无限任务数量',
}

/**
 * 检查功能是否可用
 * @param feature 功能标识
 * @param userPlan 用户订阅级别
 * @returns 功能是否可用
 */
export function isFeatureAvailable(
  feature: Feature,
  userPlan: SubscriptionPlan
): boolean {
  const requiredPlan = FEATURE_PLAN_MAP[feature]

  // Pro用户可以使用所有功能
  if (userPlan === SubscriptionPlan.PRO) {
    return true
  }

  // 免费用户只能使用免费功能
  return requiredPlan === SubscriptionPlan.FREE
}

/**
 * 获取功能所需的订阅级别
 * @param feature 功能标识
 * @returns 所需订阅级别
 */
export function getFeaturePlan(feature: Feature): SubscriptionPlan {
  return FEATURE_PLAN_MAP[feature]
}

/**
 * 获取所有Pro功能列表
 */
export function getProFeatures(): Feature[] {
  return Object.entries(FEATURE_PLAN_MAP)
    .filter(([_, plan]) => plan === SubscriptionPlan.PRO)
    .map(([feature]) => feature as Feature)
}

/**
 * 获取所有免费功能列表
 */
export function getFreeFeatures(): Feature[] {
  return Object.entries(FEATURE_PLAN_MAP)
    .filter(([_, plan]) => plan === SubscriptionPlan.FREE)
    .map(([feature]) => feature as Feature)
}

/**
 * 批量检查功能可用性
 * @param features 功能列表
 * @param userPlan 用户订阅级别
 * @returns 每个功能的可用性映射
 */
export function checkFeaturesAvailability(
  features: Feature[],
  userPlan: SubscriptionPlan
): Record<Feature, boolean> {
  const result: Partial<Record<Feature, boolean>> = {}

  for (const feature of features) {
    result[feature] = isFeatureAvailable(feature, userPlan)
  }

  return result as Record<Feature, boolean>
}
