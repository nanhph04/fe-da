import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { StudioWalletDashboard } from '@/features/studio-wallet/components/StudioWalletDashboard';
import { mockWalletBalanceResponse, mockWalletStatsResponse } from '@/tests/__mocks__/mockWalletData';
import { BrowserRouter } from 'react-router-dom';

// Mock the service
jest.mock('@/features/studio-wallet/services/studioWalletService', () => ({
  getWalletBalance: jest.fn(),
  getWalletStats: jest.fn(),
}));

// Mock components
jest.mock('@/features/studio-wallet/components/TransactionHistory', () => ({
  TransactionHistory: () => <div data-testid="transaction-history">Transaction History</div>,
}));

jest.mock('@/features/studio-wallet/components/WalletStats', () => ({
  WalletStats: ({ stats }: { stats: any }) => (
    <div data-testid="wallet-stats">
      <div>Views: {stats.totalViews}</div>
      <div>Revenue: ${stats.revenueThisMonth}</div>
    </div>
  ),
}));

jest.mock('@/features/studio-wallet/components/WithdrawFundsOverlay', () => ({
  WithdrawFundsOverlay: () => <div data-testid="withdraw-overlay">Withdraw Overlay</div>,
}));

const { getWalletBalance, getWalletStats } = require('@/features/studio-wallet/services/studioWalletService');

