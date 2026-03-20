/**
 * Unit Tests for useOnlineStatus Hook
 * v2.5.0 Phase 2.1 - IndexedDB Integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOnlineStatus, useOnlineStatusCallback } from '../useOnlineStatus';

describe('useOnlineStatus', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with online status from navigator', () => {
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.lastChangeTime).toBeNull();
    expect(result.current.changeCount).toBe(0);
  });

  it('should initialize with offline status when navigator is offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(false);
  });

  it('should update status when going offline', async () => {
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(true);

    // Simulate going offline
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(false);
    });

    expect(result.current.lastChangeTime).toBeTruthy();
    expect(result.current.changeCount).toBe(1);
  });

  it('should update status when coming back online', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(false);

    // Simulate going online
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
    });

    expect(result.current.lastChangeTime).toBeTruthy();
    expect(result.current.changeCount).toBe(1);
  });

  it('should increment change count on each status change', async () => {
    const { result } = renderHook(() => useOnlineStatus());

    // Go offline
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(result.current.changeCount).toBe(1);
    });

    // Go back online
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(result.current.changeCount).toBe(2);
    });

    // Go offline again
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(result.current.changeCount).toBe(3);
    });
  });

  it('should update lastChangeTime on each status change', async () => {
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.lastChangeTime).toBeNull();

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(result.current.lastChangeTime).toBeInstanceOf(Date);
    });

    const firstChangeTime = result.current.lastChangeTime;

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 10));

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(result.current.lastChangeTime).not.toEqual(firstChangeTime);
    });
  });

  it('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useOnlineStatus());

    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});

describe('useOnlineStatusCallback', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call onOnline callback when going online', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const onOnline = vi.fn();
    const onOffline = vi.fn();

    renderHook(() => useOnlineStatusCallback(onOnline, onOffline));

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(onOnline).toHaveBeenCalledTimes(1);
    });

    expect(onOffline).not.toHaveBeenCalled();
  });

  it('should call onOffline callback when going offline', async () => {
    const onOnline = vi.fn();
    const onOffline = vi.fn();

    renderHook(() => useOnlineStatusCallback(onOnline, onOffline));

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(onOffline).toHaveBeenCalledTimes(1);
    });

    expect(onOnline).not.toHaveBeenCalled();
  });

  it('should call callbacks on multiple status changes', async () => {
    const onOnline = vi.fn();
    const onOffline = vi.fn();

    renderHook(() => useOnlineStatusCallback(onOnline, onOffline));

    // Go offline
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(onOffline).toHaveBeenCalledTimes(1);
    });

    // Go online
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(onOnline).toHaveBeenCalledTimes(1);
    });

    // Go offline again
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(onOffline).toHaveBeenCalledTimes(2);
    });
  });

  it('should work without callbacks', () => {
    const { result } = renderHook(() => useOnlineStatusCallback());

    expect(result.current.isOnline).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    // Should not throw
  });

  it('should work with only onOnline callback', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const onOnline = vi.fn();

    renderHook(() => useOnlineStatusCallback(onOnline));

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(onOnline).toHaveBeenCalledTimes(1);
    });
  });

  it('should work with only onOffline callback', async () => {
    const onOffline = vi.fn();

    renderHook(() => useOnlineStatusCallback(undefined, onOffline));

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(onOffline).toHaveBeenCalledTimes(1);
    });
  });

  it('should return same status object as useOnlineStatus', () => {
    const { result } = renderHook(() => useOnlineStatusCallback());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.lastChangeTime).toBeNull();
    expect(result.current.changeCount).toBe(0);
  });
});
