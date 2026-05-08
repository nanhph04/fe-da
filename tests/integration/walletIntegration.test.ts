import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { StudioWalletFeature } from '@/features/studio-wallet/components/StudioWalletFeature';
import { mockWalletBalanceResponse, mockWalletStatsResponse } from '@/tests/__mocks__/mockWalletData';

// Mock services
jest.mock('@/features/studio-wallet/services/studioWalletService', () => ({
  getWalletBalance: jest.fn(),
  getWalletStats: jest.fn(),
}));

// Mock hooks
jest.mock('@/features/studio-wallet/hooks/useWalletQueries', () => ({
  useWalletBalance: jest.fn(),
  useWalletStats: jest.fn(),
}));

const { getWalletBalance, getWalletStats } = require('@/features/studio-wallet/services/studioWalletService');
const { useWalletBalance, useWalletStats } = require('@/features/studio-wallet/hooks/useWalletQueries');

describe('Wallet Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  describe('Wallet Balance Integration', () => {
    it('should balance display correctly when API succeeds', async () => {
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <StudioWalletFeature />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('wallet-balance')).toHaveTextContent('$1,250.75');
      });
    });

    it('should show error when API fails', async () => {
      getWalletBalance.mockRejectedValue(new Error('API Error'));

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <StudioWalletFeature />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });

    it('should refresh balance on refresh button click', async () => {
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <StudioWalletFeature />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        const refreshButton = screen.getByTestId('refresh-button');
        fireEvent.click(refreshButton);
      });

      expect(getWalletBalance).toHaveBeenCalledTimes(2);
    });
  });

  describe('Data Flow Integration', () => {
    it('should handle concurrent data loading', async () => {
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);

      const startTime = performance.now();
      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <StudioWalletFeature />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('wallet-balance')).toBeInTheDocument();
        expect(screen.getByTestId('wallet-stats')).toBeInTheDocument();
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(2000); // Should load within 2 seconds
    });

    it('should handle cache invalidation', async () => {
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockResolvedValue(mockWalletStatsResponse);

      // Initial load
      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <StudioWalletFeature />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('wallet-balance')).toBeInTheDocument();
      });

      // Simulate data update
      const updatedBalance = { ...mockWalletBalanceResponse.data, balance: 1500.00 };
      getWalletBalance.mockResolvedValue({
        ...mockWalletBalanceResponse,
        data: updatedBalance,
      });

      // Trigger refresh
      const refreshButton = screen.getByTestId('refresh-button');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByTestId('wallet-balance')).toHaveTextContent('$1,500.00');
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle partial data loading', async () => {
      getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
      getWalletStats.mockRejectedValue(new Error('Stats API failed'));

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <StudioWalletFeature />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('wallet-balance')).toBeInTheDocument();
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });

    it('should retry failed requests', async () => {
      getWalletBalance.mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue(mockWalletBalanceResponse);

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <StudioWalletFeature />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('wallet-balance')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Integration', () => {
    it('should redirect when not authenticated', async () => {
      // Mock unauthenticated response
      getWalletBalance.mockResolvedValue({
        success: false,
        code: 401,
        mess: 'Unauthorized',
        data: null,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <StudioWalletFeature />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
      });
    });
  });
});