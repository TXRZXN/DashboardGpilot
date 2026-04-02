import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, renderHook } from '@testing-library/react';
import React from 'react';
import { TradeDataProvider, useTradeData } from '../trade-data-provider';
import { AccountService } from '@/shared/services/account-service';
import { TradeHistoryService } from '@/shared/services/trade-history-service';
import { useApiHealth } from '../api-health-provider';

// Mock dependencies
vi.mock('../api-health-provider', () => ({
  useApiHealth: vi.fn(),
}));

vi.mock('@/shared/services/account-service', () => ({
  AccountService: {
    getAccountInfo: vi.fn(),
  },
}));

vi.mock('@/shared/services/trade-history-service', () => ({
  TradeHistoryService: {
    getHistory: vi.fn(),
  },
}));

// Helper component to access sync data
function TestComponent() {
  const data = useTradeData();
  return (
    <div data-testid="trade-data">
      <span data-testid="is-initialized">{data.isInitialized.toString()}</span>
      <span data-testid="loading">{data.loading.toString()}</span>
      <span data-testid="error">{data.error || 'none'}</span>
      <span data-testid="deals-count">{data.deals.length}</span>
      <span data-testid="account-name">{data.account?.name || 'none'}</span>
    </div>
  );
}

describe('TradeDataProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default healthy state
    vi.mocked(useApiHealth).mockReturnValue({
      isHealthy: true,
      isChecking: false,
      lastChecked: new Date(),
      checkHealth: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('provides initial state correctly', () => {
    // Override default to show checking state
    vi.mocked(useApiHealth).mockReturnValue({
      isHealthy: true,
      isChecking: true,
      lastChecked: null,
      checkHealth: vi.fn(),
    });

    const { getByTestId } = render(
      <TradeDataProvider>
        <TestComponent />
      </TradeDataProvider>
    );

    expect(getByTestId('is-initialized').textContent).toBe('false');
    expect(getByTestId('loading').textContent).toBe('true');
  });

  it('fetches data successfully when healthy', async () => {
    const mockAccount = { name: 'Test Account', balance: 1000 };
    const mockDeals = [{ ticket: 123, type: 0, price: 1.1 }];

    vi.mocked(AccountService.getAccountInfo).mockResolvedValue({
      success: true,
      data: mockAccount as any,
      error: null,
    });
    vi.mocked(TradeHistoryService.getHistory).mockResolvedValue({
      success: true,
      data: mockDeals as any,
      error: null,
    });

    const { getByTestId } = render(
      <TradeDataProvider>
        <TestComponent />
      </TradeDataProvider>
    );

    await waitFor(() => {
      expect(getByTestId('is-initialized').textContent).toBe('true');
    });

    expect(getByTestId('account-name').textContent).toBe('Test Account');
    expect(getByTestId('deals-count').textContent).toBe('1');
    expect(getByTestId('loading').textContent).toBe('false');
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(AccountService.getAccountInfo).mockResolvedValue({
      success: false,
      data: null,
      error: { code: 'API_ERROR', message: 'Failed to fetch account' },
    });
    vi.mocked(TradeHistoryService.getHistory).mockResolvedValue({
      success: true,
      data: [],
      error: null,
    });

    const { getByTestId } = render(
      <TradeDataProvider>
        <TestComponent />
      </TradeDataProvider>
    );

    await waitFor(() => {
      expect(getByTestId('error').textContent).toBe('Failed to fetch account');
    });

    expect(getByTestId('loading').textContent).toBe('false');
  });

  it('does not fetch data when API is unhealthy', async () => {
    vi.mocked(useApiHealth).mockReturnValue({
      isHealthy: false,
      isChecking: false,
      lastChecked: new Date(),
      checkHealth: vi.fn(),
    });

    render(
      <TradeDataProvider>
        <TestComponent />
      </TradeDataProvider>
    );

    // Give it some time to potentially call fetchData
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(AccountService.getAccountInfo).not.toHaveBeenCalled();
    expect(TradeHistoryService.getHistory).not.toHaveBeenCalled();
  });

  it('supports fallback for nested data structure from service', async () => {
    const mockDeals = [{ ticket: 456, type: 1 }];
    
    vi.mocked(AccountService.getAccountInfo).mockResolvedValue({
      success: true,
      data: {} as any,
      error: null,
    });
    // Mock nested structure: { data: deals }
    vi.mocked(TradeHistoryService.getHistory).mockResolvedValue({
      success: true,
      data: { data: mockDeals } as any,
      error: null,
    });

    const { getByTestId } = render(
      <TradeDataProvider>
        <TestComponent />
      </TradeDataProvider>
    );

    await waitFor(() => {
      expect(getByTestId('deals-count').textContent).toBe('1');
    });
  });

  it('resets initialized state when health changes to false', async () => {
    const { rerender, getByTestId } = render(
      <TradeDataProvider>
        <TestComponent />
      </TradeDataProvider>
    );

    // Initial load success (mocked defaults)
    vi.mocked(AccountService.getAccountInfo).mockResolvedValue({ success: true, data: {} as any, error: null });
    vi.mocked(TradeHistoryService.getHistory).mockResolvedValue({ success: true, data: [], error: null });

    await waitFor(() => {
      expect(getByTestId('is-initialized').textContent).toBe('true');
    });

    // Change health to false
    vi.mocked(useApiHealth).mockReturnValue({
      isHealthy: false,
      isChecking: false,
      lastChecked: new Date(),
      checkHealth: vi.fn(),
    });

    rerender(
      <TradeDataProvider>
        <TestComponent />
      </TradeDataProvider>
    );

    expect(getByTestId('is-initialized').textContent).toBe('false');
  });

  it('triggers refresh when refreshData is called', async () => {
    vi.mocked(AccountService.getAccountInfo).mockResolvedValue({ success: true, data: {} as any, error: null });
    vi.mocked(TradeHistoryService.getHistory).mockResolvedValue({ success: true, data: [], error: null });

    let capturedData: any;
    function Wrapper({ children }: { children: React.ReactNode }) {
      const data = useTradeData();
      capturedData = data;
      return <>{children}</>;
    }

    render(
      <TradeDataProvider>
        <Wrapper>
          <TestComponent />
        </Wrapper>
      </TradeDataProvider>
    );

    await waitFor(() => {
      expect(capturedData.isInitialized).toBe(true);
    });

    // Clear calls from initial mount
    vi.mocked(AccountService.getAccountInfo).mockClear();
    vi.mocked(TradeHistoryService.getHistory).mockClear();

    // Call refresh
    await capturedData.refreshData();

    expect(AccountService.getAccountInfo).toHaveBeenCalledTimes(1);
    expect(TradeHistoryService.getHistory).toHaveBeenCalledTimes(1);
  });
});
