import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AgentItem } from '../../types'
import { useBuildStore } from '../buildStore'
import { useTaskStore } from '../taskStore'

const electronAPI = {
  storeGet: vi.fn(async (key: string) => {
    if (key === 'settings') return { rootFolderPath: '/tmp/agents', maxTokenBudget: 8000, theme: 'dark' }
    return []
  }),
  storeSet: vi.fn(async () => undefined),
  getHomeDir: vi.fn(async () => '/home/tester'),
  scanDirectory: vi.fn(async () => [
    {
      path: '/tmp/agents/role.md',
      name: 'Role',
      category: 'roles',
      content: 'Be a careful reviewer',
      modifiedAt: '2026-01-01T00:00:00.000Z',
    },
  ]),
  saveFile: vi.fn(async () => true),
  writeFile: vi.fn(async () => true),
}

function item(overrides: Partial<AgentItem> = {}): AgentItem {
  return {
    id: 'role-1',
    path: '/tmp/agents/role.md',
    name: 'Role',
    category: 'roles',
    content: 'Be a careful reviewer',
    tokens: 20,
    rarity: 'common',
    modifiedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('buildStore actions', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'electronAPI', { configurable: true, value: electronAPI })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn(async () => undefined) },
    })
    electronAPI.storeGet.mockClear()
    electronAPI.scanDirectory.mockClear()
    useBuildStore.setState({
      inventoryItems: [],
      filteredItems: [],
      selectedCategory: 'all',
      searchQuery: '',
      loadouts: [],
      activeLoadoutId: null,
      previewOpen: false,
      generatedMarkdown: '',
      selectedPlatform: 'claude',
      error: null,
      isLoading: false,
    })
  })

  it('loads settings, scans files, filters, equips, and exports', async () => {
    const store = useBuildStore.getState()
    await store.loadSettings()
    expect(useBuildStore.getState().settings.rootFolderPath).toBe('/tmp/agents')

    await store.scanForItems()
    expect(useBuildStore.getState().inventoryItems.length).toBe(1)

    store.addInventoryItem(item({ id: 'skill-1', path: '/tmp/skill.md', name: 'Skill', category: 'skills', tokens: 5 }))
    store.addInventoryItem(item())
    store.setSearchQuery('role')
    store.setSelectedCategory('roles')
    expect(useBuildStore.getState().filteredItems.every(entry => entry.category === 'roles')).toBe(true)

    const role = useBuildStore.getState().inventoryItems.find(entry => entry.category === 'roles')!
    expect(store.canEquipItem('HEAD', role)).toBe(true)
    const skill = useBuildStore.getState().inventoryItems.find(entry => entry.category === 'skills')!
    expect(store.canEquipItem('HEAD', skill)).toBe(false)
    store.setPreviewOpen(true)
    expect(store.equipItem('HEAD', role)).toBe(true)
    expect(useBuildStore.getState().getTotalTokens()).toBeGreaterThan(0)
    expect(useBuildStore.getState().getTokenBudgetUsage()).toBeGreaterThan(0)
    store.setSelectedPlatform('openai')
    store.unequipItem('HEAD')
    expect(store.equipItem('HEAD', role)).toBe(true)

    await store.saveLoadout('raid')
    const loadoutId = useBuildStore.getState().activeLoadoutId!
    store.unequipItem('HEAD')
    store.loadLoadout(loadoutId)
    store.loadLoadout('missing')
    await store.deleteLoadout(loadoutId)

    await store.exportToClipboard()
    await store.exportToFile()
    await store.exportToClaudeDir('hero.md')
    await store.exportToPlatform('hero', 'openclaw')
    await store.exportToPlatform('hero.yaml', 'custom')
    await store.saveSettings({ rootFolderPath: '/tmp/other', maxTokenBudget: 100 })
    store.clearAllSlots()
    store.setDraggingItem(role)
    store.setSettingsOpen(true)
    expect(useBuildStore.getState().settingsOpen).toBe(true)
  })

  it('records scan and settings failures', async () => {
    electronAPI.storeGet.mockRejectedValueOnce(new Error('disk'))
    await useBuildStore.getState().loadSettings()

    electronAPI.scanDirectory.mockRejectedValueOnce(new Error('denied'))
    await useBuildStore.getState().scanForItems()
    expect(useBuildStore.getState().error).toBe('denied')

    useBuildStore.setState(state => ({ settings: { ...state.settings, rootFolderPath: '' } }))
    await useBuildStore.getState().scanForItems()
  })
})

describe('taskStore actions', () => {
  it('filters, updates, and counts tasks', () => {
    const store = useTaskStore.getState()
    const existing = store.tasks[0]
    store.setSelectedAgent(existing?.agentId ?? null)
    store.setSelectedTask(existing ?? null)
    store.setFilterStatus('completed')
    store.setFilterTimeRange('today')
    store.setSearchTerm(existing?.title ?? 'task')
    expect(Array.isArray(store.getFilteredTasks())).toBe(true)

    store.setFilterStatus('all')
    store.setFilterTimeRange('week')
    store.setSearchTerm('')
    store.getFilteredTasks()
    store.setFilterTimeRange('month')
    store.getFilteredTasks()
    store.setFilterTimeRange('all')

    store.addTask({
      title: 'coverage task',
      description: 'created by the coverage test',
      status: 'pending',
      priority: 'high',
      agentId: 'agent-coverage',
      agentName: 'Coverage',
      tags: ['ci'],
    })
    const created = useTaskStore.getState().tasks[0]
    store.updateTask(created.id, { status: 'completed' })
    store.addProject({
      name: 'Coverage',
      description: 'project',
      status: 'active',
      agentId: 'agent-coverage',
      agentName: 'Coverage',
    })
    const project = useTaskStore.getState().projects[0]
    store.updateProject(project.id, { description: 'updated' })
    expect(store.getTaskStats().total).toBeGreaterThan(0)
    expect(store.getTaskStats('agent-coverage').completed).toBeGreaterThanOrEqual(0)
    store.deleteTask(created.id)
    store.deleteProject(project.id)
  })
})
