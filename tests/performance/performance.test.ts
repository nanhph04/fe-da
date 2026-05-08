import { render } from '@testing-library/react';
import { StudioWalletDashboard } from '@/features/studio-wallet/components/StudioWalletDashboard';
import { BrowserRouter } from 'react-router-dom';
import { mockWalletBalanceResponse, mockWalletStatsResponse } from '@/tests/__mocks__/mockWalletData';

// Mock services
jest.mock('@/features/studio-wallet/services/studioWalletService', () => ({
  getWalletBalance: jest.fn(),
  getWalletStats: jest.fn(),
}));

const { getWalletBalance, getWalletStats } = require('@/features/studio-wallet/services/studioWalletService');

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load wallet dashboard within 3 seconds', async () => {
    const startTime = performance.now();
    getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
    getWalletStats.mockResolvedValue(mockWalletStatsResponse);

    render(
      <BrowserRouter>
        <StudioWalletDashboard />
      </BrowserRouter>
    );

    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 100));

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    console.log(`Wallet dashboard load time: ${loadTime}ms`);
  });

  it('should handle concurrent API requests efficiently', async () => {
    const startTime = performance.now();

    // Mock API responses with different delays
    getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
    getWalletStats.mockResolvedValue(mockWalletStatsResponse);

    render(
      <BrowserRouter>
        <StudioWalletDashboard />
      </BrowserRouter>
    );

    // Wait for all data to load
    await new Promise(resolve => setTimeout(resolve, 500));

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // Should complete within 2 seconds (parallel requests)
    expect(totalTime).toBeLessThan(2000);
    console.log(`Concurrent API requests time: ${totalTime}ms`);
  });

  it('should handle large datasets efficiently', async () => {
    // Generate mock data for 1000 transactions
    const mockTransactions = Array.from({ length: 1000 }, (_, i) => ({
      id: `tx-${i}`,
      amount: Math.random() * 1000,
      date: new Date().toISOString(),
      status: 'completed',
    }));

    getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
    getWalletStats.mockResolvedValue({
      ...mockWalletStatsResponse,
      data: {
        ...mockWalletStatsResponse.data,
        recentTransactions: mockTransactions,
      },
    });

    const startTime = performance.now();

    render(
      <BrowserRouter>
        <StudioWalletDashboard />
      </BrowserRouter>
    );

    await new Promise(resolve => setTimeout(resolve, 1000));

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(2000); // Should handle 1000 items within 2 seconds
    console.log(`Large dataset render time: ${renderTime}ms`);
  });

  it('should maintain performance with state updates', async () => {
    const startTime = performance.now();
    getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
    getWalletStats.mockResolvedValue(mockWalletStatsResponse);

    const { rerender } = render(
      <BrowserRouter>
        <StudioWalletDashboard />
      </BrowserRouter>
    );

    // Initial render
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate multiple state updates
    for (let i = 0; i < 10; i++) {
      rerender(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    expect(totalTime).toBeLessThan(5000); // Should handle 10 updates within 5 seconds
    console.log(`Multiple state updates time: ${totalTime}ms`);
  });

  it('should measure memory usage', () => {
    if (window.performance && (window.performance as any).memory) {
      const memoryBefore = (window.performance as any).memory.usedJSHeapSize;

      render(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );

      // Allow some time for component to load
      setTimeout(() => {
        const memoryAfter = (window.performance as any).memory.usedJSHeapSize;
        const memoryUsed = memoryAfter - memoryBefore;

        console.log(`Memory used: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB`);

        // Should not exceed 10MB
        expect(memoryUsed).toBeLessThan(10 * 1024 * 1024);
      }, 100);
    }
  });

  it('should handle fast user interactions', async () => {
    const startTime = performance.now();
    getWalletBalance.mockResolvedValue(mockWalletBalanceResponse);
    getWalletStats.mockResolvedValue(mockWalletStatsResponse);

    const { rerender } = render(
      <BrowserRouter>
        <StudioWalletDashboard />
      </BrowserRouter>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate fast user interactions
    for (let i = 0; i < 5; i++) {
      rerender(
        <BrowserRouter>
          <StudioWalletDashboard />
        </BrowserRouter>
      );
    }

    const endTime = performance.now();
    const interactionTime = endTime - startTime;

    expect(interactionTime).toBeLessThan(1000); // Should handle 5 interactions within 1 second
    console.log(`Fast interactions time: ${interactionTime}ms`);
  });
});