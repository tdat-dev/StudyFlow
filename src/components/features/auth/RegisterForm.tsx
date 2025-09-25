import React, { useState } from 'react';
import { Mail, Lock, User, BookOpen } from 'lucide-react';
import { registerWithEmail } from '../../../services/firebase/auth';
import { LoadingButton } from '../../ui/loading-button';
import { PasswordField } from '../../ui/password-field';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface RegisterFormProps {
  onSuccess: () => void;
  onLogin: () => void;
}

export function RegisterForm({ onSuccess, onLogin }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (username.length < 3) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới');
      return;
    }

    setLoading(true);

    try {
      await registerWithEmail(email, password, username);
      onSuccess();
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Email này đã được sử dụng');
      } else {
        setError('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl rounded-2xl p-6 md:p-8 whitespace-normal break-normal">
      {/* Mobile Logo & Header */}
      <div className="lg:hidden text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">StudyFlow</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Tham gia StudyFlow
        </h2>
        <p className="text-white/60">
          Tạo tài khoản để bắt đầu hành trình học tập
        </p>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Đăng ký</h2>
        <p className="text-white/60">Tạo tài khoản mới để bắt đầu học tập</p>
      </div>

      {error && (
        <div
          className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-white font-medium">
            Tên đăng nhập
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
            <Input
              id="username"
              type="text"
              placeholder="Nhập tên đăng nhập của bạn"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="bg-neutral-900/70 border-white/15 text-white placeholder-white/40 focus:ring-2 ring-indigo-500 pl-10 h-11 rounded-lg"
              required
              aria-invalid={error ? 'true' : 'false'}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
            <Input
              id="email"
              type="email"
              placeholder="Email của bạn"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-neutral-900/70 border-white/15 text-white placeholder-white/40 focus:ring-2 ring-indigo-500 pl-10 h-11 rounded-lg"
              required
              aria-invalid={error ? 'true' : 'false'}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white font-medium">
            Mật khẩu
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
            <PasswordField
              id="password"
              placeholder="Mật khẩu của bạn"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-neutral-900/70 border-white/15 text-white placeholder-white/40 focus:ring-2 ring-indigo-500 pl-10 pr-10 h-11 rounded-lg"
              required
              aria-invalid={error ? 'true' : 'false'}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white font-medium">
            Xác nhận mật khẩu
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
            <PasswordField
              id="confirmPassword"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="bg-neutral-900/70 border-white/15 text-white placeholder-white/40 focus:ring-2 ring-indigo-500 pl-10 pr-10 h-11 rounded-lg"
              required
              aria-invalid={error ? 'true' : 'false'}
            />
          </div>
        </div>

        <LoadingButton
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 disabled:opacity-60 h-11 rounded-lg font-semibold transition-all transform hover:shadow-lg active:scale-[0.98]"
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </LoadingButton>
      </form>

      <div className="mt-8 text-center">
        <p className="text-white/60">
          Đã có tài khoản?{' '}
          <button
            type="button"
            onClick={onLogin}
            className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium transition-colors"
          >
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
}
