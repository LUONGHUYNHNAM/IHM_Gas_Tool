import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    console.error('🔴 ErrorBoundary caught an error:', error);
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('🔴 ErrorBoundary componentDidCatch:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      timestamp: new Date().toISOString()
    });

    this.setState({
      error,
      errorInfo
    });

    // Send error to logging service (if available)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you would send this to your logging service
    const errorReport = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      componentStack: errorInfo.componentStack,
      appVersion: '1.0.0'
    };

    console.error('📤 Error report:', JSON.stringify(errorReport, null, 2));
    
    // Example: Send to external service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // }).catch(console.error);
  };

  handleReload = () => {
    console.log('🔄 Reloading application...');
    window.location.reload();
  };

  handleReset = () => {
    console.log('🔄 Resetting error boundary...');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
            <div className="flex items-center mb-6">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">Application Error</h1>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Ứng dụng đã gặp lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ hỗ trợ kỹ thuật.
              </p>
              
              {this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <h3 className="text-red-800 font-medium mb-2">Error Details:</h3>
                  <p className="text-red-700 text-sm font-mono">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                </div>
              )}
              
              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <details className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <summary className="cursor-pointer text-gray-700 font-medium">
                    Stack Trace (Development Only)
                  </summary>
                  <pre className="text-xs text-gray-600 mt-2 overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={this.handleReset}
                className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex items-center bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </button>
              
              <button
                onClick={() => {
                  const errorText = `Error: ${this.state.error?.message}\nStack: ${this.state.error?.stack}`;
                  navigator.clipboard.writeText(errorText);
                  alert('Error details copied to clipboard');
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
              >
                Copy Error
              </button>
            </div>
            
            <div className="mt-6 text-sm text-gray-500">
              <p>Timestamp: {new Date().toISOString()}</p>
              <p>Version: 1.0.0</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 