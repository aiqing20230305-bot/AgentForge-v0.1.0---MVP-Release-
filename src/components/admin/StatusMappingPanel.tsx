/**
 * Status Mapping Panel
 * 状态映射管理面板
 */

import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, RefreshCw } from 'lucide-react';
import { jiraStatusMapper, StatusMapping } from '../../services/integrations/jira/jiraStatusMapper';

export const StatusMappingPanel: React.FC = () => {
  const [mappings, setMappings] = useState<StatusMapping[]>([]);
  const [newMapping, setNewMapping] = useState<StatusMapping>({
    local: '',
    jira: '',
    description: ''
  });

  useEffect(() => {
    loadMappings();
  }, []);

  const loadMappings = () => {
    const loaded = jiraStatusMapper.getAllMappings();
    setMappings(loaded);
  };

  const handleAdd = () => {
    if (newMapping.local && newMapping.jira) {
      jiraStatusMapper.setMapping(newMapping.local, newMapping.jira, newMapping.description);
      setNewMapping({ local: '', jira: '', description: '' });
      loadMappings();
    }
  };

  const handleRemove = (local: string) => {
    jiraStatusMapper.removeMapping(local);
    loadMappings();
  };

  const handleReset = () => {
    if (confirm('确定要重置为默认映射吗？')) {
      jiraStatusMapper.resetToDefaults();
      loadMappings();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">状态映射配置</h3>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            重置为默认
          </button>
        </div>

        <div className="space-y-3">
          {mappings.map(mapping => (
            <div
              key={mapping.local}
              className="flex items-center gap-4 p-3 bg-gray-900 rounded-lg border border-gray-700"
            >
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">本地状态</div>
                  <div className="text-white font-medium">{mapping.local}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Jira 状态</div>
                  <div className="text-white font-medium">{mapping.jira}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">描述</div>
                  <div className="text-white">{mapping.description || '-'}</div>
                </div>
              </div>
              <button
                onClick={() => handleRemove(mapping.local)}
                className="p-2 hover:bg-red-600/20 text-red-400 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Mapping */}
        <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <h4 className="text-sm font-semibold text-white mb-3">添加新映射</h4>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              value={newMapping.local}
              onChange={e => setNewMapping({ ...newMapping, local: e.target.value })}
              placeholder="本地状态"
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              value={newMapping.jira}
              onChange={e => setNewMapping({ ...newMapping, jira: e.target.value })}
              placeholder="Jira 状态"
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              value={newMapping.description}
              onChange={e => setNewMapping({ ...newMapping, description: e.target.value })}
              placeholder="描述（可选）"
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!newMapping.local || !newMapping.jira}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加映射
          </button>
        </div>
      </div>
    </div>
  );
};
