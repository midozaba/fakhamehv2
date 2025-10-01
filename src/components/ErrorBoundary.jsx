/* eslint-disable no-unused-vars */
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and store in state
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Store error details in state for display
    this.setState({
      error,
      errorInfo
    });

    // TODO: Log to monitoring service (e.g., Sentry, LogRocket, etc.)
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
                We're sorry for the inconvenience. An unexpected error has occurred.
              </p>

              <div className="flex gap-4 justify-center mb-6">
                <button
                  onClick={this.handleReset}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Return to Home
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Reload Page
                </button>
              </div>

              {/* Error details (visible in development) */}
              {import.meta.env.MODE === 'development' && this.state.error && (
                <details className="text-left mt-6 p-4 bg-gray-100 rounded-lg">
                  <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="text-sm text-gray-800 space-y-2">
                    <p className="font-semibold text-red-600">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="mt-2 p-2 bg-white rounded overflow-auto text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
