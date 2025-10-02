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
  className?: string;
}

export default function Tooltip({ 
  content, 
  children, 
  showIcon = true, 
  iconSize = 14,
  position = 'top',
  maxWidth = '520px',
  className = ''
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
        return 'bottom-full left-1/2 -translate-x-1/2 mb-3';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-3';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-3';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-3';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-3';
    }
  };

  const getArrowPositionClasses = () => {
    switch (adjustedPosition) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent';
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent';
      default:
        return 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent';
    }
  };

  return (
    <div className="relative inline-flex items-center z-[100]">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center cursor-help relative z-[100]"
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
            absolute ${getTooltipPositionClasses()}
            pointer-events-none
          `}
          style={{ 
            maxWidth,
            zIndex: 99999
          }}
        >
          {/* Tooltip Content */}
          <div className="relative">
            {/* Glassmorphism container */}
            <div className="relative bg-gray-900 border border-gray-600 rounded-lg shadow-2xl min-w-[400px]">
              {/* Content */}
              <div className="px-5 py-3">
                <p className="text-sm text-gray-100 leading-relaxed text-left whitespace-normal">
                  {content}
                </p>
              </div>

              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-apidevs-primary/10 to-transparent rounded-lg pointer-events-none" />
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

