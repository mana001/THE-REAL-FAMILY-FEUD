import React from 'react';
import { Shell, Crown, Shield, Castle, Gem } from 'lucide-react';

export interface ElegantIconOption {
  id: string;
  label: string;
  desc: string;
  IconComponent: React.ComponentType<{ className?: string }>;
  gradient: string;
  borderColor: string;
  iconColor: string;
}

export const ELEGANT_FAMILY_ICONS: ElegantIconOption[] = [
  {
    id: 'royal_shell',
    label: 'Royal Shell',
    desc: 'Undertopia Crest',
    IconComponent: Shell,
    gradient: 'from-amber-500 via-yellow-400 to-amber-600',
    borderColor: 'border-amber-300',
    iconColor: 'text-slate-950',
  },
  {
    id: 'monarch_crown',
    label: 'Monarch Crown',
    desc: 'Imperial Regency',
    IconComponent: Crown,
    gradient: 'from-yellow-400 via-amber-300 to-yellow-500',
    borderColor: 'border-yellow-200',
    iconColor: 'text-slate-950',
  },
  {
    id: 'golden_shield',
    label: 'Aegis Shield',
    desc: 'Royal Aegis',
    IconComponent: Shield,
    gradient: 'from-orange-500 via-amber-400 to-yellow-500',
    borderColor: 'border-amber-300',
    iconColor: 'text-slate-950',
  },
  {
    id: 'grand_citadel',
    label: 'Grand Citadel',
    desc: 'Majestic Castle',
    IconComponent: Castle,
    gradient: 'from-blue-600 via-indigo-500 to-blue-700',
    borderColor: 'border-blue-300',
    iconColor: 'text-white',
  },
  {
    id: 'mystic_gem',
    label: 'Imperial Gem',
    desc: 'Celestial Diamond',
    IconComponent: Gem,
    gradient: 'from-emerald-500 via-teal-400 to-cyan-500',
    borderColor: 'border-emerald-300',
    iconColor: 'text-slate-950',
  },
];

interface FamilyIconProps {
  iconKey?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FamilyIcon: React.FC<FamilyIconProps> = ({ iconKey = 'royal_shell', className = '', size = 'md' }) => {
  const match = ELEGANT_FAMILY_ICONS.find((item) => item.id === iconKey) || ELEGANT_FAMILY_ICONS[0];
  const IconComponent = match.IconComponent;

  const sizeClasses = {
    sm: 'w-6 h-6 rounded-lg p-1',
    md: 'w-8 h-8 rounded-xl p-1.5',
    lg: 'w-10 h-10 rounded-xl p-2',
    xl: 'w-14 h-14 rounded-2xl p-3',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5.5 h-5.5',
    xl: 'w-8 h-8',
  };

  // Fallback if iconKey is legacy string or emoji
  if (iconKey && iconKey.length <= 4 && !ELEGANT_FAMILY_ICONS.some((i) => i.id === iconKey)) {
    return <span className={`inline-block ${className}`}>{iconKey}</span>;
  }

  return (
    <div
      className={`inline-flex items-center justify-center bg-gradient-to-br ${match.gradient} border ${match.borderColor} shadow-md shadow-slate-950/60 shrink-0 ${sizeClasses[size]} ${className}`}
    >
      <IconComponent className={`${iconSizes[size]} ${match.iconColor} drop-shadow`} />
    </div>
  );
};
