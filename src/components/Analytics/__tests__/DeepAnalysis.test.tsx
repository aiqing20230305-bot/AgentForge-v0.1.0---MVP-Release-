import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeepAnalysis } from '../DeepAnalysis';

/**
 * DeepAnalysis集成测试
 * v2.2.0 Phase 3.1
 */

describe('DeepAnalysis', () => {
  it('should render analysis title', () => {
    render(<DeepAnalysis />);
    expect(screen.getByText('🔍 深度分析')).toBeInTheDocument();
  });

  it('should render conversion funnel data', () => {
    render(<DeepAnalysis />);

    // 检查漏斗阶段
    const text = document.body.textContent;
    expect(text).toContain('Visits');
    expect(text).toContain('Sign Up');
    expect(text).toContain('Create Agent');
    expect(text).toContain('Deploy');
    expect(text).toContain('Active Users');
  });

  it('should render retention rate data', () => {
    render(<DeepAnalysis />);

    const text = document.body.textContent;
    expect(text).toContain('Day 1');
    expect(text).toContain('Day 3');
    expect(text).toContain('Day 7');
    expect(text).toContain('Day 14');
    expect(text).toContain('Day 30');
  });

  it('should render activity heatmap', () => {
    render(<DeepAnalysis />);

    const text = document.body.textContent;
    expect(text).toContain('Mon');
    expect(text).toContain('Tue');
    expect(text).toContain('Wed');
    expect(text).toContain('Thu');
    expect(text).toContain('Fri');
    expect(text).toContain('Sat');
    expect(text).toContain('Sun');
  });

  it('should display key insights section', () => {
    render(<DeepAnalysis />);

    expect(screen.getByText('📈 Key Insights')).toBeInTheDocument();

    const text = document.body.textContent;
    expect(text).toContain('Conversion rate');
    expect(text).toContain('retention rate');
    expect(text).toContain('Peak activity');
    expect(text).toContain('Churn risk');
  });

  it('should show conversion rate percentage', () => {
    render(<DeepAnalysis />);

    const text = document.body.textContent;
    expect(text).toContain('25%'); // 2500/10000 = 25%
  });

  it('should show retention metrics', () => {
    render(<DeepAnalysis />);

    const text = document.body.textContent;
    expect(text).toContain('72%'); // Day 7 retention
    expect(text).toContain('65%'); // industry average
  });

  it('should render 3 ECharts instances', () => {
    render(<DeepAnalysis />);

    // 漏斗图 + 留存率图 + 热力图
    const canvases = document.querySelectorAll('canvas');
    expect(canvases.length).toBeGreaterThanOrEqual(3);
  });

  it('should have proper grid layout', () => {
    render(<DeepAnalysis />);

    const container = screen.getByText('🔍 深度分析').parentElement;
    expect(container).toHaveStyle({ padding: '20px' });
  });
});
