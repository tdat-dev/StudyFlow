import React from 'react';
import Image from 'next/image';
import { DemoSection } from './DemoSection';

interface SimpleLandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function SimpleLandingPage({
  onGetStarted,
  onLogin,
}: SimpleLandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <Image
                  src="/images/logo-32.png"
                  alt="StudyFlow Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                StudyFlow
              </span>
            </div>
            <button
              onClick={onLogin}
              className="px-6 py-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Logo Section */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/logo-120.png"
                  alt="StudyFlow Logo"
                  width={120}
                  height={120}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Học tập thông minh với{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Nền tảng học tập toàn diện với AI tutor, flashcard thông minh,
              Pomodoro timer và hệ thống theo dõi tiến độ chi tiết
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>Bắt đầu miễn phí</span>
                <span>→</span>
              </button>
              <button className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                Xem demo
              </button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Tất cả công cụ học tập bạn cần trong một nền tảng duy nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Flashcards Thông Minh
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Học từ vựng hiệu quả với hệ thống flashcard được tối ưu hóa bởi
                AI
              </p>
            </div>

            <div className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                AI Tutor 24/7
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Trợ lý học tập thông minh sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi
              </p>
            </div>

            <div className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Pomodoro Timer
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Quản lý thời gian học tập với kỹ thuật Pomodoro hiệu quả
              </p>
            </div>

            <div className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Theo Dõi Tiến Độ
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Theo dõi và phân tích tiến độ học tập chi tiết
              </p>
            </div>

            <div className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Habit Tracker
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Xây dựng thói quen học tập bền vững với hệ thống tracking
              </p>
            </div>

            <div className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Gamification
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Học tập vui vẻ với hệ thống điểm, level và achievement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <DemoSection />

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Sẵn sàng bắt đầu hành trình học tập?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Tham gia cùng hàng nghìn người dùng đang cải thiện kỹ năng học tập
            mỗi ngày
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span>Tạo tài khoản miễn phí</span>
              <span>→</span>
            </button>
            <button className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
              Liên hệ hỗ trợ
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <Image
                    src="/images/logo-32.png"
                    alt="StudyFlow Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-2xl font-bold">StudyFlow</span>
              </div>
              <p className="text-gray-400 mb-4">
                Nền tảng học tập thông minh với AI, giúp bạn đạt được mục tiêu
                học tập một cách hiệu quả và thú vị.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Sản phẩm</h3>
              <ul className="space-y-2 text-gray-400">
                <li>AI Tutor</li>
                <li>Flashcards</li>
                <li>Pomodoro Timer</li>
                <li>Habit Tracker</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Trung tâm trợ giúp</li>
                <li>Liên hệ</li>
                <li>Điều khoản sử dụng</li>
                <li>Chính sách bảo mật</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 StudyFlow. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
