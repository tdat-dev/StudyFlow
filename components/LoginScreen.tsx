import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { firebase } from '../utils/firebase/client';

interface LoginScreenProps {
  mode: 'login' | 'register';
  onLogin: (userData: any) => void;
  onBack: () => void;
}

export function LoginScreen({ mode, onLogin, onBack }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        // Register new user
        const { data, error: signUpError } = await firebase.auth.signUp(email, password);
        
        if (signUpError) {
          throw new Error(signUpError.message || 'Đăng ký thất bại');
        }

        if (data.user) {
          // Create user profile
          await firebase.firestore.updateProfile(data.user.uid, {
            name,
          email,
            streak: 0,
            todayProgress: 0,
            dailyGoal: 20,
            totalWordsLearned: 0,
            createdAt: new Date()
          });

          // Get token for authentication
          const token = await data.user.getIdToken();
          
          // Return user data
          onLogin({
            name,
            email,
            accessToken: token,
            streak: 0,
            todayProgress: 0,
            dailyGoal: 20,
            totalWordsLearned: 0
          });
        }
      } else {
        // Login existing user
        const { data, error: signInError } = await firebase.auth.signInWithPassword(email, password);

        if (signInError) {
          throw new Error(signInError.message || 'Đăng nhập thất bại');
        }

        if (data.session) {
          // Get user profile
          const userId = data.session.user.uid;
          const { profile, error: profileError } = await firebase.firestore.getProfile(userId);

          if (profile) {
            onLogin({ ...profile, accessToken: data.session.access_token });
          } else {
            // Fallback if profile not found
            onLogin({ 
              name: email.split('@')[0], 
              email, 
              accessToken: data.session.access_token,
              streak: 0,
              todayProgress: 0,
              dailyGoal: 20,
              totalWordsLearned: 0
            });
          }
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await firebase.auth.signInWithOAuth({ provider: 'google' });

      if (error) {
        throw new Error(error.message);
      }

      // The OAuth flow will redirect, so we don't need to handle success here
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Đăng nhập Google thất bại');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex flex-col p-6">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="self-start mb-4 text-blue-600"
        disabled={loading}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>

      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-blue-900">
              {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' 
                ? 'Chào mừng bạn quay trở lại!' 
                : 'Tạo tài khoản mới để bắt đầu học'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl"
                    required
                    disabled={loading}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl"
                  required
                  disabled={loading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 py-6 rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {mode === 'login' ? 'Đang đăng nhập...' : 'Đang đăng ký...'}
                  </>
                ) : (
                  mode === 'login' ? 'Đăng nhập' : 'Đăng ký'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Hoặc</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full py-6 rounded-xl"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" className="mr-2">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Tiếp tục với Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}