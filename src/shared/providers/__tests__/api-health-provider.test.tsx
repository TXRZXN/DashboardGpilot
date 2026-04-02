import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ApiHealthProvider, useApiHealth } from '../api-health-provider';
import { HealthService } from '@/shared/services/health-service';
import { usePathname } from 'next/navigation';
import React from 'react';

// Mock dependencies
vi.mock('@/shared/services/health-service', () => ({
  HealthService: {
    checkHealth: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Helper component to test the hook
const TestComponent = () => {
  const { isHealthy, isChecking } = useApiHealth();
  return (
    <div>
      <span data-testid="status">{isHealthy ? 'Healthy' : 'Unhealthy'}</span>
      <span data-testid="loading">{isChecking ? 'Checking' : 'Done'}</span>
    </div>
  );
};

describe('ApiHealthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePathname).mockReturnValue('/dashboard');
  });

  it('ApiHealthProvider_SuccessfulCheck_SetsIsHealthyTrue', async () => {
    vi.mocked(HealthService.checkHealth).mockResolvedValue({
      success: true,
      data: { status: 'ok' },
      error: null
    });

    await act(async () => {
      render(
        <ApiHealthProvider>
          <TestComponent />
        </ApiHealthProvider>
      );
    });

    expect(HealthService.checkHealth).toHaveBeenCalled();
    expect(screen.getByTestId('status').textContent).toBe('Healthy');
  });

  it('ApiHealthProvider_FailedCheck_SetsIsHealthyFalse', async () => {
    vi.mocked(HealthService.checkHealth).mockResolvedValue({
      success: false,
      data: { status: 'down' },
      error: 'Down'
    });

    await act(async () => {
      render(
        <ApiHealthProvider>
          <TestComponent />
        </ApiHealthProvider>
      );
    });

    expect(screen.getByTestId('status').textContent).toBe('Unhealthy');
  });

  it('ApiHealthProvider_OnPathnameChange_TriggersHealthCheck', async () => {
     vi.mocked(HealthService.checkHealth).mockResolvedValue({
      success: true,
      data: { status: 'ok' },
      error: null
    });

    const { rerender } = render(
      <ApiHealthProvider>
        <TestComponent />
      </ApiHealthProvider>
    );

    // Initial check
    expect(HealthService.checkHealth).toHaveBeenCalledTimes(1);

    // Change pathname
    vi.mocked(usePathname).mockReturnValue('/history');
    
    await act(async () => {
      rerender(
        <ApiHealthProvider>
          <TestComponent />
        </ApiHealthProvider>
      );
    });

    expect(HealthService.checkHealth).toHaveBeenCalledTimes(2);
  });
});
