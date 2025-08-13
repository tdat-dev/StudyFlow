export class AppError extends Error {
  code: string;
  context?: Record<string, any>;
  isOperational: boolean;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', context?: Record<string, any>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.isOperational = true; // Mặc định là lỗi hoạt động (có thể xử lý)
  }

  static isAppError(error: any): error is AppError {
    return error && error.name === 'AppError';
  }

  static from(error: unknown, defaultMessage: string = 'Đã xảy ra lỗi'): AppError {
    if (AppError.isAppError(error)) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(error.message, 'UNKNOWN_ERROR', { originalError: error.name });
    }

    return new AppError(defaultMessage, 'UNKNOWN_ERROR');
  }

  static auth(message: string = 'Xác thực thất bại', context?: Record<string, any>): AppError {
    return new AppError(message, 'AUTH_ERROR', context);
  }

  static network(message: string = 'Lỗi kết nối mạng', context?: Record<string, any>): AppError {
    return new AppError(message, 'NETWORK_ERROR', context);
  }

  static validation(message: string = 'Dữ liệu không hợp lệ', context?: Record<string, any>): AppError {
    return new AppError(message, 'VALIDATION_ERROR', context);
  }

  static notFound(message: string = 'Không tìm thấy tài nguyên', context?: Record<string, any>): AppError {
    return new AppError(message, 'NOT_FOUND', context);
  }

  static server(message: string = 'Lỗi máy chủ', context?: Record<string, any>): AppError {
    return new AppError(message, 'SERVER_ERROR', context);
  }
}

/**
 * Xử lý lỗi tập trung
 */
export function handleError(error: unknown, options?: { showToast?: boolean; logToConsole?: boolean }): AppError {
  const { showToast = false, logToConsole = true } = options || {};
  
  const appError = AppError.from(error);
  
  // Chỉ log trong môi trường development
  if (logToConsole && process.env.NODE_ENV === 'development') {
    console.error('Application error:', appError);
  }
  
  return appError;
}