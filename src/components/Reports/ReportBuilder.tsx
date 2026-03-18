/**
 * 报表构建器组件 - Report Builder
 *
 * 拖拽式报表构建器主界面
 */

import { useState } from 'react';

interface ReportBuilderProps {
  onSave?: (report: any) => void;
}

export function ReportBuilder({ onSave }: ReportBuilderProps) {
  const [reportName, setReportName] = useState('');
  const [dataSource, setDataSource] = useState('agents');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">📊 报表构建器</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          创建自定义报表和数据分析
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        {/* 报表名称 */}
        <div>
          <label className="block text-sm font-medium mb-2">报表名称</label>
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="输入报表名称..."
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* 数据源选择 */}
        <div>
          <label className="block text-sm font-medium mb-2">数据源</label>
          <select
            value={dataSource}
            onChange={(e) => setDataSource(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="agents">Agents</option>
            <option value="tasks">Tasks</option>
            <option value="teams">Teams</option>
            <option value="analytics">Analytics</option>
          </select>
        </div>

        {/* 字段选择 */}
        <div>
          <label className="block text-sm font-medium mb-2">选择字段</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['name', 'status', 'level', 'xp', 'tasks', 'successRate'].map((field) => (
              <label key={field} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="checkbox"
                  checked={selectedFields.includes(field)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFields([...selectedFields, field]);
                    } else {
                      setSelectedFields(selectedFields.filter((f) => f !== field));
                    }
                  }}
                />
                <span className="text-sm">{field}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 图表类型 */}
        <div>
          <label className="block text-sm font-medium mb-2">图表类型</label>
          <div className="grid grid-cols-3 gap-3">
            {['bar', 'line', 'pie'].map((type) => (
              <button
                key={type}
                className="px-4 py-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
              >
                {type === 'bar' && '📊'}
                {type === 'line' && '📈'}
                {type === 'pie' && '🥧'}
                <span className="ml-2 capitalize">{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 justify-end">
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            取消
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={() => {
              const report = {
                name: reportName,
                dataSource,
                fields: selectedFields,
              };
              onSave?.(report);
            }}
          >
            保存报表
          </button>
        </div>
      </div>

      {/* 预览 */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">预览</h2>
        <div className="text-center text-gray-400 py-12">
          <p>报表预览将在这里显示</p>
        </div>
      </div>
    </div>
  );
}
