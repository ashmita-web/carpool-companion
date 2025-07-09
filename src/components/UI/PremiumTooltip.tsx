import React, { useState } from 'react';
import { Crown, Lock } from 'lucide-react';

interface PremiumTooltipProps {
  children: React.ReactNode;
  message?: string;
}

export default function PremiumTooltip({ 
  children, 
  message = "Premium Only - Upgrade to access this feature" 
}: PremiumTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="opacity-50 cursor-not-allowed"
      >
        {children}
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
            <div className="flex items-center space-x-1">
              <Crown className="w-3 h-3 text-yellow-400" />
              <span>{message}</span>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}