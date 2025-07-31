import React, { useState } from 'react';
import { Button } from './ui/button';
import { BookOpen, Zap, MessageCircle, Target, ChevronRight, ChevronLeft } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface OnboardingSlide {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides: OnboardingSlide[] = [
    {
      title: "Học từ vựng hiệu quả",
      description: "Học từ vựng thông qua flashcards thông minh, giúp bạn nhớ lâu hơn và hiệu quả hơn.",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "AI Coach hỗ trợ",
      description: "Trò chuyện với AI Coach để giải đáp mọi thắc mắc về ngữ pháp, từ vựng và cách sử dụng.",
      icon: MessageCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Theo dõi thói quen",
      description: "Xây dựng thói quen học tập đều đặn với hệ thống theo dõi streak và nhắc nhở thông minh.",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Học mọi lúc, mọi nơi",
      description: "Ứng dụng được thiết kế để bạn có thể học tiếng Anh mọi lúc, mọi nơi, chỉ với vài phút mỗi ngày.",
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const isLastSlide = currentSlide === slides.length - 1;
  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex flex-col items-center justify-between p-6">
      {/* Skip button */}
      <div className="w-full flex justify-end">
        <Button 
          variant="ghost" 
          onClick={onComplete}
          className="text-gray-500"
        >
          Bỏ qua
        </Button>
      </div>
      
      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md text-center px-4">
        <div className={`w-32 h-32 rounded-3xl ${currentSlideData.bgColor} flex items-center justify-center mb-8`}>
          <currentSlideData.icon className={`h-16 w-16 ${currentSlideData.color}`} />
        </div>
        
        <h1 className="text-blue-900 mb-4 text-2xl font-bold">
          {currentSlideData.title}
        </h1>
        
        <p className="text-gray-600 mb-12 text-lg">
          {currentSlideData.description}
        </p>
      </div>
      
      {/* Navigation dots */}
      <div className="flex space-x-2 mb-8">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Navigation buttons */}
      <div className="w-full flex justify-between mb-6">
        {currentSlide > 0 ? (
          <Button 
            variant="outline" 
            onClick={prevSlide}
            className="rounded-xl"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        ) : (
          <div></div> // Empty div for spacing
        )}
        
        <Button 
          onClick={nextSlide}
          className="bg-blue-600 hover:bg-blue-700 rounded-xl"
        >
          {isLastSlide ? 'Bắt đầu' : 'Tiếp tục'}
          {!isLastSlide && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
} 