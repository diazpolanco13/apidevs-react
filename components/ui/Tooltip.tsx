'use client';

import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  iconSize?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: string;
}

export default function Tooltip({ 
  content, 
  children, 
  showIcon = true, 
  iconSize = 14,
  position = 'top',
  maxWidth = '240px'
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const triggerRect = triggerRef.current.getBoundingClientRect();
      
      // Verificar si el tooltip se sale de la pantalla
      if (position === 'top' && tooltipRect.top < 0) {
        setAdjustedPosition('bottom');
      } else if (position === 'bottom' && tooltipRect.bottom > window.innerHeight) {
        setAdjustedPosition('top');
      } else if (position === 'left' && tooltipRect.left < 0) {
        setAdjustedPosition('right');
      } else if (position === 'right' && tooltipRect.right > window.innerWidth) {
        setAdjustedPosition('left');
      }
    }
  }, [isVisible, position]);

  const getTooltipPositionClasses = () => {
    switch (adjustedPosition) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  const getArrowPositionClasses = () => {
    switch (adjustedPosition) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent';
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent';
      default:
        return 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent';
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center cursor-help"
      >
        {children || (
          showIcon && (
            <Info 
              size={iconSize} 
              className="text-gray-400 hover:text-apidevs-primary transition-colors" 
            />
          )
        )}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-[9999] ${getTooltipPositionClasses()}
            pointer-events-none
          `}
          style={{ maxWidth }}
        >
          {/* Tooltip Content */}
          <div className="relative">
            {/* Glassmorphism container */}
            <div className="relative bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-lg shadow-2xl">
              {/* Content */}
              <div className="px-3 py-2">
                <p className="text-xs text-gray-200 leading-relaxed">
                  {content}
                </p>
              </div>

              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-apidevs-primary/5 to-transparent rounded-lg pointer-events-none" />
            </div>

            {/* Arrow */}
            <div 
              className={`
                absolute w-0 h-0 ${getArrowPositionClasses()}
                border-[6px]
              `}
            />
          </div>

          {/* Animation */}
          <style jsx>{`
            @keyframes tooltipFadeIn {
              from {
                opacity: 0;
                transform: translateY(-4px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            div {
              animation: tooltipFadeIn 0.2s ease-out;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

