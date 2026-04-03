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
    openPrice: 1.0800,
    closePrice: 1.0810,
  },
  {
    ticket: 2,
    closeTime: '2024-03-25 11:00:00',
    symbol: 'GBPUSD',
    type: 'SELL',
    volume: 1,
    netProfit: 50,
    profit: 50,
    openPrice: 1.2500,
    closePrice: 1.2450,
  },
] as any[];

const theme = createTheme();

const defaultProps = {
  loading: false,
  deals: mockDeals,
  totals: mockTotals,
  symbolFilter: '',
  onSymbolFilterChange: vi.fn(),
  sortField: 'closeTime' as any,
  sortDirection: 'asc' as any,
  onSort: vi.fn(),
  typeFilter: 'ALL' as any,
  onTypeFilterChange: vi.fn(),
  startDate: '',
  onStartDateChange: vi.fn(),
  endDate: '',
  onEndDateChange: vi.fn(),
  filteredCount: 2,
  totalCount: 2,
  page: 0,
  rowsPerPage: 10,
  onPageChange: vi.fn(),
  onRowsPerPageChange: vi.fn(),
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

  it('DataTable_OnSymbolFilterChange_TriggersCallback', () => {
    render(
      <ThemeProvider theme={theme}>
        <DataTable {...defaultProps} />
      </ThemeProvider>
    );

    const searchInput = screen.getByPlaceholderText('Type symbol...');
    fireEvent.change(searchInput, { target: { value: 'EUR' } });

    expect(defaultProps.onSymbolFilterChange).toHaveBeenCalledWith('EUR');
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
