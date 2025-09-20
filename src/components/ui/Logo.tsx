import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    small: { width: 28, height: 28, textSize: 'text-base' },
    medium: { width: 40, height: 40, textSize: 'text-xl' },
    large: { width: 56, height: 56, textSize: 'text-2xl' },
    xlarge: { width: 80, height: 80, textSize: 'text-3xl' },
    xxlarge: { width: 120, height: 120, textSize: 'text-4xl' },
  };

  const { width, height, textSize } = sizeMap[size];
  const src = '/images/logo.png';

  return (
    <div className={`flex items-center space-x-2 ${className}`} aria-label="StudyFlow logo">
      <Image
        src={src}
        alt="StudyFlow Logo"
        width={width}
        height={height}
        priority
        className="rounded-none drop-shadow-sm"
      />
      {showText && (
        <span
          className={`font-semibold ${textSize} tracking-tight leading-none select-none whitespace-nowrap antialiased text-gray-900 dark:text-white`}
        >
          StudyFlow
        </span>
      )}
    </div>
  );
};

export default Logo;
