import React, { useState } from 'react';
import { Button } from './ui/button';
import { BookOpen, Zap, Loader2, Info } from 'lucide-react';
import { firebase } from '../utils/firebase/client';

interface WelcomeScreenProps {
  onNavigate: (screen: 'login' | 'register' | 'onboarding') => void;
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await firebase.auth.signInWithOAuth({ provider: 'google' });

      if (error) {
        console.error('Google login error:', error);
      }
      // Redirect will happen automatically
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-blue-600 p-4 rounded-2xl mr-3">
            <BookOpen className="h-12 w-12 text-white" />
          </div>
          <div className="bg-yellow-500 p-4 rounded-2xl">
            <Zap className="h-12 w-12 text-white" />
          </div>
        </div>

        <h1 className="mb-4 text-blue-900">
          EnglishMaster
        </h1>

        <p className="text-gray-600 mb-12 text-lg">
          Học tiếng Anh thông minh với AI Coach và flashcards tương tác
        </p>

        <div className="space-y-4">
          <Button 
            onClick={() => onNavigate('login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl"
            disabled={loading}
          >
            Đăng nhập
          </Button>
          
          <Button 
            onClick={() => onNavigate('register')}
            variant="outline"
            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-6 rounded-xl"
            disabled={loading}
          >
            Đăng ký tài khoản
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gradient-to-br from-blue-50 to-yellow-50 px-2 text-muted-foreground">Hoặc</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full py-6 rounded-xl"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" className="mr-2">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Tiếp tục với Google
          </Button>

          <Button
            variant="ghost"
            className="w-full py-6 rounded-xl text-gray-600"
            onClick={() => onNavigate('onboarding')}
          >
            <Info className="h-4 w-4 mr-2" />
            Xem giới thiệu tính năng
          </Button>
        </div>

        <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
            Học thông minh
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            AI hỗ trợ
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Theo dõi tiến trình
          </div>
        </div>
      </div>
    </div>
  );
}