/**
 * Unit Tests for ConflictResolver
 * v2.5.0 Phase 2.2 - Conflict Resolution
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConflictResolver } from '../conflictResolver';
import { offlineStore, OfflineAgent } from '../offlineStore';

// Mock IndexedDB
import 'fake-indexeddb/auto';

describe('ConflictResolver', () => {
  let resolver: ConflictResolver;

  beforeEach(async () => {
    resolver = new ConflictResolver();
    await offlineStore.init();
  });

  afterEach(async () => {
    await offlineStore.clearAll();
    await offlineStore.close();
  });

  describe('detectConflict', () => {
    it('should detect conflict when versions differ', () => {
      const local = { _version: 1, _timestamp: Date.now() };
      const remote = { _version: 2, _timestamp: Date.now() };

      const hasConflict = resolver.detectConflict(local, remote);
      expect(hasConflict).toBe(true);
    });

    it('should not detect conflict when versions match', () => {
      const timestamp = Date.now();
      const local = { _version: 1, _timestamp: timestamp };
      const remote = { _version: 1, _timestamp: timestamp };

      const hasConflict = resolver.detectConflict(local, remote);
      expect(hasConflict).toBe(false);
    });

    it('should detect potential conflict with large timestamp difference', () => {
      const local = { _version: 1, _timestamp: Date.now() };
      const remote = { _version: 1, _timestamp: Date.now() - 120000 };  // 2 minutes ago

      const hasConflict = resolver.detectConflict(local, remote);
      expect(hasConflict).toBe(true);
    });
  });

  describe('createConflict', () => {
    it('should create a conflict record', async () => {
      const local: OfflineAgent = {
        id: 'agent-1',
        name: 'Local Agent',
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
        name: 'Remote Agent',
        level: 6,
        _version: 2,
      };

      const conflict = await resolver.createConflict('agent', local, remote);

      expect(conflict.id).toBeDefined();
      expect(conflict.type).toBe('agent');
      expect(conflict.localVersion).toEqual(local);
      expect(conflict.remoteVersion).toEqual(remote);
      expect(conflict.resolved).toBe(false);
    });

    it('should save conflict to metadata', async () => {
      const local: OfflineAgent = {
        id: 'agent-1',
        name: 'Agent',
        status: 'active',
        level: 1,
        experience: 0,
        _offline: true,
        _synced: false,
        _timestamp: Date.now(),
        _version: 1,
      };

      const remote: OfflineAgent = { ...local, level: 2, _version: 2 };

      await resolver.createConflict('agent', local, remote);

      const conflicts = await resolver.getUnresolvedConflicts();
      expect(conflicts).toHaveLength(1);
    });
  });

  describe('autoResolve', () => {
    it('should auto-resolve when no field conflicts exist', async () => {
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

      const remote: OfflineAgent = { ...local, _version: 2 };

      const conflict = await resolver.createConflict('agent', local, remote);
      const result = await resolver.autoResolve(conflict);

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('merge_auto');
      expect(result.mergedData).toBeDefined();
    });

    it('should auto-resolve numeric conflicts by taking max value', async () => {
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
        experience: 200,
        _version: 2,
      };

      const conflict = await resolver.createConflict('agent', local, remote);
      const result = await resolver.autoResolve(conflict);

      expect(result.success).toBe(true);
      expect(result.mergedData?.level).toBe(10);
      expect(result.mergedData?.experience).toBe(200);
    });

    it('should auto-resolve array conflicts by merging', async () => {
      const local: any = {
        id: 'agent-1',
        name: 'Agent',
        skills: ['skill1', 'skill2'],
        _offline: true,
        _synced: false,
        _timestamp: Date.now(),
        _version: 1,
      };

      const remote: any = {
        ...local,
        skills: ['skill2', 'skill3'],
        _version: 2,
      };

      const conflict = await resolver.createConflict('agent', local, remote);
      const result = await resolver.autoResolve(conflict);

      expect(result.success).toBe(true);
      expect(result.mergedData?.skills).toEqual(
        expect.arrayContaining(['skill1', 'skill2', 'skill3'])
      );
    });

    it('should fail auto-resolve for string conflicts', async () => {
      const local: OfflineAgent = {
        id: 'agent-1',
        name: 'Local Name',
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
        name: 'Remote Name',
        _version: 2,
      };

      const conflict = await resolver.createConflict('agent', local, remote);
      const result = await resolver.autoResolve(conflict);

      expect(result.success).toBe(false);
      expect(result.strategy).toBe('merge_manual');
      expect(result.conflicts).toContain('name');
    });

    it('should auto-resolve status conflicts by priority', async () => {
      const local: any = {
        id: 'task-1',
        status: 'pending',
        _offline: true,
        _synced: false,
        _timestamp: Date.now(),
        _version: 1,
      };

      const remote: any = {
        ...local,
        status: 'completed',
        _version: 2,
      };

      const conflict = await resolver.createConflict('task', local, remote);
      const result = await resolver.autoResolve(conflict);

      expect(result.success).toBe(true);
      expect(result.mergedData?.status).toBe('completed');
    });
  });

  describe('threeWayMerge', () => {
    it('should merge when only local changed', async () => {
      const base: OfflineAgent = {
        id: 'agent-1',
        name: 'Agent',
        status: 'active',
        level: 5,
        experience: 100,
        _offline: true,
        _synced: true,
        _timestamp: Date.now() - 1000,
        _version: 1,
      };

      const local: OfflineAgent = {
        ...base,
        level: 10,
        _timestamp: Date.now(),
        _version: 2,
      };

      const remote: OfflineAgent = { ...base };

      const conflict = await resolver.createConflict('agent', local, remote, base);
      const result = await resolver.autoResolve(conflict);

      expect(result.success).toBe(true);
      expect(result.mergedData?.level).toBe(10);
    });

    it('should merge when only remote changed', async () => {
      const base: OfflineAgent = {
        id: 'agent-1',
        name: 'Agent',
        status: 'active',
        level: 5,
        experience: 100,
        _offline: true,
        _synced: true,
        _timestamp: Date.now() - 1000,
        _version: 1,
      };

      const local: OfflineAgent = { ...base };

      const remote: OfflineAgent = {
        ...base,
        level: 10,
        _timestamp: Date.now(),
        _version: 2,
      };

      const conflict = await resolver.createConflict('agent', local, remote, base);
      const result = await resolver.autoResolve(conflict);

      expect(result.success).toBe(true);
      expect(result.mergedData?.level).toBe(10);
    });

    it('should detect conflict when both changed different values', async () => {
      const base: OfflineAgent = {
        id: 'agent-1',
        name: 'Agent',
        status: 'active',
        level: 5,
        experience: 100,
        _offline: true,
        _synced: true,
        _timestamp: Date.now() - 1000,
        _version: 1,
      };

      const local: OfflineAgent = {
        ...base,
        name: 'Local Name',
        _version: 2,
      };

      const remote: OfflineAgent = {
        ...base,
        name: 'Remote Name',
        _version: 2,
      };

      const conflict = await resolver.createConflict('agent', local, remote, base);
      const result = await resolver.autoResolve(conflict);

      expect(result.conflicts).toContain('name');
    });

    it('should not conflict when both changed to same value', async () => {
      const base: OfflineAgent = {
        id: 'agent-1',
        name: 'Agent',
        status: 'active',
        level: 5,
        experience: 100,
        _offline: true,
        _synced: true,
        _timestamp: Date.now() - 1000,
        _version: 1,
      };

      const local: OfflineAgent = {
        ...base,
        level: 10,
        _version: 2,
      };

      const remote: OfflineAgent = {
        ...base,
        level: 10,
        _version: 2,
      };

      const conflict = await resolver.createConflict('agent', local, remote, base);
      const result = await resolver.autoResolve(conflict);

      expect(result.success).toBe(true);
      expect(result.mergedData?.level).toBe(10);
    });
  });

  describe('manualResolve', () => {
    it('should resolve with keep_local strategy', async () => {
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

      const remote: OfflineAgent = {
        ...local,
        name: 'Remote',
        _version: 2,
      };

      const conflict = await resolver.createConflict('agent', local, remote);
      const result = await resolver.manualResolve(conflict.id, 'keep_local');

      expect(result.success).toBe(true);
      expect(result.mergedData?.name).toBe('Local');
      expect(conflict.resolved).toBe(true);
    });

    it('should resolve with keep_remote strategy', async () => {
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

      const remote: OfflineAgent = {
        ...local,
        name: 'Remote',
        _version: 2,
      };

      const conflict = await resolver.createConflict('agent', local, remote);
      const result = await resolver.manualResolve(conflict.id, 'keep_remote');

      expect(result.success).toBe(true);
      expect(result.mergedData?.name).toBe('Remote');
    });

    it('should resolve with merge_manual strategy', async () => {
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

      const remote: OfflineAgent = {
        ...local,
        name: 'Remote',
        _version: 2,
      };

      const merged: OfflineAgent = {
        ...local,
        name: 'Manually Merged',
      };

      const conflict = await resolver.createConflict('agent', local, remote);
      const result = await resolver.manualResolve(
        conflict.id,
        'merge_manual',
        merged
      );

      expect(result.success).toBe(true);
      expect(result.mergedData?.name).toBe('Manually Merged');
    });

    it('should fail when conflict not found', async () => {
      const result = await resolver.manualResolve('non-existent', 'keep_local');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should fail when merge_manual without data', async () => {
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

      const conflict = await resolver.createConflict('agent', local, remote);
      const result = await resolver.manualResolve(conflict.id, 'merge_manual');

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('resolveAll', () => {
    it('should resolve all conflicts', async () => {
      // Create multiple conflicts
      const agents = [
        { id: '1', name: 'Agent 1', level: 5 },
        { id: '2', name: 'Agent 2', level: 10 },
        { id: '3', name: 'Agent 3', level: 15 },
      ];

      for (const agent of agents) {
        const local: OfflineAgent = {
          ...agent,
          status: 'active',
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

        await resolver.createConflict('agent', local, remote);
      }

      const result = await resolver.resolveAll('merge_auto');

      expect(result.resolved).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.conflicts).toHaveLength(0);
    });
  });

  describe('clearResolvedConflicts', () => {
    it('should clear old resolved conflicts', async () => {
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

      const conflict = await resolver.createConflict('agent', local, remote);
      await resolver.manualResolve(conflict.id, 'keep_local');

      // Clear conflicts older than now (should clear all)
      const cleared = await resolver.clearResolvedConflicts(Date.now() + 1000);

      expect(cleared).toBe(1);

      const remaining = await resolver.getAllConflicts();
      expect(remaining).toHaveLength(0);
    });

    it('should not clear recent resolved conflicts', async () => {
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

      const conflict = await resolver.createConflict('agent', local, remote);
      await resolver.manualResolve(conflict.id, 'keep_local');

      // Try to clear conflicts older than 1 hour ago
      const cleared = await resolver.clearResolvedConflicts(
        Date.now() - 60 * 60 * 1000
      );

      expect(cleared).toBe(0);

      const remaining = await resolver.getAllConflicts();
      expect(remaining).toHaveLength(1);
    });
  });

  describe('getConflictStats', () => {
    it('should return correct statistics', async () => {
      // Create 2 agent conflicts and 1 task conflict
      const agent1: OfflineAgent = {
        id: 'agent-1',
        name: 'Agent 1',
        status: 'active',
        level: 5,
        experience: 100,
        _offline: true,
        _synced: false,
        _timestamp: Date.now(),
        _version: 1,
      };

      const agent2: OfflineAgent = { ...agent1, id: 'agent-2' };
      const task1: any = { id: 'task-1', title: 'Task 1', _version: 1, _timestamp: Date.now() };

      await resolver.createConflict('agent', agent1, { ...agent1, level: 10, _version: 2 });
      await resolver.createConflict('agent', agent2, { ...agent2, level: 15, _version: 2 });
      await resolver.createConflict('task', task1, { ...task1, title: 'Task 1 Remote', _version: 2 });

      // Resolve one
      const conflicts = await resolver.getUnresolvedConflicts();
      await resolver.manualResolve(conflicts[0].id, 'keep_local');

      const stats = await resolver.getConflictStats();

      expect(stats.total).toBe(3);
      expect(stats.unresolved).toBe(2);
      expect(stats.resolved).toBe(1);
      expect(stats.byType.agent).toBe(2);
      expect(stats.byType.task).toBe(1);
      expect(stats.byStrategy.keep_local).toBe(1);
    });
  });
});
