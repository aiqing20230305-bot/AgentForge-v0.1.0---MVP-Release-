// 中文语言包
export const zhCN = {
  app: {
    title: 'Agent 装备大师',
    subtitle: 'OpenClaw 版'
  },
  topBar: {
    refresh: '刷新',
    export: '导出',
    settings: '设置',
    platform: '平台',
    saveToFile: '保存为文件...',
    copyToClipboard: '复制到剪贴板',
    saveToPlatform: '保存到平台'
  },
  inventory: {
    title: '组件背包',
    search: '搜索组件...',
    all: '全部',
    roles: '角色',
    skills: '技能',
    behaviors: '行为',
    personalities: '个性',
    constraints: '约束',
    contexts: '上下文',
    formats: '格式',
    tools: '工具',
    noItems: '暂无组件',
    loadComponents: '加载组件'
  },
  slots: {
    head: '头部',
    chest: '胸甲',
    hands: '手部',
    legs: '腿部',
    feet: '脚部',
    ring: '戒指',
    weapon: '武器',
    offhand: '副手'
  },
  preview: {
    title: '配置预览',
    empty: '还没有装备任何组件',
    copy: '复制',
    save: '保存',
    close: '关闭'
  },
  settings: {
    title: '设置',
    componentsDirectory: '组件目录',
    selectDirectory: '选择目录',
    tokenBudget: 'Token 预算',
    theme: '主题',
    save: '保存',
    cancel: '取消',
    openclawAgents: 'OpenClaw Agents',
    loadOpenclawAgents: '加载 OpenClaw Agents',
    agentsDirectory: 'Agents 目录'
  },
  loadouts: {
    title: '配置方案',
    save: '保存当前配置',
    load: '加载',
    delete: '删除',
    empty: '还没有保存的配置',
    name: '配置名称',
    saveName: '保存配置'
  },
  saveModal: {
    title: '保存 Agent',
    filename: '文件名',
    save: '保存',
    cancel: '取消',
    saveTo: '将保存到'
  },
  tokenBudget: {
    used: '已使用',
    budget: '预算',
    overBudget: '超出预算'
  },
  platforms: {
    claude: 'Claude',
    openai: 'OpenAI',
    gemini: 'Gemini',
    openclaw: 'OpenClaw',
    custom: '自定义'
  },
  rarity: {
    common: '普通',
    uncommon: '罕见',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  },
  messages: {
    success: '成功',
    error: '错误',
    loading: '加载中...',
    saved: '已保存',
    copied: '已复制到剪贴板',
    noPermission: '没有权限访问文件系统'
  },
  openclawAgents: {
    title: 'OpenClaw Agents',
    level: '等级',
    exp: '经验',
    status: '状态',
    online: '在线',
    offline: '离线',
    working: '工作中',
    idle: '空闲',
    role: '职位',
    skills: '技能',
    personality: '性格',
    loadAgent: '加载角色',
    viewDetails: '查看详情'
  }
}

export type TranslationKeys = typeof zhCN
export default zhCN
