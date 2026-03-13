/**
 * Agent 适配器模块导出
 */

export * from './AgentAdapter'
export * from './OpenClawAdapter'
export * from './CustomAPIAdapter'
export * from './LocalScriptAdapter'
export * from './AdapterManager'

// 默认导出适配器管理器实例
export { adapterManager as default } from './AdapterManager'
