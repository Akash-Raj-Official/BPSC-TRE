import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional label so the message can say which area failed. */
  area?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render-time errors and shows a friendly message.
 *
 * The raw error is logged to the console for developers but never rendered —
 * a candidate mid-examination should not be shown a JavaScript stack trace.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[bpsc-tre] Unhandled UI error', error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <AlertOctagon className="h-10 w-10 text-danger" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold text-ink">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {this.props.area
            ? `We could not display the ${this.props.area}. Your saved answers are untouched.`
            : 'We could not display this page. Your saved answers are untouched.'}{' '}
          Try again, and reload the page if the problem continues.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={this.handleReset} icon={<RotateCcw className="h-4 w-4" />}>
            Try again
          </Button>
          <Button variant="outline" onClick={this.handleReload}>
            Reload page
          </Button>
        </div>
      </div>
    );
  }
}
