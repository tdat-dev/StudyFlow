/**
 * Lớp xử lý lỗi tùy chỉnh cho ứng dụng
 */
export class AppError extends Error {
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

/**
 * Lớp xử lý lỗi xác thực
 */
export class AuthError extends AppError {
  constructor(message = 'Authentication failed', context?: Record<string, any>) {
    super(message, 401, true, context);
  }
}

/**
 * Lớp xử lý lỗi quyền truy cập
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', context?: Record<string, any>) {
    super(message, 403, true, context);
  }
}

/**
 * Lớp xử lý lỗi không tìm thấy
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', context?: Record<string, any>) {
    super(message, 404, true, context);
  }
}

/**
 * Lớp xử lý lỗi dữ liệu không hợp lệ
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', context?: Record<string, any>) {
    super(message, 400, true, context);
  }
}

/**
 * Xử lý lỗi toàn cục
 * @param error Lỗi cần xử lý
 * @returns Lỗi đã được chuẩn hóa
 */
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  // Xử lý lỗi Firebase
  if (error && typeof error === 'object' && 'code' in error) {
    const firebaseError = error as { code: string; message: string };
    
    // Lỗi xác thực Firebase
    if (firebaseError.code.startsWith('auth/')) {
      return new AuthError(
        getFirebaseAuthErrorMessage(firebaseError.code),
        { originalError: firebaseError }
      );
    }
    
    // Lỗi Firestore
    if (firebaseError.code.startsWith('firestore/')) {
      return new AppError(
        firebaseError.message,
        500,
        true,
        { originalError: firebaseError }
      );
    }
  }
  
  // Lỗi không xác định
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return new AppError(message, 500, false, { originalError: error });
}

/**
 * Chuyển đổi mã lỗi Firebase Auth thành thông báo thân thiện
 * @param code Mã lỗi Firebase Auth
 * @returns Thông báo lỗi thân thiện
 */
function getFirebaseAuthErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'Email đã được sử dụng bởi tài khoản khác.',
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/user-disabled': 'Tài khoản này đã bị vô hiệu hóa.',
    'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
    'auth/wrong-password': 'Mật khẩu không chính xác.',
    'auth/weak-password': 'Mật khẩu không đủ mạnh.',
    'auth/invalid-credential': 'Thông tin đăng nhập không hợp lệ.',
    'auth/operation-not-allowed': 'Phương thức đăng nhập này không được cho phép.',
    'auth/account-exists-with-different-credential': 'Email đã được sử dụng với phương thức đăng nhập khác.',
    'auth/popup-closed-by-user': 'Cửa sổ đăng nhập đã bị đóng.',
    'auth/popup-blocked': 'Cửa sổ đăng nhập bị chặn bởi trình duyệt.',
    'auth/too-many-requests': 'Quá nhiều yêu cầu không thành công. Vui lòng thử lại sau.',
    'auth/network-request-failed': 'Lỗi kết nối mạng.',
    'auth/requires-recent-login': 'Vui lòng đăng nhập lại để thực hiện thao tác này.',
  };
  
  return errorMessages[code] || 'Đã xảy ra lỗi xác thực.';
}