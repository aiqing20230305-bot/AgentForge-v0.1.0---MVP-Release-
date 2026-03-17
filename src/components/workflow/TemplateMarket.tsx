/**
 * 模板市场
 * Template Market
 */

import React, { useState, useEffect } from 'react';
import { WorkflowTemplate } from '../../services/workflow/types';
import { templateRegistry } from '../../services/workflow';

interface TemplateMarketProps {
  onSelectTemplate: (template: WorkflowTemplate) => void;
  onClose: () => void;
}

export const TemplateMarket: React.FC<TemplateMarketProps> = ({ onSelectTemplate, onClose }) => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WorkflowTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const allTemplates = templateRegistry.getAll();
    const allCategories = templateRegistry.getCategories();

    setTemplates(allTemplates);
    setFilteredTemplates(allTemplates);
    setCategories(['all', ...allCategories]);
  }, []);

  useEffect(() => {
    let filtered = templates;

    // 分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchQuery]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '90%',
          maxWidth: '1200px',
          height: '90%',
          backgroundColor: 'white',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <h2 style={{ flex: 1, margin: 0, fontSize: '20px', fontWeight: 600 }}>
            🎨 工作流模板市场
          </h2>

          {/* 搜索框 */}
          <input
            type="text"
            placeholder="搜索模板..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '300px',
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />

          <button
            onClick={onClose}
            style={{
              padding: '8px 12px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '20px',
            }}
          >
            ✕
          </button>
        </div>

        {/* 内容区 */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* 左侧：分类 */}
          <div
            style={{
              width: '200px',
              borderRight: '1px solid #e2e8f0',
              padding: '16px',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>分类</h3>
            {categories.map((category) => (
              <div
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '8px 12px',
                  marginBottom: '4px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  backgroundColor: selectedCategory === category ? '#e0e7ff' : 'transparent',
                  color: selectedCategory === category ? '#3730a3' : '#475569',
                  fontWeight: selectedCategory === category ? 600 : 400,
                  transition: 'all 0.2s',
                }}
              >
                {category === 'all' ? '全部' : category}
              </div>
            ))}
          </div>

          {/* 右侧：模板列表 */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  style={{
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: 'white',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{template.icon}</div>

                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>
                    {template.name}
                  </h4>

                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>
                    {template.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: '2px 8px',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: '#475569',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                    <span>⭐ {template.popularity}</span>
                    <span>•</span>
                    <span>{template.category}</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#94a3b8',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <p>未找到匹配的模板</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
