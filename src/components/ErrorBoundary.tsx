import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // In production, you would send this to an error reporting service
    // e.g., Sentry, LogRocket, etc.
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertTriangle className="size-6" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-mono text-muted-foreground break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="size-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  If this problem persists, please contact support at{' '}
                  <a 
                    href="mailto:support@wassel.app" 
                    className="text-primary hover:underline"
                  >
                    support@wassel.app
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
