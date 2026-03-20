/**
 * Unit Tests for OfflineStore
 * v2.5.0 Phase 2.1 - IndexedDB Integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OfflineStore, OfflineAgent, OfflineTask } from '../offlineStore';

// Mock IndexedDB
import 'fake-indexeddb/auto';

describe('OfflineStore', () => {
  let store: OfflineStore;

  beforeEach(async () => {
    store = new OfflineStore();
    await store.init();
  });

  afterEach(async () => {
    await store.clearAll();
    await store.close();
  });

  describe('Database Initialization', () => {
    it('should initialize database successfully', async () => {
      const stats = await store.getStats();
      expect(stats).toBeDefined();
      expect(stats.agents).toBe(0);
      expect(stats.tasks).toBe(0);
    });

    it('should not re-initialize if already initialized', async () => {
      await store.init();
      await store.init(); // Should not throw
      const stats = await store.getStats();
      expect(stats).toBeDefined();
    });
  });

  describe('Agent Operations', () => {
    const mockAgent: Partial<OfflineAgent> = {
      name: 'Test Agent',
      description: 'A test agent',
      status: 'active',
      level: 5,
      experience: 1000,
    };

    it('should save a new agent', async () => {
      await store.saveAgent(mockAgent);
      const stats = await store.getStats();
      expect(stats.agents).toBe(1);
      expect(stats.unsyncedAgents).toBe(1);
    });

    it('should retrieve a saved agent', async () => {
      await store.saveAgent(mockAgent);
      const agents = await store.getAllAgents();
      expect(agents).toHaveLength(1);
      expect(agents[0].name).toBe('Test Agent');
      expect(agents[0]._offline).toBe(true);
      expect(agents[0]._synced).toBe(false);
    });

    it('should get agent by ID', async () => {
      await store.saveAgent(mockAgent);
      const agents = await store.getAllAgents();
      const agentId = agents[0].id;

      const agent = await store.getAgent(agentId);
      expect(agent).toBeDefined();
      expect(agent?.name).toBe('Test Agent');
    });

    it('should update an agent', async () => {
      await store.saveAgent(mockAgent);
      const agents = await store.getAllAgents();
      const agentId = agents[0].id;
      const initialVersion = agents[0]._version;

      await store.updateAgent(agentId, { level: 10, experience: 2000 });

      const updatedAgent = await store.getAgent(agentId);
      expect(updatedAgent?.level).toBe(10);
      expect(updatedAgent?.experience).toBe(2000);
      expect(updatedAgent?._version).toBe(initialVersion + 1);
      expect(updatedAgent?._synced).toBe(false);
    });

    it('should delete an agent', async () => {
      await store.saveAgent(mockAgent);
      const agents = await store.getAllAgents();
      const agentId = agents[0].id;

      await store.deleteAgent(agentId);

      const stats = await store.getStats();
      expect(stats.agents).toBe(0);
    });

    it('should throw error when updating non-existent agent', async () => {
      await expect(
        store.updateAgent('non-existent-id', { level: 10 })
      ).rejects.toThrow('Agent non-existent-id not found');
    });

    it('should get unsynced agents', async () => {
      await store.saveAgent(mockAgent);
      await store.saveAgent({ ...mockAgent, name: 'Agent 2' });

      const unsyncedAgents = await store.getUnsyncedAgents();
      expect(unsyncedAgents).toHaveLength(2);
    });

    it('should mark agent as synced', async () => {
      await store.saveAgent(mockAgent);
      const agents = await store.getAllAgents();
      const agentId = agents[0].id;

      await store.markAsSynced('agents', agentId);

      const agent = await store.getAgent(agentId);
      expect(agent?._synced).toBe(true);

      const stats = await store.getStats();
      expect(stats.unsyncedAgents).toBe(0);
    });
  });

  describe('Task Operations', () => {
    const mockTask: Partial<OfflineTask> = {
      agentId: 'agent-123',
      title: 'Test Task',
      description: 'A test task',
      status: 'pending',
      priority: 'high',
    };

    it('should save a new task', async () => {
      await store.saveTask(mockTask);
      const stats = await store.getStats();
      expect(stats.tasks).toBe(1);
      expect(stats.unsyncedTasks).toBe(1);
    });

    it('should retrieve a saved task', async () => {
      await store.saveTask(mockTask);
      const tasks = await store.getAllTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Test Task');
      expect(tasks[0]._offline).toBe(true);
      expect(tasks[0]._synced).toBe(false);
    });

    it('should get task by ID', async () => {
      await store.saveTask(mockTask);
      const tasks = await store.getAllTasks();
      const taskId = tasks[0].id;

      const task = await store.getTask(taskId);
      expect(task).toBeDefined();
      expect(task?.title).toBe('Test Task');
    });

    it('should get tasks by agent', async () => {
      await store.saveTask(mockTask);
      await store.saveTask({ ...mockTask, agentId: 'agent-456', title: 'Task 2' });
      await store.saveTask({ ...mockTask, agentId: 'agent-123', title: 'Task 3' });

      const agentTasks = await store.getTasksByAgent('agent-123');
      expect(agentTasks).toHaveLength(2);
      expect(agentTasks.every((t) => t.agentId === 'agent-123')).toBe(true);
    });

    it('should update a task', async () => {
      await store.saveTask(mockTask);
      const tasks = await store.getAllTasks();
      const taskId = tasks[0].id;

      await store.updateTask(taskId, { status: 'completed', priority: 'low' });

      const updatedTask = await store.getTask(taskId);
      expect(updatedTask?.status).toBe('completed');
      expect(updatedTask?.priority).toBe('low');
      expect(updatedTask?._synced).toBe(false);
    });

    it('should delete a task', async () => {
      await store.saveTask(mockTask);
      const tasks = await store.getAllTasks();
      const taskId = tasks[0].id;

      await store.deleteTask(taskId);

      const stats = await store.getStats();
      expect(stats.tasks).toBe(0);
    });

    it('should throw error when updating non-existent task', async () => {
      await expect(
        store.updateTask('non-existent-id', { status: 'completed' })
      ).rejects.toThrow('Task non-existent-id not found');
    });

    it('should get unsynced tasks', async () => {
      await store.saveTask(mockTask);
      await store.saveTask({ ...mockTask, title: 'Task 2' });

      const unsyncedTasks = await store.getUnsyncedTasks();
      expect(unsyncedTasks).toHaveLength(2);
    });

    it('should mark task as synced', async () => {
      await store.saveTask(mockTask);
      const tasks = await store.getAllTasks();
      const taskId = tasks[0].id;

      await store.markAsSynced('tasks', taskId);

      const task = await store.getTask(taskId);
      expect(task?._synced).toBe(true);

      const stats = await store.getStats();
      expect(stats.unsyncedTasks).toBe(0);
    });
  });

  describe('Sync Queue Operations', () => {
    it('should add items to sync queue when creating agents', async () => {
      await store.saveAgent({ name: 'Test Agent' });
      const queue = await store.getSyncQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].type).toBe('create');
      expect(queue[0].collection).toBe('agents');
    });

    it('should add items to sync queue when updating agents', async () => {
      await store.saveAgent({ name: 'Test Agent' });
      const agents = await store.getAllAgents();
      await store.updateAgent(agents[0].id, { level: 10 });

      const queue = await store.getSyncQueue();
      expect(queue).toHaveLength(2); // create + update
      expect(queue[1].type).toBe('update');
    });

    it('should add items to sync queue when deleting agents', async () => {
      await store.saveAgent({ name: 'Test Agent' });
      const agents = await store.getAllAgents();
      await store.deleteAgent(agents[0].id);

      const queue = await store.getSyncQueue();
      expect(queue).toHaveLength(2); // create + delete
      expect(queue[1].type).toBe('delete');
    });

    it('should clear sync queue item', async () => {
      await store.saveAgent({ name: 'Test Agent' });
      const queue = await store.getSyncQueue();
      const itemId = queue[0].id;

      await store.clearSyncQueueItem(itemId);

      const newQueue = await store.getSyncQueue();
      expect(newQueue).toHaveLength(0);
    });

    it('should clear entire sync queue', async () => {
      await store.saveAgent({ name: 'Agent 1' });
      await store.saveAgent({ name: 'Agent 2' });
      await store.saveTask({ title: 'Task 1', agentId: 'agent-1' });

      await store.clearSyncQueue();

      const queue = await store.getSyncQueue();
      expect(queue).toHaveLength(0);
    });

    it('should reflect sync queue in stats', async () => {
      await store.saveAgent({ name: 'Agent 1' });
      await store.saveTask({ title: 'Task 1', agentId: 'agent-1' });

      const stats = await store.getStats();
      expect(stats.syncQueueSize).toBe(2);
    });
  });

  describe('Metadata Operations', () => {
    it('should set and get metadata', async () => {
      await store.setMetadata('testKey', { foo: 'bar' });
      const value = await store.getMetadata('testKey');
      expect(value).toEqual({ foo: 'bar' });
    });

    it('should return undefined for non-existent metadata', async () => {
      const value = await store.getMetadata('non-existent');
      expect(value).toBeUndefined();
    });

    it('should overwrite existing metadata', async () => {
      await store.setMetadata('testKey', 'value1');
      await store.setMetadata('testKey', 'value2');
      const value = await store.getMetadata('testKey');
      expect(value).toBe('value2');
    });
  });

  describe('Statistics', () => {
    it('should return accurate statistics', async () => {
      await store.saveAgent({ name: 'Agent 1' });
      await store.saveAgent({ name: 'Agent 2' });
      await store.saveTask({ title: 'Task 1', agentId: 'agent-1' });
      await store.saveTask({ title: 'Task 2', agentId: 'agent-2' });

      const agents = await store.getAllAgents();
      await store.markAsSynced('agents', agents[0].id);

      const tasks = await store.getAllTasks();
      await store.markAsSynced('tasks', tasks[0].id);

      const stats = await store.getStats();
      expect(stats.agents).toBe(2);
      expect(stats.tasks).toBe(2);
      expect(stats.unsyncedAgents).toBe(1);
      expect(stats.unsyncedTasks).toBe(1);
      expect(stats.syncQueueSize).toBe(4); // 2 creates + 2 updates (from markAsSynced)
    });
  });

  describe('Clear Operations', () => {
    it('should clear all data', async () => {
      await store.saveAgent({ name: 'Agent 1' });
      await store.saveTask({ title: 'Task 1', agentId: 'agent-1' });

      await store.clearAll();

      const stats = await store.getStats();
      expect(stats.agents).toBe(0);
      expect(stats.tasks).toBe(0);
      expect(stats.syncQueueSize).toBe(0);
    });
  });

  describe('ID Generation', () => {
    it('should generate unique IDs', async () => {
      await store.saveAgent({ name: 'Agent 1' });
      await store.saveAgent({ name: 'Agent 2' });

      const agents = await store.getAllAgents();
      expect(agents[0].id).not.toBe(agents[1].id);
      expect(agents[0].id).toMatch(/^offline_\d+_[a-z0-9]+$/);
    });
  });
});
