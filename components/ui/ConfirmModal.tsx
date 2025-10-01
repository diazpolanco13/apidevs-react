'use client';

import { XCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning'
}: ConfirmModalProps) {
  
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const variants = {
    danger: {
      bg: 'from-red-500/10 to-pink-500/10',
      border: 'border-red-500/30',
      icon: <XCircle className="w-12 h-12 text-red-400" />,
      buttonBg: 'bg-red-500 hover:bg-red-600',
      iconBg: 'bg-red-500/20'
    },
    warning: {
      bg: 'from-orange-500/10 to-yellow-500/10',
      border: 'border-orange-500/30',
      icon: <AlertTriangle className="w-12 h-12 text-orange-400" />,
      buttonBg: 'bg-orange-500 hover:bg-orange-600',
      iconBg: 'bg-orange-500/20'
    },
    info: {
      bg: 'from-blue-500/10 to-cyan-500/10',
      border: 'border-blue-500/30',
      icon: <CheckCircle className="w-12 h-12 text-blue-400" />,
      buttonBg: 'bg-blue-500 hover:bg-blue-600',
      iconBg: 'bg-blue-500/20'
    }
  };
  
  const style = variants[variant];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className={`
          relative w-full max-w-md
          bg-gradient-to-br ${style.bg}
          backdrop-blur-xl border ${style.border}
          rounded-2xl shadow-2xl
          animate-slide-up
        `}
      >
        {/* Icon */}
        <div className="flex justify-center pt-8">
          <div className={`p-4 rounded-full ${style.iconBg}`}>
            {style.icon}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            {title}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-3 ${style.buttonBg} text-white rounded-xl transition-all font-medium shadow-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

