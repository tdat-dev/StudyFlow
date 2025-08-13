// App constants
export const APP_NAME = 'Ứng dụng Học Tiếng Anh';
export const APP_VERSION = '1.0.0';

// Default values
export const DEFAULT_DAILY_GOAL = 20;
export const DEFAULT_FOCUS_TIME = 25; // minutes
export const DEFAULT_BREAK_TIME = 5; // minutes

// Local storage keys
export const STORAGE_KEYS = {
  HAS_SEEN_ONBOARDING: 'hasSeenOnboarding',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  SETTINGS: '/settings'
};

// API endpoints
export const API_ENDPOINTS = {
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
};

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
  AUTH_FAILED: 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.',
  NETWORK: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
  AI_FAILED: 'Không thể kết nối với dịch vụ AI. Vui lòng thử lại sau.'
};