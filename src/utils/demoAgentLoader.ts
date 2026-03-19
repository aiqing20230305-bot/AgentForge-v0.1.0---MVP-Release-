/**
 * 演示Agent加载器
 * 在首次启动时自动加载示例Agent
 */

import { demoAgents, shouldLoadDemoAgents, markDataLoaded, DemoAgent } from '../data/demoAgents';
import { useDataSourceStore } from '../store/useDataSourceStore';
import type { AgentData } from '../adapters/index';

/**
 * 将DemoAgent转换为AgentData格式
 */
function convertDemoAgentToAgentData(demo: DemoAgent): AgentData {
  return {
    id: demo.id,
    name: demo.name,
    avatar: demo.avatar,
    skills: demo.skills,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // 随机过去7天内
    status: 'active',
    description: demo.description,
    // 可选字段
    level: demo.level,
    vitality: demo.vitality,
    rarity: demo.evolution,
    stats: {
      totalTasks: demo.metrics?.totalTasks || 0,
      completedTasks: demo.tasks.filter(t => t.status === 'completed').length,
      successRate: demo.metrics?.successRate || 0,
      avgResponseTime: demo.metrics?.avgResponseTime || 'N/A'
    },
    tags: demo.tags || []
  } as AgentData;
}

/**
 * 加载演示Agent到数据源Store
 * 仅在首次启动时调用
 */
export function loadDemoAgentsIfNeeded(): void {
  if (!shouldLoadDemoAgents()) {
    console.log('[DemoLoader] Demo agents already loaded or user has data, skipping...');
    return;
  }

  console.log('[DemoLoader] Loading demo agents for first-time user...');

  try {
    const store = useDataSourceStore.getState();
    const convertedAgents = demoAgents.map(convertDemoAgentToAgentData);

    // 更新agents缓存
    store.updateAgentsCache(convertedAgents);

    // 标记数据已加载
    markDataLoaded();

    console.log(`[DemoLoader] ✅ Successfully loaded ${convertedAgents.length} demo agents`);
    console.log('[DemoLoader] Demo agents:', convertedAgents.map(a => a.name).join(', '));
  } catch (error) {
    console.error('[DemoLoader] Failed to load demo agents:', error);
  }
}

/**
 * 重置演示数据（用于开发/测试）
 */
export function resetDemoAgents(): void {
  localStorage.removeItem('agentforge_has_data');
  console.log('[DemoLoader] Demo agent flag reset. Refresh page to reload demos.');
}

// 导出到window用于开发调试
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).resetDemoAgents = resetDemoAgents;
  console.log('[DemoLoader] Debug function available: window.resetDemoAgents()');
}
