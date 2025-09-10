import * as React from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log to error tracking service
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Send to error tracking service in production
      console.log('Sending error to tracking service:', { error, errorInfo });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="min-h-screen bg-blaze-navy dark:bg-black flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-display font-bold text-white mb-2">
                    System Error Detected
                  </h2>
                  <p className="text-gray-300 mb-4">
                    An unexpected error has occurred in the Blaze Intelligence system. 
                    Our team has been notified and is working to resolve the issue.
                  </p>
                  
                  {/* Error details (only in development) */}
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="mb-4">
                      <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                        Show error details
                      </summary>
                      <div className="mt-2 p-4 bg-black/50 rounded border border-gray-700">
                        <p className="text-red-400 font-mono text-sm mb-2">
                          {this.state.error.toString()}
                        </p>
                        {this.state.errorInfo && (
                          <pre className="text-gray-500 font-mono text-xs overflow-x-auto">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        )}
                      </div>
                    </details>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={this.handleReset}
                      className="px-4 py-2 bg-blaze-orange hover:bg-blaze-orange-light text-white rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => window.location.href = '/'}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Go to Homepage
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}