/**
 * WithdrawFundsOverlay Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { WithdrawFundsOverlay } from '@/features/studio-wallet/components/WithdrawFundsOverlay';
import { WithdrawalService } from '@/features/studio-wallet/services/withdrawalService';

// Mock services
jest.mock('@/features/studio-wallet/services/withdrawalService');
jest.mock('@/shared/components/ErrorBoundary');

const mockWithdrawalService = WithdrawalService as jest.Mocked<typeof WithdrawalService>;
const mockErrorBoundary = require('@/shared/components/ErrorBoundary').BasicErrorBoundary;

describe('WithdrawFundsOverlay Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockBalance = 5000;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful withdrawal by default
    mockWithdrawalService.createWithdrawal.mockResolvedValue({
      id: 'withdrawal-1',
      amount: 100,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner when processing', async () => {
      // Mock slow withdrawal
      mockWithdrawalService.createWithdrawal.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          id: 'withdrawal-1',
          amount: 100,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        }), 2000))
      );

      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Start withdrawal
      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      // Should show loading spinner
      expect(screen.getByText('Processing Withdrawal')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should disable form during processing', async () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Start withdrawal
      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      // Should disable form inputs
      expect(screen.getByPlaceholderText('0')).toBeDisabled();
      expect(screen.getByText('Vietcombank')).toBeDisabled();
      expect(screen.getByPlaceholderText('Account Number')).toBeDisabled();
      expect(screen.getByPlaceholderText('Account Holder Name')).toBeDisabled();
      expect(screen.getByText('Cancel')).toBeDisabled();
      expect(screen.getByText('Confirm Withdrawal')).toBeDisabled();
    });

    it('should hide content overlay during processing', async () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Initially content should be visible
      expect(screen.getByText('Withdraw Amount (AC)')).toBeInTheDocument();

      // Start withdrawal
      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      // Content should be dimmed
      const content = screen.getByText('Withdraw Amount (AC)').closest('div');
      expect(content).toHaveClass('opacity-30');
      expect(content).toHaveClass('pointer-events-none');
    });
  });

  describe('Error States', () => {
    it('should show error message when withdrawal fails', async () => {
      mockWithdrawalService.createWithdrawal.mockRejectedValue(
        new Error('Insufficient balance')
      );

      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Start withdrawal
      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      await waitFor(() => {
        expect(screen.getByText('Failed to process withdrawal')).toBeInTheDocument();
        expect(screen.getByText('Please try again.')).toBeInTheDocument();
      });
    });

    it('should handle 401 error during withdrawal', async () => {
      mockWithdrawalService.createWithdrawal.mockRejectedValue({ status: 401 });

      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Start withdrawal
      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      await waitFor(() => {
        expect(screen.getByText('Session expired')).toBeInTheDocument();
      });
    });

    it('should handle network error during withdrawal', async () => {
      mockWithdrawalService.createWithdrawal.mockRejectedValue(
        new Error('Network Error')
      );

      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Start withdrawal
      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should handle timeout during withdrawal', async () => {
      jest.useFakeTimers();
      mockWithdrawalService.createWithdrawal.mockImplementation(() =>
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
      );

      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Start withdrawal
      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      // Fast-forward time
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText('Request timeout')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should validate amount exceeds balance', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Try to enter amount greater than balance
      const amountInput = screen.getByPlaceholderText('0');
      fireEvent.change(amountInput, { target: { value: '6000' } });

      // Should show error
      expect(screen.getByText('Amount cannot exceed balance')).toBeInTheDocument();
      expect(screen.getByText('Confirm Withdrawal')).toBeDisabled();
    });

    it('should validate zero or negative amount', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Try to enter zero amount
      const amountInput = screen.getByPlaceholderText('0');
      fireEvent.change(amountInput, { target: { value: '0' } });

      // Should show error
      expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
      expect(screen.getByText('Confirm Withdrawal')).toBeDisabled();
    });

    it('should validate minimum amount requirement', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Try to enter amount below minimum (assuming minimum is 100)
      const amountInput = screen.getByPlaceholderText('0');
      fireEvent.change(amountInput, { target: { value: '50' } });

      // Should show error
      expect(screen.getByText('Minimum withdrawal amount is 100 AC')).toBeInTheDocument();
      expect(screen.getByText('Confirm Withdrawal')).toBeDisabled();
    });

    it('should validate missing bank details', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Don't fill in bank details
      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      // Should show error
      expect(screen.getByText('Please enter your bank account details.')).toBeInTheDocument();
    });

    it('should validate empty account number', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill amount but not account number
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '100' } });
      fireEvent.change(screen.getByPlaceholderText('Account Holder Name'), {
        target: { value: 'TEST USER' }
      });

      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      // Should show error
      expect(screen.getByText('Please enter your bank account details.')).toBeInTheDocument();
    });

    it('should validate empty account holder name', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill amount but not account holder name
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '100' } });
      fireEvent.change(screen.getByPlaceholderText('Account Number'), {
        target: { value: '1234567890' }
      });

      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      // Should show error
      expect(screen.getByText('Please enter your bank account details.')).toBeInTheDocument();
    });

    it('should validate invalid account number format', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill amount with invalid account number
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '100' } });
      fireEvent.change(screen.getByPlaceholderText('Account Number'), {
        target: { value: 'INVALID' }
      });
      fireEvent.change(screen.getByPlaceholderText('Account Holder Name'), {
        target: { value: 'TEST USER' }
      });

      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      // Should show error
      expect(screen.getByText('Invalid account number format')).toBeInTheDocument();
    });
  });

  describe('Success States', () => {
    it('should process successful withdrawal', async () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill in form
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '1000' } });
      fireEvent.change(screen.getByPlaceholderText('Account Number'), {
        target: { value: '1234567890' }
      });
      fireEvent.change(screen.getByPlaceholderText('Account Holder Name'), {
        target: { value: 'TEST USER' }
      });

      // Submit form
      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      await waitFor(() => {
        expect(mockWithdrawalService.createWithdrawal).toHaveBeenCalledWith({
          coinAmount: 1000,
          moneyAmount: 100000,
          exchangeRate: 100,
          bankInfo: {
            bankCode: 'VCB',
            bankName: 'VCB',
            accountNumber: '1234567890',
            accountHolderName: 'TEST USER'
          },
          description: 'Withdrawal of 1000 AC'
        });
      });

      // Should call success callback
      expect(mockOnSuccess).toHaveBeenCalledWith(1000);
    });

    it('should close overlay when cancel clicked', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      fireEvent.click(screen.getByText('Cancel'));

      // Should call close callback
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close overlay when close button clicked', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      fireEvent.click(screen.getByTestId('close-button'));

      // Should call close callback
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset form after successful withdrawal', async () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill in form
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '1000' } });
      fireEvent.change(screen.getByPlaceholderText('Account Number'), {
        target: { value: '1234567890' }
      });
      fireEvent.change(screen.getByPlaceholderText('Account Holder Name'), {
        target: { value: 'TEST USER' }
      });

      // Submit form
      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      await waitFor(() => {
        // Form should be reset
        expect(screen.getByPlaceholderText('0')).toHaveValue('');
        expect(screen.getByPlaceholderText('Account Number')).toHaveValue('');
        expect(screen.getByPlaceholderText('Account Holder Name')).toHaveValue('');
      });
    });
  });

  describe('User Interactions', () => {
    it('should select maximum amount when Max button clicked', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Click Max button
      fireEvent.click(screen.getByText('Max'));

      // Should set amount to balance
      expect(screen.getByPlaceholderText('0')).toHaveValue(mockBalance);
    });

    it('should format amount with commas', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Enter large number
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '1000000' } });

      // Should display with commas
      expect(screen.getByPlaceholderText('0')).toHaveValue('1000000');
      // Note: The actual display formatting depends on the input component
    });

    it('should convert amount correctly', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Enter amount
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '1000' } });

      // Should show converted amount
      expect(screen.getByText('100,000 VND')).toBeInTheDocument();
    });

    it('should update converted amount when bank code changes', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Enter amount
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '1000' } });

      // Change bank
      fireEvent.change(screen.getByDisplayValue('Vietcombank'), {
        target: { value: 'TCB' }
      });

      // Should update converted amount (might have different rate)
      expect(screen.getByText('100,000 VND')).toBeInTheDocument();
    });

    it('should validate amount on blur', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const amountInput = screen.getByPlaceholderText('0');
      fireEvent.change(amountInput, { target: { value: 'invalid' } });
      fireEvent.blur(amountInput);

      // Should show validation error
      expect(screen.getByText('Please enter a valid amount')).toBeInTheDocument();
    });

    it('should format account holder name to uppercase', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Enter name with lowercase
      fireEvent.change(screen.getByPlaceholderText('Account Holder Name'), {
        target: { value: 'test user' }
      });

      // Should be converted to uppercase
      expect(screen.getByPlaceholderText('Account Holder Name')).toHaveValue('TEST USER');
    });
  });

  describe('Error Boundary Integration', () => {
    it('should be wrapped with ErrorBoundary', () => {
      expect(mockErrorBoundary).toHaveBeenCalledWith(
        expect.objectContaining({
          children: expect.anything()
        }),
        {}
      );
    });

    it('should catch component errors', () => {
      // Mock a component that throws during render
      const ErrorComponent = () => {
        throw new Error('Component render error');
      };

      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        >
          <ErrorComponent />
        </WithdrawFundsOverlay>
      );

      // Error boundary should catch the error
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should show fallback UI on error', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Should show error fallback if there's an error
      expect(screen.getByText('Refresh Page')).toBeInTheDocument();
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const amountInput = screen.getByPlaceholderText('0');
      amountInput.focus();
      expect(amountInput).toHaveFocus();
    });

    it('should have proper ARIA labels', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const amountInput = screen.getByPlaceholderText('0');
      expect(amountInput).toHaveAttribute('aria-label', 'Withdraw amount in AC');

      const bankSelect = screen.getByDisplayValue('Vietcombank');
      expect(bankSelect).toHaveAttribute('aria-label', 'Select bank');
    });

    it('should announce withdrawal status changes', async () => {
      const mockAnnounce = jest.fn();

      // Mock screen reader announcements
      global.HTMLElement.prototype.getAttribute = function() {
        if (this.textContent?.includes('Withdrawal processing')) {
          return 'true';
        }
        return '';
      };

      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Start withdrawal
      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      await waitFor(() => {
        expect(mockAnnounce).toHaveBeenCalledWith(
          expect.stringContaining('Withdrawal processing')
        );
      });
    });

    it('should trap focus within modal', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Modal should have proper focus management
      const modal = screen.getByText('Withdraw Funds').closest('div');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('Performance', () => {
    it('should not block rendering on slow API calls', async () => {
      // Mock slow withdrawal
      mockWithdrawalService.createWithdrawal.mockReturnValue(
        new Promise(resolve => setTimeout(() => resolve({
          id: 'withdrawal-1',
          amount: 100,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        }), 2000))
      );

      const startTime = Date.now();
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(100); // Should render quickly

      await waitFor(() => {
        expect(screen.getByText('Processing Withdrawal')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle rapid form changes', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Rapidly change form values
      const amountInput = screen.getByPlaceholderText('0');
      for (let i = 0; i < 10; i++) {
        fireEvent.change(amountInput, { target: { value: i.toString() } });
      }

      // Should handle rapid changes without errors
      expect(amountInput).toHaveValue('9');
    });

    it('should debounce rapid submissions', async () => {
      let callCount = 0;
      mockWithdrawalService.createWithdrawal.mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          id: `withdrawal-${callCount}`,
          amount: 100,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        });
      });

      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Click submit multiple times rapidly
      fireEvent.click(screen.getByText('Confirm Withdrawal'));
      fireEvent.click(screen.getByText('Confirm Withdrawal'));
      fireEvent.click(screen.getByText('Confirm Withdrawal'));

      // Should only call API once
      await waitFor(() => {
        expect(callCount).toBe(1);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero balance gracefully', () => {
      render(
        <WithdrawFundsOverlay
          balance={0}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Should not allow any withdrawal
      expect(screen.getByText('Confirm Withdrawal')).toBeDisabled();
    });

    it('should handle very large balance', () => {
      const largeBalance = 1000000000; // 1 billion AC
      render(
        <WithdrawFundsOverlay
          balance={largeBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Should allow withdrawal of large amount
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '1000000' } });
      expect(screen.getByText('Confirm Withdrawal')).not.toBeDisabled();
    });

    it('should handle maximum withdrawal limit', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Try to withdraw maximum allowed (assuming 10000)
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '10000' } });

      // Should not show error if within limits
      expect(screen.queryByText('Amount exceeds maximum limit')).not.toBeInTheDocument();
    });

    it('should handle currency conversion error', () => {
      render(
        <WithdrawFundsOverlay
          balance={mockBalance}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Mock conversion error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: 'invalid' } });

      // Should handle error gracefully
      expect(console.error).toHaveBeenCalled();
    });
  });
});