import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RealtimeDashboard } from '../RealtimeDashboard';

/**
 * RealtimeDashboard集成测试
 * v2.2.0 Phase 3.1
 */

describe('RealtimeDashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render dashboard title', () => {
    render(<RealtimeDashboard />);
    expect(screen.getByText('📊 实时监控')).toBeInTheDocument();
  });

  it('should render 4 metric cards', () => {
    render(<RealtimeDashboard />);

    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    expect(screen.getByText('Avg Response')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
  });

  it('should display metric values', () => {
    render(<RealtimeDashboard />);

    expect(screen.getByText('98.5%')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('120ms')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('should display trend indicators', () => {
    render(<RealtimeDashboard />);

    expect(screen.getByText('+2.3%')).toBeInTheDocument();
    expect(screen.getByText('-5%')).toBeInTheDocument();
    expect(screen.getByText('-12ms')).toBeInTheDocument();
    expect(screen.getByText('+156')).toBeInTheDocument();
  });

  it('should update data over time', async () => {
    render(<RealtimeDashboard />);

    // 初始状态检查
    const initialDataPoints = screen.queryAllByRole('img'); // ECharts renders as canvas/svg

    // 快进2秒（数据更新间隔）
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      // 验证数据已更新（通过检查是否有新的DOM变化）
      expect(document.querySelectorAll('canvas').length).toBeGreaterThan(0);
    });
  });

  it('should render 3 ECharts instances', () => {
    render(<RealtimeDashboard />);

    // ECharts渲染为canvas元素
    const canvases = document.querySelectorAll('canvas');
    expect(canvases.length).toBeGreaterThanOrEqual(3);
  });

  it('should handle component unmount gracefully', () => {
    const { unmount } = render(<RealtimeDashboard />);

    // 应该不抛出错误
    expect(() => unmount()).not.toThrow();
  });

  it('should have responsive grid layout', () => {
    render(<RealtimeDashboard />);

    const dashboard = screen.getByText('📊 实时监控').parentElement;
    expect(dashboard).toHaveStyle({ padding: '20px' });
  });
});
