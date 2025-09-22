import React from 'react';
import {
  BookOpen,
  MessageCircle,
  Target,
  Clock,
  Brain,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface LandingPageProps {
  onShowLogin: () => void;
  onShowRegister: () => void;
}

export function LandingPage({ onShowLogin, onShowRegister }: LandingPageProps) {
  const features = [
    {
      icon: BookOpen,
      title: 'Flashcards Thông Minh',
      description: 'Học từ vựng hiệu quả với AI-powered flashcards',
    },
    {
      icon: MessageCircle,
      title: 'AI Tutor',
      description: 'Chat với AI để giải đáp mọi thắc mắc học tập',
    },
    {
      icon: Target,
      title: 'Theo Dõi Thói Quen',
      description: 'Xây dựng thói quen học tập bền vững',
    },
    {
      icon: Clock,
      title: 'Pomodoro Timer',
      description: 'Tập trung học tập với kỹ thuật Pomodoro',
    },
    {
      icon: Brain,
      title: 'Học Tập Thông Minh',
      description: 'Phân tích tiến độ và đề xuất lộ trình học',
    },
    {
      icon: Zap,
      title: 'Gamification',
      description: 'Kiếm XP, lên level và duy trì streak',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Học sinh' },
    { number: '50K+', label: 'Flashcards' },
    { number: '95%', label: 'Hài lòng' },
    { number: '24/7', label: 'Hỗ trợ' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">StudyFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onShowLogin}
              className="text-white/80 hover:text-white transition-colors"
            >
              Đăng nhập
            </button>
            <button
              onClick={onShowRegister}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-2 rounded-full hover:bg-white/20 transition-all"
            >
              Đăng ký
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Học tập
              <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                {' '}
                thông minh
              </span>
              <br />
              cùng AI
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              StudyFlow giúp bạn học tập hiệu quả hơn với flashcards AI, chatbot
              tutor và theo dõi thói quen học tập thông minh.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onShowRegister}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center justify-center"
              >
                Bắt đầu miễn phí
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={onShowLogin}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all"
              >
                Đã có tài khoản?
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/70">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Sẵn sàng bắt đầu hành trình học tập?
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Tham gia cùng hàng nghìn học sinh đang sử dụng StudyFlow để học
              tập hiệu quả hơn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onShowRegister}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105"
              >
                Tạo tài khoản miễn phí
              </button>
              <button
                onClick={onShowLogin}
                className="text-white/80 hover:text-white transition-colors text-lg"
              >
                Đăng nhập ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
