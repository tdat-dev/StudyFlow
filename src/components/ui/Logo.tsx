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
    small: { width: 32, height: 32, textSize: 'text-lg' },
    medium: { width: 40, height: 40, textSize: 'text-xl' },
    large: { width: 56, height: 56, textSize: 'text-2xl' },
    xlarge: { width: 80, height: 80, textSize: 'text-3xl' },
    xxlarge: { width: 120, height: 120, textSize: 'text-4xl' },
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
        <span
          className={`font-bold ${textSize}`}
          style={{ color: 'var(--app-text)' }}
        >
          StudyFlow
        </span>
      )}
    </div>
  );
};

export default Logo;
