import React, { useState } from "react";
import { Mail, Lock, BookOpen } from "lucide-react";
import {
  loginWithEmail,
  loginWithGoogle,
} from "../../../services/firebase/auth";
import { LoadingButton } from "../../ui/loading-button";
import { PasswordField } from "../../ui/password-field";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

interface LoginFormProps {
  onSuccess: () => void;
  onRegister: () => void;
  onForgotPassword: () => void;
}

export function LoginForm({
  onSuccess,
  onRegister,
  onForgotPassword,
}: LoginFormProps) {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginWithEmail(loginInput, password);
      onSuccess();
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
        setError("Tên đăng nhập/Email hoặc mật khẩu không chính xác");
      } else if (error.message === "auth/user-not-found") {
        setError("Tên đăng nhập không tồn tại");
      } else {
        setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await loginWithGoogle();
      onSuccess();
    } catch (error: any) {
      setError("Đã xảy ra lỗi khi đăng nhập với Google. Vui lòng thử lại sau.");
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
            Chào mừng trở lại
          </h2>
          <p className="text-white/60">
            Đăng nhập để tiếp tục hành trình học tập
          </p>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Đăng nhập
          </h2>
          <p className="text-white/60">
            Nhập thông tin để truy cập tài khoản
          </p>
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

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="loginInput" className="text-white font-medium">Tên đăng nhập hoặc Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
              <Input
                id="loginInput"
                type="text"
                placeholder="Nhập tên đăng nhập hoặc email"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                className="bg-neutral-900/70 border-white/15 text-white placeholder-white/40 focus:ring-2 ring-indigo-500 pl-10 h-11 rounded-lg"
                required
                aria-invalid={error ? "true" : "false"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-white font-medium">Mật khẩu</Label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
              <PasswordField
                id="password"
                placeholder="Mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-neutral-900/70 border-white/15 text-white placeholder-white/40 focus:ring-2 ring-indigo-500 pl-10 pr-10 h-11 rounded-lg"
                required
                aria-invalid={error ? "true" : "false"}
              />
            </div>
          </div>

          <LoadingButton
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 disabled:opacity-60 h-11 rounded-lg font-semibold transition-all transform hover:shadow-lg active:scale-[0.98]"
            loading={loading}
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </LoadingButton>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10"></div>
          <div className="flex justify-center text-sm">
            <span className="px-4 text-white/60 font-medium">
              HOẶC
            </span>
          </div>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <LoadingButton
          type="button"
          variant="outline"
          className="w-full mt-6 bg-white/10 border-white/15 text-white/90 hover:bg-white/20 hover:border-white/30 h-11 rounded-lg font-semibold transition-all transform hover:scale-[0.98] active:scale-95 flex items-center justify-center gap-2"
          onClick={handleGoogleLogin}
          loading={loading}
          disabled={loading}
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path
                fill="#4285F4"
                d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
              />
              <path
                fill="#34A853"
                d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
              />
              <path
                fill="#FBBC05"
                d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
              />
              <path
                fill="#EA4335"
                d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
              />
            </g>
          </svg>
          Đăng nhập với Google
        </LoadingButton>

        <div className="mt-8 text-center">
          <p className="text-white/60">
            Chưa có tài khoản?{" "}
            <button
              type="button"
              onClick={onRegister}
              className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium transition-colors"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
  );
}
