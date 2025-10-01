'use client';

import { Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  recommended?: boolean;
  color?: 'green' | 'orange' | 'red' | 'blue' | 'purple';
}

interface SelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  title: string;
  description?: string;
  options: SelectOption[];
}

export default function SelectModal({
  isOpen,
  onClose,
  onSelect,
  title,
  description,
  options
}: SelectModalProps) {
  
  const [selectedValue, setSelectedValue] = useState<string>('');
  
  useEffect(() => {
    if (isOpen) {
      // Auto-select recommended option
      const recommended = options.find(opt => opt.recommended);
      if (recommended) {
        setSelectedValue(recommended.value);
      } else if (options.length > 0) {
        setSelectedValue(options[0].value);
      }
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, options]);
  
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
  
  const handleSelect = () => {
    if (selectedValue) {
      onSelect(selectedValue);
      onClose();
    }
  };
  
  const getColorClasses = (color?: string, isSelected?: boolean) => {
    const colors = {
      green: isSelected 
        ? 'bg-green-500/20 border-green-500/50 ring-2 ring-green-500/30' 
        : 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20',
      orange: isSelected 
        ? 'bg-orange-500/20 border-orange-500/50 ring-2 ring-orange-500/30' 
        : 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20',
      red: isSelected 
        ? 'bg-red-500/20 border-red-500/50 ring-2 ring-red-500/30' 
        : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20',
      blue: isSelected 
        ? 'bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-500/30' 
        : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20',
      purple: isSelected 
        ? 'bg-purple-500/20 border-purple-500/50 ring-2 ring-purple-500/30' 
        : 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20'
    };
    
    return colors[color as keyof typeof colors] || (isSelected 
      ? 'bg-white/20 border-white/50 ring-2 ring-white/30' 
      : 'bg-white/5 border-white/20 hover:bg-white/10');
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="
          relative w-full max-w-2xl
          bg-gradient-to-br from-gray-900 to-black
          backdrop-blur-xl border border-white/10
          rounded-2xl shadow-2xl
          animate-slide-up
        "
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10 z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white mb-2 pr-8">
            {title}
          </h3>
          {description && (
            <p className="text-gray-400 text-sm">
              {description}
            </p>
          )}
        </div>
        
        {/* Options */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedValue(option.value)}
              className={`
                w-full text-left p-4 rounded-xl border
                transition-all
                ${getColorClasses(option.color, selectedValue === option.value)}
              `}
            >
              <div className="flex items-start gap-3">
                {/* Radio indicator */}
                <div className={`
                  flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5
                  flex items-center justify-center
                  ${selectedValue === option.value 
                    ? 'border-green-500 bg-green-500' 
                    : 'border-gray-500'
                  }
                `}>
                  {selectedValue === option.value && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold">
                      {option.label}
                    </span>
                    {option.recommended && (
                      <span className="px-2 py-0.5 bg-green-500/30 text-green-400 text-xs font-medium rounded-full border border-green-500/50">
                        Recomendado
                      </span>
                    )}
                  </div>
                  {option.description && (
                    <p className="text-sm text-gray-400">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6 border-t border-white/10 pt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedValue}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

