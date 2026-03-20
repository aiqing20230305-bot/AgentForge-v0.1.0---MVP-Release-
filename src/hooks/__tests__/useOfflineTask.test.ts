/**
 * Unit Tests for useOfflineTask Hook
 * v2.5.0 Phase 2.1 - IndexedDB Integration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOfflineTask } from '../useOfflineTask';
import { offlineStore } from '../../services/offline/offlineStore';

// Mock IndexedDB
import 'fake-indexeddb/auto';

describe('useOfflineTask', () => {
  beforeEach(async () => {
    await offlineStore.init();
  });

  afterEach(async () => {
    await offlineStore.clearAll();
    await offlineStore.close();
  });

  it('should initialize with empty tasks list', async () => {
    const { result } = renderHook(() => useOfflineTask());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tasks).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should load existing tasks on mount', async () => {
    // Pre-populate store
    await offlineStore.saveTask({ title: 'Task 1', agentId: 'agent-1' });
    await offlineStore.saveTask({ title: 'Task 2', agentId: 'agent-2' });

    const { result } = renderHook(() => useOfflineTask());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tasks).toHaveLength(2);
  });

  it('should filter tasks by agentId', async () => {
    await offlineStore.saveTask({ title: 'Task 1', agentId: 'agent-1' });
    await offlineStore.saveTask({ title: 'Task 2', agentId: 'agent-2' });
    await offlineStore.saveTask({ title: 'Task 3', agentId: 'agent-1' });

    const { result } = renderHook(() => useOfflineTask('agent-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tasks).toHaveLength(2);
    expect(result.current.tasks.every((t) => t.agentId === 'agent-1')).toBe(true);
  });

  it('should save a new task', async () => {
    const { result } = renderHook(() => useOfflineTask());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.saveTask({
      title: 'New Task',
      agentId: 'agent-1',
      status: 'pending',
      priority: 'medium',
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    expect(result.current.tasks[0].title).toBe('New Task');
  });

  it('should update a task', async () => {
    const { result } = renderHook(() => useOfflineTask());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.saveTask({
      title: 'Task',
      agentId: 'agent-1',
      status: 'pending',
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    const taskId = result.current.tasks[0].id;

    await result.current.updateTask(taskId, { status: 'completed' });

    await waitFor(() => {
      expect(result.current.tasks[0].status).toBe('completed');
    });
  });

  it('should delete a task', async () => {
    const { result } = renderHook(() => useOfflineTask());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.saveTask({
      title: 'Task to Delete',
      agentId: 'agent-1',
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    const taskId = result.current.tasks[0].id;

    await result.current.deleteTask(taskId);

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(0);
    });
  });

  it('should get unsynced tasks', async () => {
    await offlineStore.saveTask({ title: 'Task 1', agentId: 'agent-1' });
    await offlineStore.saveTask({ title: 'Task 2', agentId: 'agent-2' });

    const tasks = await offlineStore.getAllTasks();
    await offlineStore.markAsSynced('tasks', tasks[0].id);

    const { result } = renderHook(() => useOfflineTask());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const unsyncedTasks = await result.current.getUnsyncedTasks();
    expect(unsyncedTasks).toHaveLength(1);
    expect(unsyncedTasks[0].title).toBe('Task 2');
  });

  it('should mark task as synced', async () => {
    const { result } = renderHook(() => useOfflineTask());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.saveTask({
      title: 'Task',
      agentId: 'agent-1',
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    const taskId = result.current.tasks[0].id;

    await result.current.markAsSynced(taskId);

    await waitFor(() => {
      expect(result.current.tasks[0]._synced).toBe(true);
    });
  });

  it('should get tasks by agent ID', async () => {
    await offlineStore.saveTask({ title: 'Task 1', agentId: 'agent-1' });
    await offlineStore.saveTask({ title: 'Task 2', agentId: 'agent-2' });
    await offlineStore.saveTask({ title: 'Task 3', agentId: 'agent-1' });

    const { result } = renderHook(() => useOfflineTask());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const agentTasks = await result.current.getTasksByAgent('agent-1');
    expect(agentTasks).toHaveLength(2);
    expect(agentTasks.every((t) => t.agentId === 'agent-1')).toBe(true);
  });

  it('should refresh tasks list', async () => {
    const { result } = renderHook(() => useOfflineTask());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Add task directly to store (bypassing hook)
    await offlineStore.saveTask({
      title: 'External Task',
      agentId: 'agent-1',
    });

    // Refresh
    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    expect(result.current.tasks[0].title).toBe('External Task');
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useOfflineTask());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Try to update non-existent task
    await expect(
      result.current.updateTask('non-existent-id', { status: 'completed' })
    ).rejects.toThrow();
  });

  it('should get single task by ID', async () => {
    await offlineStore.saveTask({ title: 'Test Task', agentId: 'agent-1' });
    const tasks = await offlineStore.getAllTasks();
    const taskId = tasks[0].id;

    const { result } = renderHook(() => useOfflineTask());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const task = await result.current.getTask(taskId);
    expect(task).toBeDefined();
    expect(task?.title).toBe('Test Task');
  });

  it('should return all tasks', async () => {
    await offlineStore.saveTask({ title: 'Task 1', agentId: 'agent-1' });
    await offlineStore.saveTask({ title: 'Task 2', agentId: 'agent-2' });
    await offlineStore.saveTask({ title: 'Task 3', agentId: 'agent-3' });

    const { result } = renderHook(() => useOfflineTask());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const allTasks = await result.current.getAllTasks();
    expect(allTasks).toHaveLength(3);
  });

  it('should reload when agentId prop changes', async () => {
    await offlineStore.saveTask({ title: 'Task 1', agentId: 'agent-1' });
    await offlineStore.saveTask({ title: 'Task 2', agentId: 'agent-2' });

    const { result, rerender } = renderHook(
      ({ agentId }) => useOfflineTask(agentId),
      { initialProps: { agentId: 'agent-1' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].agentId).toBe('agent-1');

    // Change agentId
    rerender({ agentId: 'agent-2' });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    expect(result.current.tasks[0].agentId).toBe('agent-2');
  });
});
