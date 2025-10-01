'use client';

import { X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  submitText?: string;
  cancelText?: string;
  multiline?: boolean;
  required?: boolean;
}

export default function InputModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  placeholder = 'Escribe aquí...',
  defaultValue = '',
  submitText = 'Enviar',
  cancelText = 'Cancelar',
  multiline = false,
  required = false
}: InputModalProps) {
  
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, defaultValue]);
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (required && !value.trim()) return;
    onSubmit(value);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="
          relative w-full max-w-lg
          bg-gradient-to-br from-gray-900 to-black
          backdrop-blur-xl border border-white/10
          rounded-2xl shadow-2xl
          animate-slide-up
        "
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-gray-400 text-sm">
              {description}
            </p>
          )}
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {multiline ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                required={required}
                rows={4}
                className="
                  w-full px-4 py-3
                  bg-white/5 border border-white/10
                  rounded-xl text-white placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-green-500/50
                  resize-none
                "
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                required={required}
                className="
                  w-full px-4 py-3
                  bg-white/5 border border-white/10
                  rounded-xl text-white placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-green-500/50
                "
              />
            )}
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 px-6 pb-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all font-medium"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={required && !value.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

