/**
 * Cấu hình biến môi trường với validation
 */

// Kiểm tra biến môi trường bắt buộc
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

// Kiểm tra các biến môi trường bắt buộc
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    if (typeof window === 'undefined') {
      console.error(`Missing required environment variable: ${envVar}`);
    }
  }
}

export const env = {
  // Firebase config
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
    useEmulator: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
  },
  
  // Gemini API config
  gemini: {
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
    model: process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-pro'
  },
  
  // App config
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Ứng dụng Học Tiếng Anh',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production'
  }
};