/**
 * Agent Detail Helper
 * Provides utilities to access the Agent Detail Page
 */

import { useDataSourceStore } from '../store/useDataSourceStore'

/**
 * 显示Agent详情页
 * 使用方法: window.showAgentDetail('atlas')
 */
export function setupAgentDetailHelper() {
  // @ts-ignore
  window.showAgentDetail = (agentId: string) => {
    const { agentsCache } = useDataSourceStore.getState()
    const agent = agentsCache.find(a => a.id === agentId)

    if (!agent) {
      console.error(`Agent not found: ${agentId}`)
      console.log('Available agents:', agentsCache.map(a => ({ id: a.id, name: a.displayName })))
      return
    }

    console.log(`Opening detail page for agent: ${agent.displayName}`)

    // Dispatch a custom event to trigger the detail page
    const event = new CustomEvent('show-agent-detail', { detail: { agentId } })
    window.dispatchEvent(event)
  }

  // @ts-ignore
  window.listAgents = () => {
    const { agentsCache } = useDataSourceStore.getState()
    console.log('Available Agents:')
    agentsCache.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.displayName} (id: ${agent.id}) - Level ${agent.level} - ${agent.role}`)
    })
    return agentsCache
  }

  console.log('[AgentDetailHelper] Helper functions registered:')
  console.log('  - window.showAgentDetail(agentId) - Show agent detail page')
  console.log('  - window.listAgents() - List all available agents')
}
