import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isStaleVersionError, reloadForNewVersion } from '@/lib/appVersion';

interface Props {
  children: ReactNode;
  /** When this value changes (e.g. the page path), a shown error is cleared. */
  resetKey?: string;
}

interface State {
  error: Error | null;
}

/** Catches rendering errors so one broken section never blanks the whole app. */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // The app was redeployed while this tab was open: load the new version.
    if (isStaleVersionError(error) && reloadForNewVersion()) return;
    // eslint-disable-next-line no-console
    console.error('Render error:', error, info.componentStack);
  }

  componentDidUpdate(prev: Props): void {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    const stale = isStaleVersionError(error);
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6" role="alert">
        <div className="max-w-md text-center">
          <div className={`mx-auto mb-4 w-fit rounded-full p-3 ${stale ? 'bg-blue-50' : 'bg-red-50'}`}>
            {stale ? <RefreshCw className="h-6 w-6 text-primary" /> : <AlertTriangle className="h-6 w-6 text-destructive" />}
          </div>
          <h2 className="text-lg font-semibold">{stale ? 'A new version is available' : 'Something went wrong'}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {stale
              ? 'The app was updated while this page was open. Reload to continue with the latest version.'
              : 'This page hit an unexpected problem. Try again, or reload the page if it keeps happening.'}
          </p>
          {!stale && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs text-muted-foreground">Technical details</summary>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs">{error.message}</pre>
            </details>
          )}
          <div className="mt-5 flex justify-center gap-2">
            {!stale && <Button variant="outline" onClick={() => this.setState({ error: null })}>Try again</Button>}
            <Button onClick={() => window.location.reload()}>Reload page</Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
