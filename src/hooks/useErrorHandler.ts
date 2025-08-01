import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { handleError, AppError } from '../lib/error';

/**
 * Custom hook để xử lý lỗi trong các component React
 * @param options Tùy chọn cấu hình
 * @returns Các hàm và trạng thái để xử lý lỗi
 */
export function useErrorHandler(options?: {
  showToast?: boolean;
  logToConsole?: boolean;
  captureToSentry?: boolean;
}) {
  const {
    showToast = true,
    logToConsole = true,
    captureToSentry = process.env.NODE_ENV === 'production',
  } = options || {};

  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Xử lý lỗi
   * @param err Lỗi cần xử lý
   */
  const handleAppError = useCallback((err: unknown) => {
    const appError = handleError(err);
    setError(appError);

    if (logToConsole) {
      console.error('Application error:', appError);
    }

    if (showToast) {
      toast.error(appError.message);
    }

    if (captureToSentry && !appError.isOperational) {
      // Gửi lỗi đến Sentry hoặc dịch vụ theo dõi lỗi khác
      // Sentry.captureException(appError);
    }

    return appError;
  }, [showToast, logToConsole, captureToSentry]);

  /**
   * Bọc một hàm async với xử lý lỗi và trạng thái loading
   * @param fn Hàm async cần bọc
   * @returns Hàm đã được bọc
   */
  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R | undefined> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await fn(...args);
        return result;
      } catch (err) {
        handleAppError(err);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    };
  }, [handleAppError]);

  /**
   * Xóa lỗi hiện tại
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isLoading,
    handleError: handleAppError,
    withErrorHandling,
    clearError,
  };
}