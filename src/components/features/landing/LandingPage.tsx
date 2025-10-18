import React from 'react';
import {
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ChartBarIcon,
  AcademicCapIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const features = [
    {
      icon: BookOpenIcon,
      title: 'Flashcards Thông Minh',
      description:
        'Học từ vựng hiệu quả với hệ thống flashcard được tối ưu hóa bởi AI',
      color: 'blue',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI Tutor 24/7',
      description:
        'Trợ lý học tập thông minh sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi',
      color: 'green',
    },
    {
      icon: ClockIcon,
      title: 'Pomodoro Timer',
      description: 'Quản lý thời gian học tập với kỹ thuật Pomodoro hiệu quả',
      color: 'purple',
    },
    {
      icon: ChartBarIcon,
      title: 'Theo Dõi Tiến Độ',
      description: 'Theo dõi và phân tích tiến độ học tập chi tiết',
      color: 'yellow',
    },
    {
      icon: AcademicCapIcon,
      title: 'Habit Tracker',
      description: 'Xây dựng thói quen học tập bền vững với hệ thống tracking',
      color: 'indigo',
    },
    {
      icon: SparklesIcon,
      title: 'Gamification',
      description: 'Học tập vui vẻ với hệ thống điểm, level và achievement',
      color: 'pink',
    },
  ];

  const testimonials = [
    {
      name: 'Nguyễn Minh Anh',
      role: 'Sinh viên Đại học',
      content:
        'StudyFlow đã giúp tôi cải thiện điểm số đáng kể. AI tutor rất thông minh và dễ sử dụng!',
      rating: 5,
      avatar: '👩‍🎓',
    },
    {
      name: 'Trần Văn Nam',
      role: 'Học sinh THPT',
      content:
        'Flashcard system tuyệt vời! Tôi đã học được 500 từ mới trong 2 tuần.',
      rating: 5,
      avatar: '👨‍🎓',
    },
    {
      name: 'Lê Thị Hoa',
      role: 'Người đi làm',
      content:
        'Pomodoro timer giúp tôi tập trung học tiếng Anh sau giờ làm. Rất hiệu quả!',
      rating: 5,
      avatar: '👩‍💼',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Người dùng tin tưởng' },
    { number: '50,000+', label: 'Từ vựng đã học' },
    { number: '95%', label: 'Tỷ lệ hài lòng' },
    { number: '24/7', label: 'Hỗ trợ AI' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="w-5 h-5 text-white" />
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
                <ArrowRightIcon className="w-5 h-5" />
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

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
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
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon
                    className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`}
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Người dùng nói gì về StudyFlow
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Hàng nghìn người dùng đã tin tưởng và đạt được kết quả học tập tốt
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              <ArrowRightIcon className="w-5 h-5" />
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
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpenIcon className="w-5 h-5 text-white" />
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
