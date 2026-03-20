/**
 * Offline Agent List Component - Example Integration
 * v2.5.0 Phase 2.1 - IndexedDB Integration
 *
 * 演示如何在组件中使用离线存储功能
 */

import React, { useEffect } from 'react';
import { useOfflineAgent } from '../hooks/useOfflineAgent';
import { useOnlineStatusCallback } from '../hooks/useOnlineStatus';
import { syncManager } from '../services/offline/syncManager';

export const OfflineAgentList: React.FC = () => {
  const {
    agents,
    loading,
    error,
    saveAgent,
    updateAgent,
    deleteAgent,
    getUnsyncedAgents,
  } = useOfflineAgent();

  const { isOnline } = useOnlineStatusCallback(
    // 上线时自动同步
    async () => {
      console.log('[OfflineAgentList] Going online - starting sync');
      await syncManager.syncAll();
    },
    // 离线时提示用户
    () => {
      console.log('[OfflineAgentList] Going offline - data will be synced when connection restored');
    }
  );

  useEffect(() => {
    // 组件挂载时检查未同步数据
    checkUnsyncedData();
  }, []);

  const checkUnsyncedData = async () => {
    const unsynced = await getUnsyncedAgents();
    if (unsynced.length > 0) {
      console.log(`[OfflineAgentList] Found ${unsynced.length} unsynced agents`);
    }
  };

  const handleCreateAgent = async () => {
    try {
      await saveAgent({
        name: `Agent ${Date.now()}`,
        description: 'Created offline',
        status: 'active',
        level: 1,
        experience: 0,
      });
    } catch (err) {
      console.error('[OfflineAgentList] Failed to create agent:', err);
    }
  };

  const handleUpdateAgent = async (id: string) => {
    try {
      await updateAgent(id, {
        level: Math.floor(Math.random() * 10) + 1,
        experience: Math.floor(Math.random() * 1000),
      });
    } catch (err) {
      console.error('[OfflineAgentList] Failed to update agent:', err);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    try {
      await deleteAgent(id);
    } catch (err) {
      console.error('[OfflineAgentList] Failed to delete agent:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Loading offline agents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
        <p className="text-red-400">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div
        className={`p-4 rounded-lg border ${
          isOnline
            ? 'bg-green-900/20 border-green-500'
            : 'bg-yellow-900/20 border-yellow-500'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-green-400' : 'bg-yellow-400'
            }`}
          />
          <p className={isOnline ? 'text-green-400' : 'text-yellow-400'}>
            {isOnline ? 'Online' : 'Offline Mode'}
          </p>
        </div>
        {!isOnline && (
          <p className="text-sm text-gray-400 mt-1">
            Changes will be saved locally and synced when connection is restored
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCreateAgent}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
        >
          Create Agent
        </button>
        <button
          onClick={checkUnsyncedData}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
        >
          Check Unsynced
        </button>
      </div>

      {/* Agent List */}
      <div className="space-y-2">
        {agents.length === 0 ? (
          <div className="p-8 text-center bg-gray-800 rounded-lg">
            <p className="text-gray-400">No agents found</p>
            <p className="text-sm text-gray-500 mt-1">Create your first agent</p>
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      {agent.name}
                    </h3>
                    {!agent._synced && (
                      <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-400 rounded">
                        Unsynced
                      </span>
                    )}
                    {agent._offline && (
                      <span className="px-2 py-1 text-xs bg-blue-900/30 text-blue-400 rounded">
                        Offline
                      </span>
                    )}
                  </div>
                  {agent.description && (
                    <p className="text-sm text-gray-400 mt-1">
                      {agent.description}
                    </p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>Level: {agent.level}</span>
                    <span>XP: {agent.experience}</span>
                    <span>Status: {agent.status}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Version: {agent._version} |
                    Last updated: {new Date(agent._timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateAgent(agent.id)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Statistics</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Total Agents</p>
            <p className="text-2xl font-bold text-white">{agents.length}</p>
          </div>
          <div>
            <p className="text-gray-500">Unsynced</p>
            <p className="text-2xl font-bold text-yellow-400">
              {agents.filter((a) => !a._synced).length}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Offline</p>
            <p className="text-2xl font-bold text-blue-400">
              {agents.filter((a) => a._offline).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineAgentList;
