import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    small: { width: 32, height: 32, textSize: 'text-lg' },
    medium: { width: 40, height: 40, textSize: 'text-xl' },
    large: { width: 56, height: 56, textSize: 'text-2xl' },
  };

  const { width, height, textSize } = sizeMap[size];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Image
        src="/images/logo.png"
        alt="StudyFlow Logo"
        width={width}
        height={height}
        className="rounded-none border-0 outline-none ring-0"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
        }}
        priority
      />
      {showText && (
        <span className={`font-bold text-gray-900 dark:text-white ${textSize}`}>
          StudyFlow
        </span>
      )}
    </div>
  );
};

export default Logo;
