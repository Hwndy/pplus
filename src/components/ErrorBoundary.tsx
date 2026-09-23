import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
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
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('Render error:', error, info.componentStack);
    }
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6" role="alert">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 w-fit rounded-full bg-red-50 p-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This page hit an unexpected problem. Try again, or reload the page if it keeps happening.
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-h-40 overflow-auto rounded bg-muted p-3 text-left text-xs">{error.message}</pre>
          )}
          <div className="mt-5 flex justify-center gap-2">
            <Button variant="outline" onClick={() => this.setState({ error: null })}>Try again</Button>
            <Button onClick={() => window.location.reload()}>Reload page</Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
