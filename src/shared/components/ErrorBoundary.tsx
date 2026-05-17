'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

// Basic Error Boundary - For catching JavaScript errors
interface BasicErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface BasicErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class BasicErrorBoundary extends Component<BasicErrorBoundaryProps, BasicErrorBoundaryState> {
  public state: BasicErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): BasicErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!);
      }

      // Default error UI - Using Cinematic Canvas theme
      return (
        <div className="min-h-screen bg-card flex items-center justify-center p-4">
          <div className="text-center max-w-lg mx-auto">
            <div className="mb-6">
              <div className="text-6xl">⚠️</div>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-4 font-headline">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-6">
              We encountered an unexpected error. Please try again or contact support.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold font-headline text-sm rounded-lg shadow-lg shadow-primary/20 transition-all w-full"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-muted hover:bg-accent text-muted-foreground rounded-lg transition-all w-full"
              >
                Go Back
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-muted rounded-lg p-4 text-sm text-muted-foreground mt-6">
                <summary className="cursor-pointer hover:text-primary">Error details</summary>
                <pre className="mt-2 overflow-auto">
                  <code className="text-red-400 font-mono">{this.state.error.stack}</code>
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Enhanced Error Boundary - With retry functionality
interface EnhancedErrorBoundaryProps extends BasicErrorBoundaryProps {
  maxRetries?: number;
  onRetry?: () => void;
}

interface EnhancedErrorBoundaryState extends BasicErrorBoundaryState {
  retryCount: number;
}

export class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  public state: EnhancedErrorBoundaryState = {
    hasError: false,
    error: null,
    retryCount: 0
  };

  private maxRetries: number;

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.maxRetries = props.maxRetries || 3;
    this.handleRetry = this.handleRetry.bind(this);
  }

  public static getDerivedStateFromError(error: Error): EnhancedErrorBoundaryState {
    return { hasError: true, error, retryCount: 0 };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry() {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prev => ({
        hasError: false,
        error: null,
        retryCount: prev.retryCount + 1
      }));
      if (this.props.onRetry) {
        this.props.onRetry();
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div className="min-h-screen bg-card flex items-center justify-center p-4">
          <div className="text-center max-w-lg mx-auto">
            <div className="mb-6">
              <div className="text-6xl">⚠️</div>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-4 font-headline">
              Loading Failed
            </h2>
            <p className="text-muted-foreground mb-2">
              {canRetry
                ? `Failed to load content. Attempt ${this.state.retryCount + 1} of ${this.maxRetries}.`
                : 'Maximum retry attempts reached.'
              }
            </p>
            {!canRetry && (
              <p className="text-red-400 text-sm mb-4">
                Please refresh the page or try again later.
              </p>
            )}

            {this.props.fallback?.(this.state.error!)}

            {canRetry && !this.props.fallback && (
              <button
                onClick={this.handleRetry}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold font-headline text-sm rounded-lg shadow-lg shadow-primary/20 transition-all w-full mb-3"
              >
                Retry ({this.state.retryCount + 1}/{this.maxRetries})
              </button>
            )}

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-muted hover:bg-accent text-muted-foreground rounded-lg transition-all w-full"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Component-specific Error Boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorType: 'basic' | 'enhanced' = 'basic',
  maxRetries?: number
) {
  return function WrappedComponent(props: P) {
    const errorBoundaryProps = {
      children: <Component {...props} />,
      maxRetries
    };

    switch (errorType) {
      case 'enhanced':
        return <EnhancedErrorBoundary {...errorBoundaryProps} />;
      default:
        return <BasicErrorBoundary {...errorBoundaryProps} />;
    }
  };
}

// Custom fallback components
export const WalletErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen bg-card flex items-center justify-center p-4">
    <div className="text-center max-w-md mx-auto">
      <div className="mb-6">
        <div className="text-6xl">💳</div>
      </div>
      <h2 className="text-2xl font-bold text-primary mb-4 font-headline">
        Wallet Error
      </h2>
      <p className="text-muted-foreground mb-6">
        We&apos;re having trouble loading your wallet information. Please try again.
      </p>
      {error && (
        <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
          <p className="text-red-400 font-mono break-all">{error.message}</p>
        </div>
      )}
    </div>
  </div>
);

export const TransactionErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen bg-card flex items-center justify-center p-4">
    <div className="text-center max-w-md mx-auto">
      <div className="mb-6">
        <div className="text-6xl">📊</div>
      </div>
      <h2 className="text-2xl font-bold text-primary mb-4 font-headline">
        Transaction Error
      </h2>
      <p className="text-muted-foreground mb-6">
        Failed to load transaction history. Please try refreshing.
      </p>
      {error && (
        <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
          <p className="text-red-400 font-mono break-all">{error.message}</p>
        </div>
      )}
    </div>
  </div>
);
