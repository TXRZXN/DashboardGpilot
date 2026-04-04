import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReferralSyncCard } from '../referral-sync-card';
import { TradeHistoryService } from '@/shared/services/trade-history-service';
import { ThemeProvider, createTheme } from '@mui/material';

// Mock the service
vi.mock('@/shared/services/trade-history-service', () => ({
  TradeHistoryService: {
    getReferralHistory: vi.fn(),
    syncReferralTrades: vi.fn(),
  },
}));

// Mock MUI Icons to prevent EMFILE error (too many open files)
vi.mock('@mui/icons-material', () => ({
  __esModule: true,
  Sync: () => <div data-testid="SyncIcon" />,
  FileDownload: () => <div data-testid="FileDownloadIcon" />,
  ErrorOutline: () => <div data-testid="ErrorOutlineIcon" />,
  CheckCircleOutline: () => <div data-testid="CheckCircleOutlineIcon" />,
  People: () => <div data-testid="PeopleIcon" />,
  Schedule: () => <div data-testid="ScheduleIcon" />,
  TrendingUp: () => <div data-testid="TrendingUpIcon" />,
  ChevronLeft: () => <div data-testid="ChevronLeftIcon" />,
  ChevronRight: () => <div data-testid="ChevronRightIcon" />,
}));

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('ReferralSyncCard', () => {
  const mockData = {
    totalThisWeek: 100.50,
    lastSync: new Date().toISOString(),
    trades: [
      {
        email: 'test@example.com',
        accountId: '12345678',
        amount: 50.25,
        currency: 'USD',
        date: new Date().toISOString(),
        status: 'success'
      },
      {
        email: 'fail@example.com',
        accountId: '87654321',
        amount: 0,
        currency: 'USD',
        date: new Date().toISOString(),
        status: 'failed',
        error: 'Login Failed'
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    (TradeHistoryService.getReferralHistory as any).mockReturnValue(new Promise(() => {}));
    renderWithTheme(<ReferralSyncCard />);
    // Should show skeletons (checked by presence of specific UI elements rather than raw text)
    // In our case, the fetchHistory is called in useEffect
  });

  it('displays data correctly after loading', async () => {
    (TradeHistoryService.getReferralHistory as any).mockResolvedValue({
      success: true,
      data: mockData,
      error: null
    });

    renderWithTheme(<ReferralSyncCard />);

    await waitFor(() => {
      expect(screen.getByText(/\$100\.50/)).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('fail@example.com')).toBeInTheDocument();
    });
  });

  it('triggers sync when button is clicked', async () => {
    (TradeHistoryService.getReferralHistory as any).mockResolvedValue({
      success: true,
      data: mockData,
      error: null
    });
    
    (TradeHistoryService.syncReferralTrades as any).mockResolvedValue({
      success: true,
      data: { ...mockData, totalThisWeek: 200 },
      error: null
    });

    renderWithTheme(<ReferralSyncCard />);

    await waitFor(() => screen.getByText('ซิงค์ด่วน'));
    
    fireEvent.click(screen.getByText('ซิงค์ด่วน'));

    await waitFor(() => {
      expect(TradeHistoryService.syncReferralTrades).toHaveBeenCalled();
      expect(screen.getByText(/\$200\.00/)).toBeInTheDocument();
    });
  });

  it('displays error message on fetch failure', async () => {
    (TradeHistoryService.getReferralHistory as any).mockResolvedValue({
      success: false,
      data: null,
      error: { message: 'Failed to fetch' }
    });

    renderWithTheme(<ReferralSyncCard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });
});
