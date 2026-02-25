import React from 'react';
import { logger } from '../../utils/logger';

/**
 * Error Boundary Component
 * Catches React rendering errors and displays a user-friendly fallback
 * Prevents entire app from crashing when component fails
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    logger.error('Error caught by boundary:', error);
    logger.error('Error info:', errorInfo);

    // Store error details in state
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
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
      return (
        <div
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 px-4"
          dir="rtl"
        >
          <div className="w-full bg-white rounded-2xl shadow-2xl p-8">
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center text-red-900 mb-2">
              حدث خطأ غير متوقع
            </h1>
            <p className="text-center text-gray-600 text-sm mb-6">
              نعتذر عن الإزعاج. يرجى المحاولة مرة أخرى أو الاتصال بفريق الدعم.
            </p>

            {/* Error Details (Dev Only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <p className="text-xs font-mono text-gray-700 break-words">
                  <strong>Error:</strong> {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs font-bold text-gray-600 cursor-pointer">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-accent transition-colors"
              >
                حاول مرة أخرى
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="w-full bg-gray-200 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-300 transition-colors"
              >
                العودة إلى الصفحة الرئيسية
              </button>
            </div>

            {/* Support Info */}
            <p className="text-center text-xs text-gray-500 mt-6">
              إذا استمرت المشكلة، يرجى التواصل معنا عبر{' '}
              <a
                href="/contact"
                className="text-primary hover:underline font-semibold"
              >
                صفحة التواصل
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
