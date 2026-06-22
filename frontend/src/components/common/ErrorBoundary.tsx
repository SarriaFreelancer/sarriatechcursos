import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 my-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive space-y-3">
          <h2 className="text-lg font-bold">Algo salió mal</h2>
          <p className="text-sm text-muted-foreground">
            Ocurrió un error inesperado al cargar este componente. Por favor, intenta recargar la página.
          </p>
          {this.state.error && (
            <pre className="p-3 bg-secondary rounded-lg text-xs overflow-auto max-h-40 font-mono text-foreground/80">
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Recargar plataforma
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
