'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning';
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ message, type = 'error', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300); // Wait for exit animation
  };

  if (!isVisible) return null;

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/50',
      iconColor: 'text-green-400',
      textColor: 'text-green-100'
    },
    error: {
      icon: XCircle,
      bgColor: 'from-red-500/20 to-red-600/20',
      borderColor: 'border-red-500/50',
      iconColor: 'text-red-400',
      textColor: 'text-red-100'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'from-yellow-500/20 to-yellow-600/20',
      borderColor: 'border-yellow-500/50',
      iconColor: 'text-yellow-400',
      textColor: 'text-yellow-100'
    }
  };

  const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[type];

  return (
    <div
      className={`fixed bottom-4 right-4 left-4 sm:left-auto z-[9999] max-w-md mx-auto sm:mx-0 ${
        isExiting ? 'animate-slide-out' : 'animate-slide-in'
      }`}
    >
      <div
        className={`bg-gradient-to-r ${bgColor} backdrop-blur-xl border ${borderColor} rounded-2xl p-4 shadow-2xl`}
        style={{
          boxShadow: type === 'error' 
            ? '0 10px 40px rgba(239, 68, 68, 0.3)' 
            : type === 'success'
            ? '0 10px 40px rgba(34, 197, 94, 0.3)'
            : '0 10px 40px rgba(234, 179, 8, 0.3)'
        }}
      >
        <div className="flex items-start gap-3">
          <div className={`${iconColor} flex-shrink-0 mt-0.5`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className={`${textColor} font-medium text-sm leading-relaxed`}>
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/30 rounded-b-2xl overflow-hidden">
          <div
            className={`h-full ${
              type === 'error' 
                ? 'bg-red-500' 
                : type === 'success' 
                ? 'bg-green-500' 
                : 'bg-yellow-500'
            } animate-progress`}
            style={{
              animationDuration: `${duration}ms`
            }}
          />
        </div>
      </div>
    </div>
  );
}

