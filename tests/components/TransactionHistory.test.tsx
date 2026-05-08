/**
 * TransactionHistory Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionHistory } from '@/features/studio-wallet/components/TransactionHistory';
import { TransactionService } from '@/features/studio-wallet/services/transactionService';

// Mock the transaction service
jest.mock('@/features/studio-wallet/services/transactionService');

const mockTransactionService = TransactionService as jest.Mocked<typeof TransactionService>;

// Mock data
const mockTransactions = [
  {
    id: 'tx-1',
    videoId: 'video-1',
    title: 'Sample Video',
    type: 'VIDEO_PURCHASE' as const,
    amount: 100,
    currency: 'AC',
    status: 'COMPLETED' as const,
    createdAt: '2024-01-01T00:00:00Z',
    thumbnail: 'https://example.com/thumbnail.jpg',
    userId: 'user-1',
    userName: 'Test User',
  },
  {
    id: 'tx-2',
    videoId: 'video-2',
    title: 'Another Video',
    type: 'VIDEO_PURCHASE' as const,
    amount: 200,
    currency: 'AC',
    status: 'PENDING' as const,
    createdAt: '2024-01-02T00:00:00Z',
    thumbnail: 'https://example.com/thumbnail2.jpg',
    userId: 'user-2',
    userName: 'Test User 2',
  },
];

describe('TransactionHistory Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTransactionService.getTransactions.mockClear();
  });

  describe('Loading States', () => {
    it('should show loading skeleton when loading', () => {
      render(<TransactionHistory isLoading={true} />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
      expect(screen.queryByText('No transactions found')).not.toBeInTheDocument();
    });

    it('should show loading skeleton on initial load', () => {
      mockTransactionService.getTransactions.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockTransactions), 100))
      );

      render(<TransactionHistory />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    it('should hide loading skeleton when data loads', async () => {
      mockTransactionService.getTransactions.mockResolvedValue(mockTransactions);

      render(<TransactionHistory />);

      await waitFor(() => {
        expect(screen.getByTestId('loading-skeleton')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('should show error message when API fails', async () => {
      mockTransactionService.getTransactions.mockRejectedValue(new Error('API Error'));

      render(<TransactionHistory />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load transactions')).toBeInTheDocument();
        expect(screen.getByText('Please try again later')).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      mockTransactionService.getTransactions.mockRejectedValue(new Error('API Error'));

      render(<TransactionHistory />);

      await waitFor(() => {
        const retryButton = screen.getByText('Retry');
        expect(retryButton).toBeInTheDocument();
      });

      // Retry should be called
      mockTransactionService.getTransactions.mockResolvedValue(mockTransactions);
      fireEvent.click(screen.getByText('Retry'));

      await waitFor(() => {
        expect(screen.getByText('Sample Video')).toBeInTheDocument();
      });
    });

    it('should handle empty state with error', async () => {
      mockTransactionService.getTransactions.mockRejectedValue(new Error('API Error'));

      render(<TransactionHistory />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load transactions')).toBeInTheDocument();
        expect(screen.queryByText('No transactions found')).not.toBeInTheDocument();
      });
    });
  });

  describe('Success States', () => {
    it('should display transactions when data loads successfully', async () => {
      mockTransactionService.getTransactions.mockResolvedValue(mockTransactions);

      render(<TransactionHistory />);

      await waitFor(() => {
        expect(screen.getByText('Sample Video')).toBeInTheDocument();
        expect(screen.getByText('Another Video')).toBeInTheDocument();
        expect(screen.getByText('100 AC')).toBeInTheDocument();
        expect(screen.getByText('200 AC')).toBeInTheDocument();
      });
    });

    it('should show empty state when no transactions', async () => {
      mockTransactionService.getTransactions.mockResolvedValue([]);

      render(<TransactionHistory />);

      await waitFor(() => {
        expect(screen.getByText('No transactions found')).toBeInTheDocument();
        expect(screen.getByText('Your transaction history will appear here')).toBeInTheDocument();
      });
    });

    it('should handle pagination correctly', async () => {
      // Mock paginated response
      const page1 = mockTransactions.slice(0, 1);
      mockTransactionService.getTransactions.mockResolvedValue(page1);

      render(<TransactionHistory />);

      await waitFor(() => {
        expect(screen.getByText('Sample Video')).toBeInTheDocument();
        expect(screen.queryByText('Another Video')).not.toBeInTheDocument();
      });
    });

    it('should handle sorting correctly', () => {
      render(<TransactionHistory />);

      const sortButton = screen.getByText('Sort');
      fireEvent.click(sortButton);

      // Should show sort options
      expect(screen.getByText('Newest first')).toBeInTheDocument();
      expect(screen.getByText('Oldest first')).toBeInTheDocument();
    });

    it('should handle filtering correctly', () => {
      render(<TransactionHistory />);

      const filterButton = screen.getByText('Filter');
      fireEvent.click(filterButton);

      // Should show filter options
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should search transactions correctly', async () => {
      render(<TransactionHistory />);

      const searchInput = screen.getByPlaceholderText('Search transactions...');
      fireEvent.change(searchInput, { target: { value: 'Another' } });

      await waitFor(() => {
        expect(screen.getByText('Another Video')).toBeInTheDocument();
        expect(screen.queryByText('Sample Video')).not.toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should show transaction details on click', async () => {
      mockTransactionService.getTransactions.mockResolvedValue([mockTransactions[0]]);

      render(<TransactionHistory />);

      await waitFor(() => {
        const transactionRow = screen.getByText('Sample Video').closest('div');
        fireEvent.click(transactionRow!);
      });

      // Should show details modal
      expect(screen.getByText('Transaction Details')).toBeInTheDocument();
      expect(screen.getByText('Amount: 100 AC')).toBeInTheDocument();
    });

    it('should export transactions correctly', async () => {
      const mockExport = jest.fn();
      window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

      render(<TransactionHistory />);

      await waitFor(() => {
        const exportButton = screen.getByText('Export');
        fireEvent.click(exportButton);
      });

      expect(mockExport).toHaveBeenCalled();
    });

    it('should handle date range filter', async () => {
      render(<TransactionHistory />);

      const dateRangeButton = screen.getByText('Date Range');
      fireEvent.click(dateRangeButton);

      // Should show date picker
      expect(screen.getByText('Select date range')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<TransactionHistory />);

      const searchInput = screen.getByPlaceholderText('Search transactions...');

      // Should be able to focus with keyboard
      searchInput.focus();
      expect(searchInput).toHaveFocus();
    });

    it('should have ARIA labels for interactive elements', () => {
      render(<TransactionHistory />);

      const searchInput = screen.getByPlaceholderText('Search transactions...');
      expect(searchInput).toHaveAttribute('aria-label', 'Search transactions');
    });

    it('should announce changes to screen readers', () => {
      const mockAnnounce = jest.fn();

      // Mock screen reader announcements
      global.HTMLElement.prototype.getAttribute = function() {
        if (this.textContent === 'Transaction loaded') {
          return 'true';
        }
        return '';
      };

      render(<TransactionHistory />);

      // Should announce when transactions load
      expect(mockAnnounce).toHaveBeenCalled();
    });
  });
});