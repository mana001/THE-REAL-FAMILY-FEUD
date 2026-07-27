import React from 'react';

interface ButterflyIconProps {
  className?: string;
  size?: number;
}

export const ButterflyIcon: React.FC<ButterflyIconProps> = ({ className = 'w-5 h-5', size }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        {/* Upper Wings Soft Magical Gradient */}
        <linearGradient id="wingGradUpper" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="40%" stopColor="#FBBF24" />
          <stop offset="80%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        {/* Lower Wings Gradient */}
        <linearGradient id="wingGradLower" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Cute Sparkle Glow */}
        <radialGradient id="sparkleGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Cute Curved Antennae with Hearts */}
      <path
        d="M16 13C14.5 8.5 11 5.5 8.5 4.5"
        stroke="url(#wingGradUpper)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="7.5" cy="4" r="1.8" fill="#FBBF24" />

      <path
        d="M16 13C17.5 8.5 21 5.5 23.5 4.5"
        stroke="url(#wingGradUpper)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="24.5" cy="4" r="1.8" fill="#FBBF24" />

      {/* Left Upper Wing - Cuter Heart-Curve */}
      <path
        d="M15.5 14.5C11 8 3 8.5 2.5 14C2 19.5 10.5 21 15.5 16.5Z"
        fill="url(#wingGradUpper)"
        fillOpacity="0.95"
        stroke="#FEF3C7"
        strokeWidth="1"
      />
      {/* Decorative Wing Spots Left */}
      <circle cx="8" cy="13" r="2" fill="#FFFFFF" fillOpacity="0.6" />
      <circle cx="11.5" cy="11.5" r="1" fill="#FFFFFF" fillOpacity="0.8" />

      {/* Right Upper Wing */}
      <path
        d="M16.5 14.5C21 8 29 8.5 29.5 14C30 19.5 21.5 21 16.5 16.5Z"
        fill="url(#wingGradUpper)"
        fillOpacity="0.95"
        stroke="#FEF3C7"
        strokeWidth="1"
      />
      {/* Decorative Wing Spots Right */}
      <circle cx="24" cy="13" r="2" fill="#FFFFFF" fillOpacity="0.6" />
      <circle cx="20.5" cy="11.5" r="1" fill="#FFFFFF" fillOpacity="0.8" />

      {/* Left Lower Wing */}
      <path
        d="M15.5 17C11 18 5 22 7.5 26.5C10 30.5 14.5 24 15.5 19Z"
        fill="url(#wingGradLower)"
        fillOpacity="0.9"
        stroke="#E0F2FE"
        strokeWidth="1"
      />
      <circle cx="10" cy="23.5" r="1.3" fill="#FFFFFF" fillOpacity="0.7" />

      {/* Right Lower Wing */}
      <path
        d="M16.5 17C21 18 27 22 24.5 26.5C22 30.5 17.5 24 16.5 19Z"
        fill="url(#wingGradLower)"
        fillOpacity="0.9"
        stroke="#E0F2FE"
        strokeWidth="1"
      />
      <circle cx="22" cy="23.5" r="1.3" fill="#FFFFFF" fillOpacity="0.7" />

      {/* Central Cute Body */}
      <path
        d="M16 12.5V23"
        stroke="#FEF3C7"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Cute Head */}
      <circle cx="16" cy="12.5" r="2" fill="#FBBF24" stroke="#FFF" strokeWidth="0.8" />

      {/* Floating Magic Sparkle */}
      <path
        d="M16 3L16.6 4.4L18 5L16.6 5.6L16 7L15.4 5.6L14 5L15.4 4.4Z"
        fill="#FDE047"
      />
    </svg>
  );
};
