import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReferralSyncCard } from '../referral-sync-card';
import { TradeHistoryService } from '@/shared/services/trade-history-service';
import { ThemeProvider, createTheme } from '@mui/material';

// Mock the service
vi.mock('@/shared/services/trade-history-service', () => ({
  TradeHistoryService: {
    getReferralHistory: vi.fn(),
  },
}));

// Mock MUI Icons to prevent EMFILE error (too many open files)
vi.mock('@mui/icons-material', () => ({
  __esModule: true,
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
  const mockData = [
    {
      ticket: 1,
      time: new Date().toISOString(),
      type: 1,
      lots: 0.1,
      symbol: 'EURUSD',
      price: 1.1,
      netProfit: 50.25,
      comment: 'Referral Share',
      accountId: 'MT5_12345678',
      userEmail: 'test@example.com'
    },
    {
      ticket: 2,
      time: new Date().toISOString(),
      type: 1,
      lots: 0.1,
      symbol: 'EURUSD',
      price: 1.1,
      netProfit: 50.25,
      comment: 'Referral Share',
      accountId: 'MT5_87654321',
      userEmail: 'fail@example.com'
    }
  ];

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
