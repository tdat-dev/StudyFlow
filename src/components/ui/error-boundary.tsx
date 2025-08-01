import React, { Component, ErrorInfo, ReactNode } from 'react';

// Định nghĩa AppError trực tiếp trong file này để tránh lỗi import
class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    statusCode = 500,
    isOperational = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    
    // Đặt prototype đúng cho việc kiểm tra instanceof
    Object.setPrototypeOf(this, AppError.prototype);
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Component bắt lỗi trong React để ngăn lỗi làm sập toàn bộ ứng dụng
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Ghi log lỗi
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Gọi callback onError nếu được cung cấp
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Gửi lỗi đến dịch vụ theo dõi lỗi trong môi trường production
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render fallback UI nếu được cung cấp
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render UI mặc định khi có lỗi
      const errorMessage = this.state.error ? this.state.error.message : 'Đã xảy ra lỗi không mong muốn.';
      
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 mx-auto mb-4 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-center text-gray-800">Đã xảy ra lỗi</h2>
            <p className="mb-4 text-center text-gray-600">{errorMessage}</p>
            <div className="flex justify-center space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                onClick={() => window.location.href = '/'}
              >
                Về trang chủ
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={this.handleReset}
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}