/**
 * Batch Selection Service
 * Handles selection state and operations for batch actions
 */

export type SelectionMode = 'none' | 'multiple' | 'all'

export interface SelectionState<T = any> {
  mode: SelectionMode
  selectedIds: Set<string>
  items: T[]
  excludedIds: Set<string>
}

export interface SelectionCondition {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in'
  value: any
}

class BatchSelectionService {
  /**
   * Create initial selection state
   */
  createSelectionState<T>(items: T[] = []): SelectionState<T> {
    return {
      mode: 'none',
      selectedIds: new Set(),
      items,
      excludedIds: new Set()
    }
  }

  /**
   * Toggle single item selection
   */
  toggleItem<T>(state: SelectionState<T>, itemId: string): SelectionState<T> {
    const newSelectedIds = new Set(state.selectedIds)
    const newExcludedIds = new Set(state.excludedIds)

    if (state.mode === 'all') {
      // In 'all' mode, toggle exclusion
      if (newExcludedIds.has(itemId)) {
        newExcludedIds.delete(itemId)
      } else {
        newExcludedIds.add(itemId)
      }
    } else {
      // In 'multiple' mode, toggle selection
      if (newSelectedIds.has(itemId)) {
        newSelectedIds.delete(itemId)
      } else {
        newSelectedIds.add(itemId)
      }
    }

    return {
      ...state,
      mode: newSelectedIds.size > 0 || newExcludedIds.size > 0 ?
        (state.mode === 'all' ? 'all' : 'multiple') : 'none',
      selectedIds: newSelectedIds,
      excludedIds: newExcludedIds
    }
  }

  /**
   * Select multiple items
   */
  selectMultiple<T>(state: SelectionState<T>, itemIds: string[]): SelectionState<T> {
    const newSelectedIds = new Set(state.selectedIds)
    itemIds.forEach(id => newSelectedIds.add(id))

    return {
      ...state,
      mode: newSelectedIds.size > 0 ? 'multiple' : 'none',
      selectedIds: newSelectedIds
    }
  }

  /**
   * Deselect multiple items
   */
  deselectMultiple<T>(state: SelectionState<T>, itemIds: string[]): SelectionState<T> {
    const newSelectedIds = new Set(state.selectedIds)
    itemIds.forEach(id => newSelectedIds.delete(id))

    return {
      ...state,
      mode: newSelectedIds.size > 0 ? 'multiple' : 'none',
      selectedIds: newSelectedIds
    }
  }

  /**
   * Select all items
   */
  selectAll<T extends { id: string }>(state: SelectionState<T>): SelectionState<T> {
    return {
      ...state,
      mode: 'all',
      selectedIds: new Set(state.items.map(item => item.id)),
      excludedIds: new Set()
    }
  }

  /**
   * Deselect all items
   */
  deselectAll<T>(state: SelectionState<T>): SelectionState<T> {
    return {
      ...state,
      mode: 'none',
      selectedIds: new Set(),
      excludedIds: new Set()
    }
  }

  /**
   * Invert selection
   */
  invertSelection<T extends { id: string }>(state: SelectionState<T>): SelectionState<T> {
    const allIds = new Set(state.items.map(item => item.id))
    const newSelectedIds = new Set<string>()

    allIds.forEach(id => {
      if (!state.selectedIds.has(id)) {
        newSelectedIds.add(id)
      }
    })

    return {
      ...state,
      mode: newSelectedIds.size > 0 ? 'multiple' : 'none',
      selectedIds: newSelectedIds,
      excludedIds: new Set()
    }
  }

  /**
   * Select by condition
   */
  selectByCondition<T extends { id: string }>(
    state: SelectionState<T>,
    conditions: SelectionCondition[]
  ): SelectionState<T> {
    const matchingIds = state.items
      .filter(item => this.matchesConditions(item, conditions))
      .map(item => item.id)

    return this.selectMultiple(state, matchingIds)
  }

  /**
   * Get selected items
   */
  getSelectedItems<T extends { id: string }>(state: SelectionState<T>): T[] {
    if (state.mode === 'all') {
      return state.items.filter(item => !state.excludedIds.has(item.id))
    }

    return state.items.filter(item => state.selectedIds.has(item.id))
  }

  /**
   * Get selected IDs
   */
  getSelectedIds<T extends { id: string }>(state: SelectionState<T>): string[] {
    return this.getSelectedItems(state).map(item => item.id)
  }

  /**
   * Get selection count
   */
  getSelectionCount<T extends { id: string }>(state: SelectionState<T>): number {
    if (state.mode === 'all') {
      return state.items.length - state.excludedIds.size
    }

    return state.selectedIds.size
  }

  /**
   * Check if item is selected
   */
  isItemSelected<T>(state: SelectionState<T>, itemId: string): boolean {
    if (state.mode === 'all') {
      return !state.excludedIds.has(itemId)
    }

    return state.selectedIds.has(itemId)
  }

  /**
   * Check if all items are selected
   */
  areAllSelected<T extends { id: string }>(state: SelectionState<T>): boolean {
    return state.mode === 'all' && state.excludedIds.size === 0
  }

  /**
   * Check if some items are selected
   */
  areSomeSelected<T>(state: SelectionState<T>): boolean {
    return state.mode !== 'none' && (state.selectedIds.size > 0 || state.excludedIds.size < state.items.length)
  }

  /**
   * Select range of items
   */
  selectRange<T extends { id: string }>(
    state: SelectionState<T>,
    fromIndex: number,
    toIndex: number
  ): SelectionState<T> {
    const start = Math.min(fromIndex, toIndex)
    const end = Math.max(fromIndex, toIndex)
    const rangeIds = state.items.slice(start, end + 1).map(item => item.id)

    return this.selectMultiple(state, rangeIds)
  }

  /**
   * Match item against conditions
   */
  private matchesConditions<T>(item: any, conditions: SelectionCondition[]): boolean {
    return conditions.every(condition => {
      const value = this.getNestedValue(item, condition.field)

      switch (condition.operator) {
        case 'eq':
          return value === condition.value
        case 'ne':
          return value !== condition.value
        case 'gt':
          return value > condition.value
        case 'lt':
          return value < condition.value
        case 'gte':
          return value >= condition.value
        case 'lte':
          return value <= condition.value
        case 'contains':
          return String(value).toLowerCase().includes(String(condition.value).toLowerCase())
        case 'startsWith':
          return String(value).toLowerCase().startsWith(String(condition.value).toLowerCase())
        case 'endsWith':
          return String(value).toLowerCase().endsWith(String(condition.value).toLowerCase())
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(value)
        default:
          return false
      }
    })
  }

  /**
   * Get nested object value by path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }
}

export const batchSelectionService = new BatchSelectionService()
