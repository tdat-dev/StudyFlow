import React from 'react';
import Button from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';

interface WelcomeScreenProps {
  onNavigate: (screen: 'login' | 'register' | 'onboarding') => void;
}

export default function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  const { signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // Auth context will handle the state update
    } catch (error) {
      // Error is already handled by useAuth
      console.error('Google login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">EA</span>
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Chào mừng</h1>
          <p className="text-gray-600">Học tiếng Anh hiệu quả với AI Coach</p>
        </div>

        <div className="space-y-4">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
            onClick={() => onNavigate('login')}
          >
            Đăng nhập
          </Button>

          <Button
            className="w-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 py-6 text-lg"
            variant="outline"
            onClick={() => onNavigate('register')}
          >
            Đăng ký
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gradient-to-br from-blue-50 to-yellow-50 px-4 text-sm text-gray-500">
                Hoặc
              </span>
            </div>
          </div>

          <Button
            className="w-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 py-6 text-lg flex items-center justify-center gap-2"
            variant="outline"
            onClick={handleGoogleLogin}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="24px"
              height="24px"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            Tiếp tục với Google
          </Button>

          <Button
            className="w-full bg-transparent hover:bg-blue-100 text-blue-600 py-2"
            variant="ghost"
            onClick={() => onNavigate('onboarding')}
          >
            Xem giới thiệu tính năng
          </Button>
        </div>
      </div>
    </div>
  );
}
