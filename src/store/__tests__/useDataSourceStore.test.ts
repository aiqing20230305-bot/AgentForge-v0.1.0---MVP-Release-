import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useDataSourceStore,
  DataSource,
  DataSourceType,
  OpenClawSourceConfig,
} from '../useDataSourceStore'

describe('useDataSourceStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useDataSourceStore())
    act(() => {
      // Clear all sources
      result.current.sources.forEach(source => {
        result.current.removeSource(source.id)
      })
      result.current.clearAgentsCache()
    })
  })

  describe('initialization', () => {
    it('should initialize with empty sources', () => {
      const { result } = renderHook(() => useDataSourceStore())
      expect(result.current.sources).toEqual([])
      expect(result.current.activeSourceId).toBeNull()
      expect(result.current.agentsCache).toEqual([])
    })
  })

  describe('addSource', () => {
    it('should add a new source', () => {
      const { result } = renderHook(() => useDataSourceStore())

      const newSource = {
        name: 'Test Source',
        type: 'openclaw' as DataSourceType,
        config: {
          gatewayUrl: 'http://localhost:8000',
          authToken: 'test-token',
        } as OpenClawSourceConfig,
        enabled: true,
        isDefault: false,
      }

      act(() => {
        result.current.addSource(newSource)
      })

      expect(result.current.sources).toHaveLength(1)
      expect(result.current.sources[0].name).toBe('Test Source')
      expect(result.current.sources[0].type).toBe('openclaw')
    })

    it('should set first source as default automatically', () => {
      const { result } = renderHook(() => useDataSourceStore())

      act(() => {
        result.current.addSource({
          name: 'First Source',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: false, // Even if false, should become true
        })
      })

      expect(result.current.sources[0].isDefault).toBe(true)
      expect(result.current.activeSourceId).toBe(result.current.sources[0].id)
    })

    it('should generate unique IDs for sources', () => {
      const { result } = renderHook(() => useDataSourceStore())

      act(() => {
        result.current.addSource({
          name: 'Source 1',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: false,
        })
        result.current.addSource({
          name: 'Source 2',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: false,
        })
      })

      expect(result.current.sources[0].id).not.toBe(result.current.sources[1].id)
    })

    it('should unset previous default when adding a new default source', () => {
      const { result } = renderHook(() => useDataSourceStore())

      act(() => {
        result.current.addSource({
          name: 'First Default',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: true,
        })
        result.current.addSource({
          name: 'Second Default',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: true,
        })
      })

      const defaultSources = result.current.sources.filter(s => s.isDefault)
      expect(defaultSources).toHaveLength(1)
      expect(defaultSources[0].name).toBe('Second Default')
    })
  })

  describe('updateSource', () => {
    it('should update source properties', () => {
      const { result } = renderHook(() => useDataSourceStore())

      let sourceId: string

      act(() => {
        sourceId = result.current.addSource({
          name: 'Original Name',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: false,
        })
      })

      act(() => {
        result.current.updateSource(sourceId!, { name: 'Updated Name' })
      })

      const updatedSource = result.current.sources.find(s => s.id === sourceId)
      expect(updatedSource?.name).toBe('Updated Name')
    })

    it('should update timestamp when source is modified', async () => {
      const { result } = renderHook(() => useDataSourceStore())

      let sourceId: string
      let originalTimestamp: string

      act(() => {
        sourceId = result.current.addSource({
          name: 'Test Source',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: false,
        })
      })

      const source = result.current.sources.find(s => s.id === sourceId)
      originalTimestamp = source!.updatedAt

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10))

      act(() => {
        result.current.updateSource(sourceId!, { name: 'Updated' })
      })

      const updatedSource = result.current.sources.find(s => s.id === sourceId)
      expect(updatedSource?.updatedAt).not.toBe(originalTimestamp)
    })
  })

  describe('removeSource', () => {
    it('should remove a source by ID', () => {
      const { result } = renderHook(() => useDataSourceStore())

      let sourceId: string

      act(() => {
        sourceId = result.current.addSource({
          name: 'To Be Removed',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: false,
        })
      })

      expect(result.current.sources).toHaveLength(1)

      act(() => {
        result.current.removeSource(sourceId!)
      })

      expect(result.current.sources).toHaveLength(0)
    })

    it('should set new default when removing default source', () => {
      const { result } = renderHook(() => useDataSourceStore())

      let defaultId: string
      let secondId: string

      act(() => {
        defaultId = result.current.addSource({
          name: 'Default Source',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: true,
        })
        secondId = result.current.addSource({
          name: 'Second Source',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: false,
        })
      })

      act(() => {
        result.current.removeSource(defaultId!)
      })

      const remainingSource = result.current.sources.find(s => s.id === secondId)
      expect(remainingSource?.isDefault).toBe(true)
    })

    it('should clear activeSourceId when removing active source', () => {
      const { result } = renderHook(() => useDataSourceStore())

      let sourceId: string

      act(() => {
        sourceId = result.current.addSource({
          name: 'Active Source',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: true,
        })
        result.current.setActiveSource(sourceId!)
      })

      expect(result.current.activeSourceId).toBe(sourceId)

      act(() => {
        result.current.removeSource(sourceId!)
      })

      expect(result.current.activeSourceId).toBeNull()
    })

    it('should clear agents cache from removed source', () => {
      const { result } = renderHook(() => useDataSourceStore())

      let sourceId: string

      act(() => {
        sourceId = result.current.addSource({
          name: 'Test Source',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: false,
        })

        // Add some agents to cache
        result.current.updateAgentsCache([
          {
            id: 'agent-1',
            name: 'Agent 1',
            displayName: 'Agent 1',
            sourceId: sourceId!,
            sourceName: 'Test Source',
            level: 1,
            exp: 0,
            maxExp: 100,
            coins: 0,
            completedTasks: 0,
            avatar: '🤖',
            status: 'idle',
            energyStats: {
              totalTokensUsed: 0,
              totalCostUSD: 0,
              averageTokensPerTask: 0,
              lastUpdated: new Date().toISOString(),
            },
            energyHistory: [],
            levelHistory: [],
          },
        ])
      })

      expect(result.current.agentsCache).toHaveLength(1)

      act(() => {
        result.current.removeSource(sourceId!)
      })

      expect(result.current.agentsCache).toHaveLength(0)
    })
  })

  describe('toggleSourceEnabled', () => {
    it('should toggle source enabled status', () => {
      const { result } = renderHook(() => useDataSourceStore())

      let sourceId: string

      act(() => {
        sourceId = result.current.addSource({
          name: 'Toggle Test',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: false,
        })
      })

      expect(result.current.sources[0].enabled).toBe(true)

      act(() => {
        result.current.toggleSourceEnabled(sourceId!)
      })

      expect(result.current.sources[0].enabled).toBe(false)

      act(() => {
        result.current.toggleSourceEnabled(sourceId!)
      })

      expect(result.current.sources[0].enabled).toBe(true)
    })
  })

  describe('setActiveSource', () => {
    it('should set active source by ID', () => {
      const { result } = renderHook(() => useDataSourceStore())

      let sourceId: string

      act(() => {
        sourceId = result.current.addSource({
          name: 'Active Test',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: false,
        })
      })

      act(() => {
        result.current.setActiveSource(sourceId!)
      })

      expect(result.current.activeSourceId).toBe(sourceId)
    })

    it('should allow clearing active source with null', () => {
      const { result } = renderHook(() => useDataSourceStore())

      act(() => {
        const id = result.current.addSource({
          name: 'Test',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: false,
        })
        result.current.setActiveSource(id)
      })

      expect(result.current.activeSourceId).not.toBeNull()

      act(() => {
        result.current.setActiveSource(null)
      })

      expect(result.current.activeSourceId).toBeNull()
    })
  })

  describe('getSource', () => {
    it('should retrieve source by ID', () => {
      const { result } = renderHook(() => useDataSourceStore())

      let sourceId: string

      act(() => {
        sourceId = result.current.addSource({
          name: 'Get Test',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: false,
        })
      })

      const source = result.current.getSource(sourceId!)
      expect(source).toBeDefined()
      expect(source?.name).toBe('Get Test')
    })

    it('should return undefined for non-existent ID', () => {
      const { result } = renderHook(() => useDataSourceStore())

      const source = result.current.getSource('non-existent')
      expect(source).toBeUndefined()
    })
  })

  describe('getDefaultSource', () => {
    it('should return the default source', () => {
      const { result } = renderHook(() => useDataSourceStore())

      act(() => {
        result.current.addSource({
          name: 'Default',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: true,
        })
        result.current.addSource({
          name: 'Not Default',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: false,
        })
      })

      const defaultSource = result.current.getDefaultSource()
      expect(defaultSource?.name).toBe('Default')
    })

    it('should return undefined when no default exists', () => {
      const { result } = renderHook(() => useDataSourceStore())

      const defaultSource = result.current.getDefaultSource()
      expect(defaultSource).toBeUndefined()
    })
  })

  describe('getEnabledSources', () => {
    it('should return only enabled sources', () => {
      const { result } = renderHook(() => useDataSourceStore())

      act(() => {
        result.current.addSource({
          name: 'Enabled 1',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: false,
        })
        result.current.addSource({
          name: 'Disabled',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: false,
          isDefault: false,
        })
        result.current.addSource({
          name: 'Enabled 2',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: false,
        })
      })

      const enabledSources = result.current.getEnabledSources()
      expect(enabledSources).toHaveLength(2)
      expect(enabledSources.every(s => s.enabled)).toBe(true)
    })
  })

  describe('getSourcesByType', () => {
    it('should filter sources by type', () => {
      const { result } = renderHook(() => useDataSourceStore())

      act(() => {
        result.current.addSource({
          name: 'OpenClaw 1',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost', authToken: 'token' },
          enabled: true,
          isDefault: false,
        })
        result.current.addSource({
          name: 'Custom API',
          type: 'custom-api' as DataSourceType,
          config: { apiEndpoint: 'http://api.example.com' },
          enabled: true,
          isDefault: false,
        })
        result.current.addSource({
          name: 'OpenClaw 2',
          type: 'openclaw' as DataSourceType,
          config: { gatewayUrl: 'http://localhost:8001', authToken: 'token2' },
          enabled: true,
          isDefault: false,
        })
      })

      const openclawSources = result.current.getSourcesByType('openclaw')
      expect(openclawSources).toHaveLength(2)
      expect(openclawSources.every(s => s.type === 'openclaw')).toBe(true)

      const customApiSources = result.current.getSourcesByType('custom-api')
      expect(customApiSources).toHaveLength(1)
    })
  })

  describe('agents cache', () => {
    it('should update agents cache', () => {
      const { result } = renderHook(() => useDataSourceStore())

      const mockAgents = [
        {
          id: 'agent-1',
          name: 'Agent 1',
          displayName: 'Agent 1',
          sourceId: 'source-1',
          sourceName: 'Test Source',
          level: 1,
          exp: 0,
          maxExp: 100,
          coins: 0,
          completedTasks: 0,
          avatar: '🤖',
          status: 'idle' as const,
          energyStats: {
            totalTokensUsed: 0,
            totalCostUSD: 0,
            averageTokensPerTask: 0,
            lastUpdated: new Date().toISOString(),
          },
          energyHistory: [],
          levelHistory: [],
        },
      ]

      act(() => {
        result.current.updateAgentsCache(mockAgents)
      })

      expect(result.current.agentsCache).toHaveLength(1)
      expect(result.current.agentsCache[0].name).toBe('Agent 1')
    })

    it('should get agents by source', () => {
      const { result } = renderHook(() => useDataSourceStore())

      act(() => {
        result.current.updateAgentsCache([
          {
            id: 'agent-1',
            name: 'Agent 1',
            displayName: 'Agent 1',
            sourceId: 'source-1',
            sourceName: 'Source 1',
            level: 1,
            exp: 0,
            maxExp: 100,
            coins: 0,
            completedTasks: 0,
            avatar: '🤖',
            status: 'idle',
            energyStats: {
              totalTokensUsed: 0,
              totalCostUSD: 0,
              averageTokensPerTask: 0,
              lastUpdated: new Date().toISOString(),
            },
            energyHistory: [],
            levelHistory: [],
          },
          {
            id: 'agent-2',
            name: 'Agent 2',
            displayName: 'Agent 2',
            sourceId: 'source-2',
            sourceName: 'Source 2',
            level: 1,
            exp: 0,
            maxExp: 100,
            coins: 0,
            completedTasks: 0,
            avatar: '🦾',
            status: 'idle',
            energyStats: {
              totalTokensUsed: 0,
              totalCostUSD: 0,
              averageTokensPerTask: 0,
              lastUpdated: new Date().toISOString(),
            },
            energyHistory: [],
            levelHistory: [],
          },
        ])
      })

      const source1Agents = result.current.getAgentsBySource('source-1')
      expect(source1Agents).toHaveLength(1)
      expect(source1Agents[0].name).toBe('Agent 1')
    })

    it('should clear agents cache', () => {
      const { result } = renderHook(() => useDataSourceStore())

      act(() => {
        result.current.updateAgentsCache([
          {
            id: 'agent-1',
            name: 'Agent 1',
            displayName: 'Agent 1',
            sourceId: 'source-1',
            sourceName: 'Test',
            level: 1,
            exp: 0,
            maxExp: 100,
            coins: 0,
            completedTasks: 0,
            avatar: '🤖',
            status: 'idle',
            energyStats: {
              totalTokensUsed: 0,
              totalCostUSD: 0,
              averageTokensPerTask: 0,
              lastUpdated: new Date().toISOString(),
            },
            energyHistory: [],
            levelHistory: [],
          },
        ])
      })

      expect(result.current.agentsCache).toHaveLength(1)

      act(() => {
        result.current.clearAgentsCache()
      })

      expect(result.current.agentsCache).toHaveLength(0)
    })
  })
})
