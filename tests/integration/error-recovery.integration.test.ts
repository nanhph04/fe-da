/**
 * Error Recovery Integration Tests
 * Tests how the system handles and recovers from errors across components
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { StudioWalletDashboard } from '@/features/studio-wallet/components/StudioWalletDashboard';
import { WithdrawFundsOverlay } from '@/features/studio-wallet/components/WithdrawFundsOverlay';
import { StudioWalletService } from '@/features/studio-wallet/services/studioWalletService';
import { WithdrawalService } from '@/features/studio-wallet/services/withdrawalService';
import { BrowserRouter } from 'react-router-dom';

// Mock all services
jest.mock('@/features/studio-wallet/services/studioWalletService');
jest.mock('@/features/studio-wallet/services/withdrawalService');
jest.mock('@/shared/components/ErrorBoundary');

const mockStudioWalletService = StudioWalletService as jest.Mocked<typeof StudioWalletService>;
const mockWithdrawalService = WithdrawalService as jest.Mocked<typeof WithdrawalService>;

// Mock data
const mockWallet = {
  id: 'wallet-1',
  userId: 'user-1',
  type: 'STUDIO' as const,
  balance: 5000,
  frozenBalance: 0,
  totalEarnings: 10000,
  status: 'ACTIVE' as const,
  videoCount: 10,
  totalViews: 15000,
  revenueThisMonth: 4500,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockStats = {
  id: 'stats-1',
  walletId: 'wallet-1',
  totalViews: 15000,
  totalWatchTime: 45000,
  totalRevenue: 10000,
  averageViewDuration: 3.0,
  topPerformingVideos: [
    {
      videoId: 'video-1',
      title: 'Sample Video',
      views: 5000,
      revenue: 2500,
    },
  ],
  period: 'monthly',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Error Recovery Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Service Failure Recovery', () => {
    it('should gracefully handle partial service failures', async () => {
      // Mock wallet service to succeed, stats service to fail
      mockStudioWalletService.getStudioWallet.mockResolvedValue(mockWallet);
      mockStudioWalletService.getWalletStats.mockRejectedValue({ status: 500 });

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
        expect(screen.getByText('Failed to load stats')).toBeInTheDocument();
      });

      // User should still be able to use other features
      const withdrawButton = screen.getByText('Withdraw Funds');
      expect(withdrawButton).not.toBeDisabled();
      fireEvent.click(withdrawButton);

      // Withdrawal modal should open
      expect(screen.getByText('Withdraw Funds')).toBeInTheDocument();
    });

    it('should retry failed requests automatically', async () => {
      let retryCount = 0;

      // Mock service to fail first time, succeed second
      mockStudioWalletService.getStudioWallet.mockImplementation(() => {
        retryCount++;
        if (retryCount === 1) {
          return Promise.reject({ status: 500 });
        }
        return Promise.resolve(mockWallet);
      });
      mockStudioWalletService.getWalletStats.mockResolvedValue(mockStats);

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      // Should show error initially
      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
      });

      // Auto-retry should happen after delay (5 seconds)
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
        expect(retryCount).toBe(2);
      });
    });

    it('should handle circuit breaker pattern across services', async () => {
      let callCount = 0;

      // Mock service to fail multiple times
      mockStudioWalletService.getStudioWallet.mockImplementation(() => {
        callCount++;
        if (callCount <= 3) {
          return Promise.reject({ status: 500 });
        }
        return Promise.resolve(mockWallet);
      });

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      // Should fail 3 times and open circuit
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(callCount).toBe(3);

      // Manual retry should work
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
        expect(callCount).toBe(4);
      });
    });
  });

  describe('Withdrawal Flow Error Recovery', () => {
    it('should handle withdrawal submission failures gracefully', async () => {
      // Mock successful wallet load
      mockStudioWalletService.getStudioWallet.mockResolvedValue(mockWallet);
      mockStudioWalletService.getWalletStats.mockResolvedValue(mockStats);

      // Mock withdrawal failure
      mockWithdrawalService.createWithdrawal.mockRejectedValue({
        status: 500,
        message: 'Withdrawal service unavailable'
      });

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
      });

      // Open withdrawal modal
      fireEvent.click(screen.getByText('Withdraw Funds'));

      // Fill form
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '1000' } });
      fireEvent.change(screen.getByPlaceholderText('Account Number'), {
        target: { value: '1234567890' }
      });
      fireEvent.change(screen.getByPlaceholderText('Account Holder Name'), {
        target: { value: 'TEST USER' }
      });

      // Submit withdrawal
      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      await waitFor(() => {
        expect(screen.getByText('Failed to process withdrawal')).toBeInTheDocument();
        expect(screen.getByText('Please try again.')).toBeInTheDocument();
      });

      // Should still be able to try again
      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeInTheDocument();

      // Mock successful withdrawal on retry
      mockWithdrawalService.createWithdrawal.mockResolvedValue({
        id: 'withdrawal-1',
        amount: 1000,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });

      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(1000);
      });
    });

    it('should handle validation errors during withdrawal', async () => {
      // Mock successful wallet load
      mockStudioWalletService.getStudioWallet.mockResolvedValue(mockWallet);
      mockStudioWalletService.getWalletStats.mockResolvedValue(mockStats);

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
      });

      // Open withdrawal modal
      fireEvent.click(screen.getByText('Withdraw Funds'));

      // Try to submit with invalid data
      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Please enter your bank account details.')).toBeInTheDocument();
      });

      // Should still be able to correct and submit
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '1000' } });
      fireEvent.change(screen.getByPlaceholderText('Account Number'), {
        target: { value: '1234567890' }
      });
      fireEvent.change(screen.getByPlaceholderText('Account Holder Name'), {
        target: { value: 'TEST USER' }
      });

      // Submit successfully
      mockWithdrawalService.createWithdrawal.mockResolvedValue({
        id: 'withdrawal-1',
        amount: 1000,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });

      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      await waitFor(() => {
        expect(screen.queryByText('Withdraw Funds')).not.toBeInTheDocument();
      });
    });

    it('should handle session expiration during withdrawal flow', async () => {
      // Mock successful initial load
      mockStudioWalletService.getStudioWallet.mockResolvedValue(mockWallet);
      mockStudioWalletService.getWalletStats.mockResolvedValue(mockStats);

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
      });

      // Open withdrawal modal
      fireEvent.click(screen.getByText('Withdraw Funds'));

      // Fill form
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '1000' } });
      fireEvent.change(screen.getByPlaceholderText('Account Number'), {
        target: { value: '1234567890' }
      });
      fireEvent.change(screen.getByPlaceholderText('Account Holder Name'), {
        target: { value: 'TEST USER' }
      });

      // Mock session error during submission
      mockWithdrawalService.createWithdrawal.mockRejectedValue({ status: 401 });

      // Submit withdrawal
      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      await waitFor(() => {
        expect(screen.getByText('Session expired')).toBeInTheDocument();
      });

      // Should redirect to login or show login prompt
      expect(screen.getByText('Please login again')).toBeInTheDocument();

      // After login, should allow withdrawal to continue
      mockWithdrawalService.createWithdrawal.mockResolvedValue({
        id: 'withdrawal-1',
        amount: 1000,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });

      // Mock login success
      fireEvent.click(screen.getByText('Login'));

      // Should be able to complete withdrawal
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(1000);
      });
    });
  });

  describe('Network Error Recovery', () => {
    it('should handle offline scenario gracefully', async () => {
      // Mock successful initial load
      mockStudioWalletService.getStudioWallet.mockResolvedValue(mockWallet);
      mockStudioWalletService.getWalletStats.mockResolvedValue(mockStats);

      // Mock offline error
      mockStudioWalletService.getStudioWallet.mockImplementationOnce(() =>
        Promise.reject(new Error('Network Error'))
      );

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      // Simulate offline event
      window.dispatchEvent(new Event('offline'));

      // Should show offline message
      await waitFor(() => {
        expect(screen.getByText('You are offline')).toBeInTheDocument();
        expect(screen.getByText('Please check your connection')).toBeInTheDocument();
      });

      // Should allow user to continue with cached data
      expect(screen.getByText('Wallet Balance')).toBeInTheDocument();

      // Should retry when back online
      window.dispatchEvent(new Event('online'));

      // Mock successful retry
      mockStudioWalletService.getStudioWallet.mockResolvedValue(mockWallet);

      await waitFor(() => {
        expect(screen.queryByText('You are offline')).not.toBeInTheDocument();
      });
    });

    it('should handle timeout with exponential backoff', async () => {
      let retryCount = 0;

      // Mock timeout errors
      mockStudioWalletService.getStudioWallet.mockImplementation(() => {
        retryCount++;
        if (retryCount <= 3) {
          return new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 1000)
          );
        }
        return Promise.resolve(mockWallet);
      });

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      // Should show timeout message
      await waitFor(() => {
        expect(screen.getByText('Request timeout')).toBeInTheDocument();
      });

      // Should retry with increasing delays
      act(() => {
        jest.advanceTimersByTime(4000); // 1s + 2s + 1s backoff
      });

      await waitFor(() => {
        expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
        expect(retryCount).toBe(4);
      });
    });

    it('should handle rate limiting with backoff', async () => {
      let attemptCount = 0;

      // Mock rate limiting
      mockStudioWalletService.getStudioWallet.mockImplementation(() => {
        attemptCount++;
        if (attemptCount <= 3) {
          return Promise.reject({
            status: 429,
            headers: { 'Retry-After': '2' },
            message: 'Too many requests'
          });
        }
        return Promise.resolve(mockWallet);
      });

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      // Should show rate limit message
      await waitFor(() => {
        expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument();
      });

      // Should wait for retry
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
        expect(attemptCount).toBe(4);
      });
    });
  });

  describe('Data Corruption Recovery', () => {
    it('should handle malformed API response', async () => {
      // Mock malformed response
      mockStudioWalletService.getStudioWallet.mockResolvedValue({
        ...mockWallet,
        balance: 'invalid' as any // Should be number
      });

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.getByText('Invalid wallet data')).toBeInTheDocument();
      });

      // Should allow retry
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      // Mock correct response
      mockStudioWalletService.getStudioWallet.mockResolvedValue(mockWallet);

      await waitFor(() => {
        expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
      });
    });

    it('should handle missing nested data', async () => {
      // Mock response with missing nested data
      mockStudioWalletService.getWalletStats.mockResolvedValue({
        ...mockStats,
        topPerformingVideos: null as any // Should be array
      });

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
        expect(screen.queryByText('Sample Video')).not.toBeInTheDocument();
      });
    });

    it('should handle partial data loading', async () => {
      // Mock slow stats loading
      mockStudioWalletService.getStudioWallet.mockResolvedValue(mockWallet);
      mockStudioWalletService.getWalletStats.mockReturnValue(
        new Promise(resolve => setTimeout(() => resolve(mockStats), 2000))
      );

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      // Should show wallet data immediately
      await waitFor(() => {
        expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
        expect(screen.getByText('Loading stats...')).toBeInTheDocument();
      });

      // Stats should load later
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText('Total Views')).toBeInTheDocument();
      });
    });
  });

  describe('User Experience During Errors', () => {
    it('should maintain UI responsiveness during errors', async () => {
      // Mock slow API response
      mockStudioWalletService.getStudioWallet.mockReturnValue(
        new Promise(resolve => setTimeout(() => resolve(mockWallet), 2000))
      );
      mockStudioWalletService.getWalletStats.mockResolvedValue(mockStats);

      const startTime = Date.now();
      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      // UI should remain responsive
      const refreshButton = screen.getByTestId('refresh-button');
      expect(refreshButton).not.toBeDisabled();
      fireEvent.click(refreshButton);

      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(100); // UI responsive

      await waitFor(() => {
        expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
      });
    });

    it('should provide clear error messages with actionable options', async () => {
      mockStudioWalletService.getStudioWallet.mockRejectedValue({ status: 500 });

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
        expect(screen.getByText('Please try again later')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
        expect(screen.getByText('Contact Support')).toBeInTheDocument();
      });
    });

    it('should preserve user input during error recovery', async () => {
      // Mock successful initial load
      mockStudioWalletService.getStudioWallet.mockResolvedValue(mockWallet);
      mockStudioWalletService.getWalletStats.mockResolvedValue(mockStats);

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
      });

      // Open withdrawal modal
      fireEvent.click(screen.getByText('Withdraw Funds'));

      // Fill form
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '1000' } });
      fireEvent.change(screen.getByPlaceholderText('Account Number'), {
        target: { value: '1234567890' }
      });
      fireEvent.change(screen.getByPlaceholderText('Account Holder Name'), {
        target: { value: 'TEST USER' }
      });

      // Mock submission error
      mockWithdrawalService.createWithdrawal.mockRejectedValue({
        status: 500,
        message: 'Service unavailable'
      });

      // Submit
      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      await waitFor(() => {
        expect(screen.getByText('Failed to process withdrawal')).toBeInTheDocument();
      });

      // Should preserve form data
      expect(screen.getByPlaceholderText('0')).toHaveValue('1000');
      expect(screen.getByPlaceholderText('Account Number')).toHaveValue('1234567890');
      expect(screen.getByPlaceholderText('Account Holder Name')).toHaveValue('TEST USER');

      // Should allow quick retry
      mockWithdrawalService.createWithdrawal.mockResolvedValue({
        id: 'withdrawal-1',
        amount: 1000,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });

      fireEvent.click(screen.getByText('Retry'));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(1000);
      });
    });
  });

  describe('Error Recovery Performance', () => {
    it('should handle rapid error recovery without memory leaks', async () => {
      let callCount = 0;

      // Mock alternating success and failure
      mockStudioWalletService.getStudioWallet.mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 0) {
          return Promise.resolve(mockWallet);
        }
        return Promise.reject({ status: 500 });
      });

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      // Perform rapid recovery operations
      for (let i = 0; i < 5; i++) {
        act(() => {
          jest.advanceTimersByTime(1000);
        });

        const retryButton = screen.getByText('Retry');
        fireEvent.click(retryButton);

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Should not have memory issues
      expect(callCount).toBe(10);
    });

    it('should debounce rapid retry attempts', async () => {
      let callCount = 0;

      // Mock always failing service
      mockStudioWalletService.getStudioWallet.mockImplementation(() => {
        callCount++;
        return Promise.reject({ status: 500 });
      });

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      // Rapid retry attempts
      const retryButton = screen.getByText('Retry');
      for (let i = 0; i < 5; i++) {
        fireEvent.click(retryButton);
      }

      // Should not call service more than max retry attempts
      expect(callCount).toBe(4); // Initial + 3 retries
    });
  });
});