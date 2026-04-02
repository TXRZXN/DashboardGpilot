import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '../data-table';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';

// Mock totals
const mockTotals = {
  totalTrades: 2,
  volume: 2,
  grossProfit: 200,
  grossLoss: -50,
  netPL: 150,
  commission: 0,
  swap: 0,
  fee: 0,
};

// Mock deals
const mockDeals = [
  {
    ticket: 1,
    closeTime: '2024-03-25 10:00:00',
    symbol: 'EURUSD',
    type: 'BUY',
    volume: 1,
    netProfit: 100,
    profit: 100,
  },
  {
    ticket: 2,
    closeTime: '2024-03-25 11:00:00',
    symbol: 'GBPUSD',
    type: 'SELL',
    volume: 1,
    netProfit: 50,
    profit: 50,
  },
] as any[];

const theme = createTheme();

const defaultProps = {
  loading: false,
  deals: mockDeals,
  totals: mockTotals,
  search: '',
  onSearchChange: vi.fn(),
  sortField: 'closeTime' as any,
  sortDirection: 'asc' as any,
  onSort: vi.fn(),
  typeFilter: 'ALL' as any,
  onTypeFilterChange: vi.fn(),
  startDate: '',
  onStartDateChange: vi.fn(),
  endDate: '',
  onEndDateChange: vi.fn(),
  minProfit: '',
  onMinProfitChange: vi.fn(),
  maxProfit: '',
  onMaxProfitChange: vi.fn(),
  minVolume: '',
  onMinVolumeChange: vi.fn(),
  maxVolume: '',
  onMaxVolumeChange: vi.fn(),
  filteredCount: 2,
};

describe('DataTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('DataTable_RendersRows_MatchesMockData', () => {
    render(
      <ThemeProvider theme={theme}>
        <DataTable {...defaultProps} />
      </ThemeProvider>
    );

    expect(screen.getAllByText('EURUSD').length).toBeGreaterThan(0);
    expect(screen.getAllByText('GBPUSD').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Trade History').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2 trades found').length).toBeGreaterThan(0);
  });

  it('DataTable_OnSearchChange_TriggersCallback', () => {
    render(
      <ThemeProvider theme={theme}>
        <DataTable {...defaultProps} />
      </ThemeProvider>
    );

    const searchInput = screen.getByPlaceholderText('Search symbol...');
    fireEvent.change(searchInput, { target: { value: 'EUR' } });

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('EUR');
  });

  it('DataTable_LoadingState_ShowsCircularProgress', () => {
    render(
      <ThemeProvider theme={theme}>
        <DataTable {...defaultProps} loading={true} />
      </ThemeProvider>
    );

    expect(screen.getByRole('progressbar')).toBeDefined();
  });
});
