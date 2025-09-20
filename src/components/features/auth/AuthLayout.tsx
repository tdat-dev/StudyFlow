import React from 'react';
import { BookOpen, MessageCircle, Target } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  type: 'login' | 'register';
}

export function AuthLayout({ children, type }: AuthLayoutProps) {
  const benefits = [
    {
      icon: BookOpen,
      title: "Flashcards AI",
      description: "Học từ vựng thông minh với AI"
    },
    {
      icon: MessageCircle,
      title: "AI Tutor 24/7", 
      description: "Giải đáp mọi thắc mắc học tập"
    },
    {
      icon: Target,
      title: "Theo dõi tiến độ",
      description: "Phân tích và cải thiện hiệu quả"
    }
  ];

  return (
    <div className="w-full min-h-svh bg-gradient-to-br from-indigo-950 via-slate-900 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        {/* Gradient Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-4000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-30 pointer-events-none [background:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      <div className="relative z-10 min-h-svh">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 min-h-svh">
            {/* Desktop Layout - Left Panel */}
            <div className="hidden lg:flex lg:col-span-7 xl:col-span-7 lg:flex-col lg:justify-center">
              <div className="max-w-xl">
                {/* Logo & Branding */}
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-white">StudyFlow</span>
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-4">
                    Học thông minh hơn mỗi ngày 🚀
                  </h1>
                  <p className="text-white/70 text-lg">
                    {type === 'login' 
                      ? 'Chào mừng trở lại! Tiếp tục hành trình học tập của bạn.'
                      : 'Tham gia cùng hàng nghìn học sinh đang học tập hiệu quả hơn.'
                    }
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-6">
                  {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold mb-1 whitespace-normal break-normal">{benefit.title}</h3>
                          <p className="text-white/60 text-sm whitespace-normal break-normal">{benefit.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Form Section - Right Panel */}
            <div className="w-full lg:col-span-5 xl:col-span-5 flex items-center justify-start p-6 lg:p-12 pr-8">
              <div className="w-full max-w-md">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute inset-x-0 bottom-4 text-center hidden md:block">
        <p className="text-xs text-white/60">
          © 2025 StudyFlow · <a href="#" className="hover:text-white/60 transition-colors">Help</a> · <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
        </p>
      </div>
    </div>
  );
}
