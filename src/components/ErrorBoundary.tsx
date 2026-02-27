import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** Optional label for identifying which boundary caught the error in logs. */
  label?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Generic React error boundary.
 *
 * Catches render-time exceptions in child components and displays a
 * recoverable error panel instead of white-screening the entire app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const label = this.props.label ?? 'ErrorBoundary';
    // Production: replace with a telemetry / structured logging call.
    if (import.meta.env.DEV) {
      console.error(`[${label}]`, error, info.componentStack);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center w-full h-full min-h-[120px] p-6">
          <div className="border border-[var(--destructive)] bg-[var(--surface)] rounded-[var(--radius-md)] p-6 max-w-md shadow-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 bg-[var(--destructive)] rounded-full" />
              <p className="text-[var(--text-xs)] font-semibold text-[var(--destructive)] uppercase tracking-wide">
                Something went wrong
              </p>
            </div>
            <p className="text-[var(--text-sm)] text-[var(--text-muted)] font-mono mb-4 break-words">
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-1.5 text-[var(--text-sm)] font-medium bg-[var(--accent)] text-white rounded-[var(--radius-sm)] hover:bg-[var(--accent-hover)] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
