import React from 'react';

interface StudyTubeLogoProps {
  className?: string;
  size?: number;
  variant?: 'icon' | 'full';
  color?: string;
}

export const StudyTubeLogo: React.FC<StudyTubeLogoProps> = ({
  className = '',
  size = 40,
  variant = 'icon',
  color = 'currentColor',
}) => {
  // Stylized Book with Play Button Icon
  const renderIcon = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Back Cover / Pages Outline shadow layers */}
      <path
        d="M14 36.5C14 32.5 16.5 31.5 21 32C28 32.8 45 40 54 44.5V94C45 89 28 82 21 81.2C16.5 80.7 14 78 14 74V36.5Z"
        fill={color}
        opacity="0.15"
      />
      <path
        d="M106 36.5C106 32.5 103.5 31.5 99 32C92 32.8 75 40 66 44.5V94C75 89 92 82 99 81.2C103.5 80.7 106 78 106 74V36.5Z"
        fill={color}
        opacity="0.15"
      />

      {/* Back cover hard-edge outline */}
      <path
        d="M18 34.5C18 31.5 20.5 30.5 24.5 31C32 32 46.5 37.5 54.5 41V93C46.5 89 32 83.5 24.5 82.5C20.5 82 18 79.5 18 76.5V34.5Z"
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M102 34.5C102 31.5 99.5 30.5 95.5 31C88 32 73.5 37.5 65.5 41V93C73.5 89 88 83.5 95.5 82.5C99.5 82 102 79.5 102 76.5V34.5Z"
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Left Page (White shape with transparent Play Button cutout using evenodd fill rule) */}
      <path
        d="M57 93C48 88.5 29 81 23.5 80.2C21 79.8 20 78 20 75.5V31.5C20 28.5 22.5 27.5 26.5 28C34 29 49 35.5 57 39.5V93Z M32 44L50 55L32 66Z"
        fill={color}
        fillRule="evenodd"
      />

      {/* Right Page (White shape) */}
      <path
        d="M63 93C72 88.5 91 81 96.5 80.2C99 79.8 100 78 100 75.5V31.5C100 28.5 97.5 27.5 93.5 28C86 29 71 35.5 63 39.5V93Z"
        fill={color}
      />
    </svg>
  );

  if (variant === 'icon') {
    return renderIcon();
  }

  // Full brand Logo with elegant typography and custom borders
  return (
    <div className={`flex flex-col items-center justify-center text-center p-6 ${className}`}>
      {/* Icon portion */}
      <div className="relative mb-2 flex items-center justify-center">
        {renderIcon()}
      </div>

      {/* Typography */}
      <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-1">
        <span className="font-medium text-slate-100">Study</span>
        <span className="text-white">Tube</span>
      </h1>

      {/* Separators and Subtitle */}
      <div className="w-full max-w-[240px] flex items-center gap-3 mt-2.5 opacity-90">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-slate-400" />
        <span className="text-[10px] font-extrabold tracking-[0.25em] text-slate-300 uppercase whitespace-nowrap">
          Focus. Study. Succeed.
        </span>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-400" />
      </div>
    </div>
  );
};
