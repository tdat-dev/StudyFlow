import React, { useState } from 'react';

interface DemoItem {
  id: string;
  title: string;
  description: string;
  type: 'gif' | 'video' | 'interactive';
  src?: string;
  component?: string;
}

const demos: DemoItem[] = [
  {
    id: 'flashcards',
    title: 'Flashcards AI',
    description: 'Xem cách AI tạo flashcard thông minh từ nội dung bạn upload',
    type: 'gif',
    src: '/demos/flashcards-demo.gif',
  },
  {
    id: 'ai-tutor',
    title: 'AI Tutor Chat',
    description: 'Trải nghiệm chat thực tế với AI tutor 24/7',
    type: 'interactive',
    component: 'ChatDemo',
  },
  {
    id: 'pomodoro',
    title: 'Pomodoro Timer',
    description: 'Thử nghiệm timer 25 phút với thông báo thông minh',
    type: 'interactive',
    component: 'TimerDemo',
  },
  {
    id: 'progress',
    title: 'Theo Dõi Tiến Độ',
    description: 'Xem dashboard phân tích chi tiết tiến độ học tập',
    type: 'gif',
    src: '/demos/progress-demo.gif',
  },
];

export function DemoSection() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const renderDemo = (demo: DemoItem) => {
    switch (demo.type) {
      case 'gif':
        return (
          <div className="relative">
            <img
              src={demo.src}
              alt={`${demo.title} Demo`}
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
              <div className="bg-white rounded-full p-3">
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        );

      case 'interactive':
        return (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">
                {demo.id === 'ai-tutor' ? '🤖' : '⏰'}
              </span>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {demo.title}
            </h4>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {demo.description}
            </p>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Thử ngay
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trải nghiệm StudyFlow
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Khám phá các tính năng thông qua demo tương tác
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {demos.map(demo => (
            <div
              key={demo.id}
              className="group cursor-pointer"
              onClick={() =>
                setActiveDemo(activeDemo === demo.id ? null : demo.id)
              }
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {demo.title}
                    </h3>
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                      <span className="text-sm">
                        {activeDemo === demo.id ? '−' : '+'}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {demo.description}
                  </p>
                </div>

                {activeDemo === demo.id && (
                  <div className="px-6 pb-6">{renderDemo(demo)}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            Bắt đầu trải nghiệm miễn phí
          </button>
        </div>
      </div>
    </section>
  );
}
