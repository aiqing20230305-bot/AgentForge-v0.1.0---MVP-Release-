/**
 * Unit Tests for useConflictResolution Hook
 * v2.5.0 Phase 2.2 - Conflict Resolution
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useConflictResolution } from '../useConflictResolution';
import { conflictResolver } from '../../services/offline/conflictResolver';
import { offlineStore, OfflineAgent } from '../../services/offline/offlineStore';

// Mock IndexedDB
import 'fake-indexeddb/auto';

describe('useConflictResolution', () => {
  beforeEach(async () => {
    await offlineStore.init();
  });

  afterEach(async () => {
    await offlineStore.clearAll();
    await offlineStore.close();
  });

  it('should initialize with empty conflicts', async () => {
    const { result } = renderHook(() => useConflictResolution());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conflicts).toEqual([]);
    expect(result.current.unresolvedConflicts).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should load existing conflicts', async () => {
    // Create a conflict before hook initialization
    const local: OfflineAgent = {
      id: 'agent-1',
      name: 'Local',
      status: 'active',
      level: 5,
      experience: 100,
      _offline: true,
      _synced: false,
      _timestamp: Date.now(),
      _version: 1,
    };

    const remote: OfflineAgent = { ...local, name: 'Remote', _version: 2 };

    await conflictResolver.createConflict('agent', local, remote);

    const { result } = renderHook(() => useConflictResolution());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conflicts).toHaveLength(1);
    expect(result.current.unresolvedConflicts).toHaveLength(1);
  });

  it('should auto-resolve a conflict', async () => {
    const local: OfflineAgent = {
      id: 'agent-1',
      name: 'Agent',
      status: 'active',
      level: 5,
      experience: 100,
      _offline: true,
      _synced: false,
      _timestamp: Date.now(),
      _version: 1,
    };

    const remote: OfflineAgent = {
      ...local,
      level: 10,
      _version: 2,
    };

    const conflict = await conflictResolver.createConflict('agent', local, remote);

    const { result } = renderHook(() => useConflictResolution());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const resolveResult = await result.current.autoResolve(conflict.id);

    expect(resolveResult.success).toBe(true);

    await waitFor(() => {
      expect(result.current.unresolvedConflicts).toHaveLength(0);
    });
  });

  it('should manually resolve a conflict', async () => {
    const local: OfflineAgent = {
      id: 'agent-1',
      name: 'Local',
      status: 'active',
      level: 5,
      experience: 100,
      _offline: true,
      _synced: false,
      _timestamp: Date.now(),
      _version: 1,
    };

    const remote: OfflineAgent = { ...local, name: 'Remote', _version: 2 };

    const conflict = await conflictResolver.createConflict('agent', local, remote);

    const { result } = renderHook(() => useConflictResolution());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const resolveResult = await result.current.manualResolve(
      conflict.id,
      'keep_local'
    );

    expect(resolveResult.success).toBe(true);
    expect(resolveResult.mergedData?.name).toBe('Local');

    await waitFor(() => {
      expect(result.current.unresolvedConflicts).toHaveLength(0);
    });
  });

  it('should resolve all conflicts', async () => {
    // Create multiple conflicts
    for (let i = 1; i <= 3; i++) {
      const local: OfflineAgent = {
        id: `agent-${i}`,
        name: `Agent ${i}`,
        status: 'active',
        level: i * 5,
        experience: 100,
        _offline: true,
        _synced: false,
        _timestamp: Date.now(),
        _version: 1,
      };

      const remote: OfflineAgent = {
        ...local,
        level: local.level + 5,
        _version: 2,
      };

      await conflictResolver.createConflict('agent', local, remote);
    }

    const { result } = renderHook(() => useConflictResolution());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.unresolvedConflicts).toHaveLength(3);

    const resolveResult = await result.current.resolveAll('merge_auto');

    expect(resolveResult.resolved).toBe(3);
    expect(resolveResult.failed).toBe(0);

    await waitFor(() => {
      expect(result.current.unresolvedConflicts).toHaveLength(0);
    });
  });

  it('should clear resolved conflicts', async () => {
    const local: OfflineAgent = {
      id: 'agent-1',
      name: 'Agent',
      status: 'active',
      level: 5,
      experience: 100,
      _offline: true,
      _synced: false,
      _timestamp: Date.now(),
      _version: 1,
    };

    const remote: OfflineAgent = { ...local, level: 10, _version: 2 };

    const conflict = await conflictResolver.createConflict('agent', local, remote);
    await conflictResolver.manualResolve(conflict.id, 'keep_local');

    const { result } = renderHook(() => useConflictResolution());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conflicts).toHaveLength(1);

    const cleared = await result.current.clearResolved();

    expect(cleared).toBe(1);

    await waitFor(() => {
      expect(result.current.conflicts).toHaveLength(0);
    });
  });

  it('should update stats correctly', async () => {
    // Create and resolve one conflict
    const local: OfflineAgent = {
      id: 'agent-1',
      name: 'Agent',
      status: 'active',
      level: 5,
      experience: 100,
      _offline: true,
      _synced: false,
      _timestamp: Date.now(),
      _version: 1,
    };

    const remote: OfflineAgent = { ...local, level: 10, _version: 2 };

    const conflict = await conflictResolver.createConflict('agent', local, remote);

    const { result } = renderHook(() => useConflictResolution());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats?.total).toBe(1);
    expect(result.current.stats?.unresolved).toBe(1);
    expect(result.current.stats?.resolved).toBe(0);

    await result.current.manualResolve(conflict.id, 'keep_local');

    await waitFor(() => {
      expect(result.current.stats?.total).toBe(1);
      expect(result.current.stats?.unresolved).toBe(0);
      expect(result.current.stats?.resolved).toBe(1);
    });
  });

  it('should refresh conflicts list', async () => {
    const { result } = renderHook(() => useConflictResolution());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conflicts).toHaveLength(0);

    // Create conflict after hook initialization
    const local: OfflineAgent = {
      id: 'agent-1',
      name: 'Agent',
      status: 'active',
      level: 5,
      experience: 100,
      _offline: true,
      _synced: false,
      _timestamp: Date.now(),
      _version: 1,
    };

    const remote: OfflineAgent = { ...local, level: 10, _version: 2 };

    await conflictResolver.createConflict('agent', local, remote);

    // Refresh
    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.conflicts).toHaveLength(1);
    });
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useConflictResolution());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Try to resolve non-existent conflict
    await expect(
      result.current.autoResolve('non-existent-id')
    ).rejects.toThrow();
  });
});
