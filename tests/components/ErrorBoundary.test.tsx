/**
 * Error Boundary Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  BasicErrorBoundary,
  EnhancedErrorBoundary,
  WalletErrorFallback,
  TransactionErrorFallback
} from '@/shared/components/ErrorBoundary';

// Mock component that throws an error
const ErrorComponent: React.FC = () => {
  throw new Error('Test error');
};

// Mock component with error on demand
class ErrorOnDemandComponent extends React.Component {
  state = { shouldError: false };

  triggerError = () => {
    this.setState({ shouldError: true });
  };

  render() {
    if (this.state.shouldError) {
      throw new Error('Triggered error');
    }
    return <button onClick={this.triggerError}>Trigger Error</button>;
  }
}

describe('Error Boundary Components', () => {
  describe('BasicErrorBoundary', () => {
    it('should render children normally when no error occurs', () => {
      render(
        <BasicErrorBoundary>
          <div>Normal content</div>
        </BasicErrorBoundary>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });

    it('should catch component errors and show fallback', () => {
      render(
        <BasicErrorBoundary>
          <ErrorComponent />
        </BasicErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Refresh Page')).toBeInTheDocument();
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });

    it('should call onError callback when error occurs', () => {
      const onError = jest.fn();
      const error = new Error('Test error');

      render(
        <BasicErrorBoundary onError={onError}>
          <ErrorComponent />
        </BasicErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(error, expect.any(Object));
    });

    it('should show custom fallback if provided', () => {
      const customFallback = jest.fn(() => <div>Custom Error</div>);
      render(
        <BasicErrorBoundary fallback={customFallback}>
          <ErrorComponent />
        </BasicErrorBoundary>
      );

      expect(screen.getByText('Custom Error')).toBeInTheDocument();
    });
  });

  describe('EnhancedErrorBoundary', () => {
    it('should render children normally when no error occurs', () => {
      render(
        <EnhancedErrorBoundary>
          <div>Normal content</div>
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });

    it('should show loading failed message when error occurs', () => {
      render(
        <EnhancedErrorBoundary>
          <ErrorComponent />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('Loading Failed')).toBeInTheDocument();
      expect(
        screen.getByText(/Failed to load content\. Attempt 1 of 3\./)
      ).toBeInTheDocument();
    });

    it('should retry when retry button is clicked', () => {
      render(
        <EnhancedErrorBoundary>
          <ErrorOnDemandComponent />
        </EnhancedErrorBoundary>
      );

      // Initially shows button
      const button = screen.getByText('Trigger Error');
      fireEvent.click(button);

      // After error, shows retry button
      const retryButton = screen.getByRole('button', { name: /Retry \(1\/3\)/ });
      fireEvent.click(retryButton);

      // Component should be back to normal
      expect(screen.getByText('Trigger Error')).toBeInTheDocument();
    });

  });

  describe('Custom Fallback Components', () => {
    it('should show wallet error fallback', () => {
      render(<WalletErrorFallback error={new Error('Wallet error')} />);

      expect(screen.getByText('Wallet Error')).toBeInTheDocument();
      expect(
        screen.getByText(/We're having trouble loading your wallet information\./)
      ).toBeInTheDocument();
    });

    it('should show transaction error fallback', () => {
      render(<TransactionErrorFallback error={new Error('Transaction error')} />);

      expect(screen.getByText('Transaction Error')).toBeInTheDocument();
      expect(
        screen.getByText(/Failed to load transaction history\./)
      ).toBeInTheDocument();
    });
  });
});