describe('StudioWalletDashboard Error Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading States', () => {
    it('should render loading state initially', () => {
      getWalletBalance.mockImplementation(() => new Promise(() => {}));
      getWalletStats.mockImplementation(() => new Promise(() => {}));

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should show skeleton loading for both wallet and stats', () => {
      getWalletBalance.mockImplementation(() => new Promise(() => {}));
      getWalletStats.mockImplementation(() => new Promise(() => {}));

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('stats-loading-skeleton')).toBeInTheDocument();
    });

    it('should handle partial loading state', async () => {
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockImplementation(() => new Promise(() => {}));

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('wallet-balance')).toBeInTheDocument();
        expect(screen.getByTestId('stats-loading-skeleton')).toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('should handle 401 Unauthorized error', async () => {
      getWalletBalance.mockRejectedValue({ status: 401 });
      getWalletStats.mockRejectedValue({ status: 401 });

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Session expired')).toBeInTheDocument();
        expect(screen.getByText('Please login again')).toBeInTheDocument();
      });
    });

    it('should handle 403 Forbidden error', async () => {
      getWalletBalance.mockRejectedValue({ status: 403 });
      getWalletStats.mockRejectedValue({ status: 403 });

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Access denied')).toBeInTheDocument();
        expect(screen.getByText('Insufficient permissions')).toBeInTheDocument();
      });
    });

    it('should handle 404 Not Found error', async () => {
      getWalletBalance.mockRejectedValue({ status: 404 });
      getWalletStats.mockRejectedValue({ status: 404 });

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Wallet not found')).toBeInTheDocument();
      });
    });

    it('should handle 500 Server Error', async () => {
      getWalletBalance.mockRejectedValue({ status: 500, message: 'Internal server error' });
      getWalletStats.mockRejectedValue({ status: 500 });

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
        expect(screen.getByText('Please try again later')).toBeInTheDocument();
      });
    });

    it('should handle network error', async () => {
      getWalletBalance.mockRejectedValue(new Error('Network Error'));
      getWalletStats.mockRejectedValue(new Error('Network Error'));

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
        expect(screen.getByText('Please check your connection')).toBeInTheDocument();
      });
    });

    it('should handle timeout error', async () => {
      jest.useFakeTimers();
      getWalletBalance.mockImplementation(() =>
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 1000))
      );
      getWalletStats.mockImplementation(() =>
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 1000))
      );

      const startTime = Date.now();
      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      // Fast-forward time
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText('Request timeout')).toBeInTheDocument();
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(2000);

      jest.useRealTimers();
    });

    it('should handle rate limiting (429)', async () => {
      getWalletBalance.mockRejectedValue({
        status: 429,
        headers: { 'Retry-After': '60' },
        message: 'Too many requests'
      });
      getWalletStats.mockRejectedValue({ status: 429 });

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument();
        expect(screen.getByText('Please wait 60 seconds')).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      getWalletBalance.mockRejectedValue(new Error('API Error'));
      getWalletStats.mockRejectedValue(new Error('API Error'));

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        const retryButton = screen.getByText('Retry');
        expect(retryButton).toBeInTheDocument();
      });

      // Retry should be called
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);
      fireEvent.click(screen.getByText('Retry'));

      await waitFor(() => {
        expect(screen.getByTestId('wallet-balance')).toBeInTheDocument();
      });
    });

    it('should handle partial error state (one API succeeds, one fails)', async () => {
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockRejectedValue(new Error('Stats API failed'));

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('wallet-balance')).toBeInTheDocument();
        expect(screen.getByText('Failed to load stats')).toBeInTheDocument();
      });
    });
  });

  describe('Success States with Edge Cases', () => {
    it('should handle zero balance gracefully', async () => {
      const zeroBalanceResponse = {
        ...mockWalletBalanceResponse,
        data: {
          ...mockWalletBalanceResponse.data,
          balance: 0
        }
      };

      getWalletBalance.mockResolvedValue(zeroBalanceResponse);
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('wallet-balance')).toHaveTextContent('$0.00');
      });
    });

    it('should handle negative balance (error case)', async () => {
      const negativeBalanceResponse = {
        ...mockWalletBalanceResponse,
        data: {
          ...mockWalletBalanceResponse.data,
          balance: -100
        }
      };

      getWalletBalance.mockResolvedValue(negativeBalanceResponse);
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        // Should show error for negative balance
        expect(screen.getByText('Invalid balance')).toBeInTheDocument();
      });
    });

    it('should handle large numbers formatting', async () => {
      const largeBalanceResponse = {
        ...mockWalletBalanceResponse,
        data: {
          ...mockWalletBalanceResponse.data,
          balance: 1000000
        }
      };

      getWalletBalance.mockResolvedValue(largeBalanceResponse);
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('wallet-balance')).toHaveTextContent('$1,000,000.00');
      });
    });

    it('should handle missing stats data', async () => {
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockResolvedValue({
        success: true,
        data: null
      });

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('wallet-balance')).toBeInTheDocument();
        expect(screen.getByText('No stats available')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should handle refresh button click', async () => {
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        const refreshButton = screen.getByTestId('refresh-button');
        fireEvent.click(refreshButton);
      });

      expect(getWalletBalance).toHaveBeenCalledTimes(2);
      expect(getWalletStats).toHaveBeenCalledTimes(2);
    });

    it('should handle withdrawal button click', async () => {
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        const withdrawButton = screen.getByTestId('withdraw-button');
        fireEvent.click(withdrawButton);
      });

      expect(screen.getByTestId('withdraw-modal')).toBeInTheDocument();
    });

    it('should close withdrawal modal when cancel clicked', async () => {
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        const withdrawButton = screen.getByTestId('withdraw-button');
        fireEvent.click(withdrawButton);
      });

      expect(screen.getByTestId('withdraw-modal')).toBeInTheDocument();

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(screen.queryByTestId('withdraw-modal')).not.toBeInTheDocument();
    });

    it('should handle navigation to earnings history', async () => {
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        const earningsLink = screen.getByText('View Earnings');
        fireEvent.click(earningsLink);
      });

      // Should navigate (in a real app, this would be a router navigation)
      expect(window.location.pathname).toContain('/studio/wallet/earnings');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);

      const { container } = render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        const balanceElement = screen.getByTestId('wallet-balance');
        balanceElement.focus();
        expect(balanceElement).toHaveFocus();
      });
    });

    it('should have proper ARIA labels', async () => {
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        const withdrawButton = screen.getByTestId('withdraw-button');
        expect(withdrawButton).toHaveAttribute('aria-label', 'Withdraw funds');
      });
    });

    it('should announce changes to screen readers', async () => {
      const mockAnnounce = jest.fn();

      // Mock screen reader announcements
      global.HTMLElement.prototype.getAttribute = function() {
        if (this.textContent?.includes('Balance updated')) {
          return 'true';
        }
        return '';
      };

      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockAnnounce).toHaveBeenCalledWith(
          expect.stringContaining('Balance updated')
        );
      });
    });

    it('should support screen readers with proper landmarks', async () => {
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);

      const { container } = render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        // Check for proper landmark roles
        const mainElement = container.querySelector('[role="main"]');
        expect(mainElement).toBeInTheDocument();

        // Check for proper heading structure
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        expect(headings.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance', () => {
    it('should not block rendering on slow API calls', async () => {
      // Slow API call
      getWalletBalance.mockReturnValue(
        new Promise(resolve => setTimeout(() => resolve(mockWalletBalanceResponse), 2000))
      );
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);

      const startTime = Date.now();
      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      // Should show skeleton immediately
      expect(screen.getByTestId('loading')).toBeInTheDocument();

      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(100); // Should render quickly

      await waitFor(() => {
        expect(screen.getByTestId('wallet-balance')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should memoize expensive calculations', async () => {
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);

      const { rerender } = render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      // Re-render with same data
      rerender(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      // Stats calculation should not be called again
      expect(getWalletStats).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid refresh requests', async () => {
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        const refreshButton = screen.getByTestId('refresh-button');

        // Click refresh multiple times rapidly
        fireEvent.click(refreshButton);
        fireEvent.click(refreshButton);
        fireEvent.click(refreshButton);
      });

      // Should only call APIs once (debounced)
      expect(getWalletBalance).toHaveBeenCalledTimes(2); // Initial + 1 refresh
      expect(getWalletStats).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Recovery', () => {
    it('should automatically retry failed requests', async () => {
      // First call fails, second succeeds
      getWalletBalance.mockImplementationOnce(() =>
        Promise.reject(new Error('API Error'))
      );
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });

      // Auto-retry should happen after delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      await waitFor(() => {
        expect(screen.getByTestId('wallet-balance')).toBeInTheDocument();
      });
    });

    it('should handle circuit breaker opening after multiple failures', async () => {
      let callCount = 0;

      // Mock API to fail 3 times
      getWalletBalance.mockImplementation(() => {
        callCount++;
        if (callCount <= 3) {
          return Promise.reject({ status: 500 });
        }
        return Promise.resolve(mockWalletBalanceResponse);
      });

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      // Wait for 3 failures
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Circuit breaker should open and block further calls
      expect(callCount).toBe(3);

      // Manual retry should work
      fireEvent.click(screen.getByText('Retry'));

      await waitFor(() => {
        expect(screen.getByTestId('wallet-balance')).toBeInTheDocument();
      });
    });
  });
});