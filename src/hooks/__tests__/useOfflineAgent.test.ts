/**
 * Unit Tests for useOfflineAgent Hook
 * v2.5.0 Phase 2.1 - IndexedDB Integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOfflineAgent } from '../useOfflineAgent';
import { offlineStore } from '../../services/offline/offlineStore';

// Mock IndexedDB
import 'fake-indexeddb/auto';

describe('useOfflineAgent', () => {
  beforeEach(async () => {
    await offlineStore.init();
  });

  afterEach(async () => {
    await offlineStore.clearAll();
    await offlineStore.close();
  });

  it('should initialize with empty agents list', async () => {
    const { result } = renderHook(() => useOfflineAgent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.agents).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should load existing agents on mount', async () => {
    // Pre-populate store
    await offlineStore.saveAgent({ name: 'Test Agent 1' });
    await offlineStore.saveAgent({ name: 'Test Agent 2' });

    const { result } = renderHook(() => useOfflineAgent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.agents).toHaveLength(2);
    expect(result.current.agents[0].name).toBe('Test Agent 1');
  });

  it('should save a new agent', async () => {
    const { result } = renderHook(() => useOfflineAgent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.saveAgent({
      name: 'New Agent',
      level: 1,
      experience: 0,
    });

    await waitFor(() => {
      expect(result.current.agents).toHaveLength(1);
    });

    expect(result.current.agents[0].name).toBe('New Agent');
  });

  it('should update an agent', async () => {
    const { result } = renderHook(() => useOfflineAgent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.saveAgent({ name: 'Agent', level: 1 });

    await waitFor(() => {
      expect(result.current.agents).toHaveLength(1);
    });

    const agentId = result.current.agents[0].id;

    await result.current.updateAgent(agentId, { level: 10 });

    await waitFor(() => {
      expect(result.current.agents[0].level).toBe(10);
    });
  });

  it('should delete an agent', async () => {
    const { result } = renderHook(() => useOfflineAgent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.saveAgent({ name: 'Agent to Delete' });

    await waitFor(() => {
      expect(result.current.agents).toHaveLength(1);
    });

    const agentId = result.current.agents[0].id;

    await result.current.deleteAgent(agentId);

    await waitFor(() => {
      expect(result.current.agents).toHaveLength(0);
    });
  });

  it('should get unsynced agents', async () => {
    await offlineStore.saveAgent({ name: 'Agent 1' });
    await offlineStore.saveAgent({ name: 'Agent 2' });

    const agents = await offlineStore.getAllAgents();
    await offlineStore.markAsSynced('agents', agents[0].id);

    const { result } = renderHook(() => useOfflineAgent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const unsyncedAgents = await result.current.getUnsyncedAgents();
    expect(unsyncedAgents).toHaveLength(1);
    expect(unsyncedAgents[0].name).toBe('Agent 2');
  });

  it('should mark agent as synced', async () => {
    const { result } = renderHook(() => useOfflineAgent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.saveAgent({ name: 'Agent' });

    await waitFor(() => {
      expect(result.current.agents).toHaveLength(1);
    });

    const agentId = result.current.agents[0].id;

    await result.current.markAsSynced(agentId);

    await waitFor(() => {
      expect(result.current.agents[0]._synced).toBe(true);
    });
  });

  it('should refresh agents list', async () => {
    const { result } = renderHook(() => useOfflineAgent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Add agent directly to store (bypassing hook)
    await offlineStore.saveAgent({ name: 'External Agent' });

    // Refresh
    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.agents).toHaveLength(1);
    });

    expect(result.current.agents[0].name).toBe('External Agent');
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useOfflineAgent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Try to update non-existent agent
    await expect(
      result.current.updateAgent('non-existent-id', { level: 10 })
    ).rejects.toThrow();
  });

  it('should get single agent by ID', async () => {
    await offlineStore.saveAgent({ name: 'Test Agent' });
    const agents = await offlineStore.getAllAgents();
    const agentId = agents[0].id;

    const { result } = renderHook(() => useOfflineAgent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const agent = await result.current.getAgent(agentId);
    expect(agent).toBeDefined();
    expect(agent?.name).toBe('Test Agent');
  });

  it('should return all agents', async () => {
    await offlineStore.saveAgent({ name: 'Agent 1' });
    await offlineStore.saveAgent({ name: 'Agent 2' });
    await offlineStore.saveAgent({ name: 'Agent 3' });

    const { result } = renderHook(() => useOfflineAgent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const allAgents = await result.current.getAllAgents();
    expect(allAgents).toHaveLength(3);
  });
});
