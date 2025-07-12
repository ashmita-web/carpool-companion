
import { Crown, Shield } from 'lucide-react';

interface PremiumBadgeProps {
  isPremium?: boolean;
  isVerified?: boolean;
  size?: 'sm' | 'md';
  showText?: boolean;
}

export default function PremiumBadge({ 
  isPremium = false, 
  isVerified = false, 
  size = 'sm',
  showText = false 
}: PremiumBadgeProps) {
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  
  return (
    <div className="flex items-center space-x-1">
      {isPremium && (
        <div className="flex items-center">
          <Crown className={`${iconSize} text-yellow-500`} />
          {showText && <span className="text-xs text-yellow-600 ml-1">Premium</span>}
        </div>
      )}
      {isVerified && (
        <div className="flex items-center">
          <Shield className={`${iconSize} text-green-500`} />
          {showText && <span className="text-xs text-green-600 ml-1">Verified</span>}
        </div>
      )}
    </div>
  );
}