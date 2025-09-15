'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Button from '@/components/ui/Button';
import { User, TrendingUp, Edit3, Check, X } from 'lucide-react';

interface ProfileData {
  full_name: string;
  tradingview_username: string;
}

interface EditProfileFormProps {
  userId: string;
  initialData: ProfileData;
  onUpdate: (newData: ProfileData) => void;
}

export default function EditProfileForm({ userId, initialData, onUpdate }: EditProfileFormProps) {
  const [isEditing, setIsEditing] = useState<'name' | 'tradingview' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [tempData, setTempData] = useState(initialData);
  const [errors, setErrors] = useState<{ name?: string; tradingview?: string }>({});

  // Update internal state when initialData changes
  React.useEffect(() => {
    setFormData(initialData);
    setTempData(initialData);
  }, [initialData]);

  const handleStartEdit = (field: 'name' | 'tradingview') => {
    setIsEditing(field);
    setTempData(formData);
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(null);
    setTempData(formData);
    setErrors({});
  };

  const validateField = (field: 'name' | 'tradingview', value: string): string | null => {
    if (field === 'name') {
      if (!value.trim()) return 'El nombre es requerido';
      if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
      return null;
    }
    
    if (field === 'tradingview') {
      if (!value.trim()) return 'El usuario de TradingView es requerido';
      if (value.trim().length < 3) return 'El usuario debe tener al menos 3 caracteres';
      // Basic validation for TradingView username format
      if (!/^[a-zA-Z0-9_]+$/.test(value.trim())) {
        return 'Solo se permiten letras, números y guiones bajos';
      }
      return null;
    }
    
    return null;
  };

  const handleSave = async () => {
    if (!isEditing) return;

    const field = isEditing;
    const value = field === 'name' ? tempData.full_name : tempData.tradingview_username;
    const error = validateField(field, value);

    if (error) {
      setErrors({ [field]: error });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const supabase = createClient();
      
      const updateData = field === 'name' 
        ? { full_name: tempData.full_name.trim() }
        : { tradingview_username: tempData.tradingview_username.trim() };

      const { error: updateError } = await (supabase as any)
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (updateError) {
        if (updateError.code === '23505' && field === 'tradingview') {
          setErrors({ tradingview: 'Este usuario de TradingView ya está registrado' });
          return;
        }
        throw updateError;
      }

      // Update local state
      setFormData(tempData);
      setIsEditing(null);
      onUpdate(tempData); // Pass updated data to parent component
      
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorField = field === 'name' ? 'name' : 'tradingview';
      setErrors({ [errorField]: 'Error al guardar. Inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: 'name' | 'tradingview', value: string) => {
    if (field === 'name') {
      setTempData(prev => ({ ...prev, full_name: value }));
    } else {
      setTempData(prev => ({ ...prev, tradingview_username: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-3">
      {/* TradingView Username */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-black/30 rounded-2xl space-y-2 sm:space-y-0">
        <div className="flex items-center">
          <TrendingUp className="w-5 h-5 text-apidevs-primary mr-3" />
          <span className="text-gray-300 font-medium">TradingView</span>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          {isEditing === 'tradingview' ? (
            <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-2 w-full">
              <div className="flex flex-col flex-1">
                <input
                  type="text"
                  value={tempData.tradingview_username}
                  onChange={(e) => handleInputChange('tradingview', e.target.value)}
                  className={`px-3 py-2 bg-gray-800 border rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50 ${
                    errors.tradingview ? 'border-red-500' : 'border-gray-600'
                  } w-full sm:min-w-[200px]`}
                  placeholder="usuario_tradingview"
                  disabled={isSubmitting}
                />
                {errors.tradingview && (
                  <span className="text-red-400 text-xs mt-1">{errors.tradingview}</span>
                )}
              </div>
              <div className="flex items-center space-x-2 justify-end sm:justify-start">
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                title="Guardar cambios"
                className="flex items-center justify-center min-w-[44px] h-[44px] bg-gradient-to-r from-apidevs-primary to-green-400 hover:from-green-400 hover:to-apidevs-primary disabled:from-gray-600 disabled:to-gray-700 text-black font-semibold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-110 disabled:hover:scale-100 disabled:cursor-not-allowed border border-green-300/30 hover:border-green-200/50 hover:shadow-apidevs-primary/30"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                ) : (
                  <Check className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                title="Cancelar edición"
                className="flex items-center justify-center min-w-[44px] h-[44px] bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 disabled:opacity-50 text-white rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-110 disabled:hover:scale-100 disabled:cursor-not-allowed border border-gray-500/30 hover:border-gray-400/50 hover:shadow-gray-500/20"
              >
                <X className="w-5 h-5" />
              </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold break-all sm:break-normal">{formData.tradingview_username}</span>
              <button
                onClick={() => handleStartEdit('tradingview')}
                className="p-2 text-gray-400 hover:text-apidevs-primary transition-colors"
                title="Editar usuario de TradingView"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Full Name */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-black/30 rounded-2xl space-y-2 sm:space-y-0">
        <div className="flex items-center">
          <User className="w-5 h-5 text-blue-400 mr-3" />
          <span className="text-gray-300 font-medium">Nombre</span>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          {isEditing === 'name' ? (
            <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-2 w-full">
              <div className="flex flex-col flex-1">
                <input
                  type="text"
                  value={tempData.full_name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`px-3 py-2 bg-gray-800 border rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    errors.name ? 'border-red-500' : 'border-gray-600'
                  } w-full sm:min-w-[200px]`}
                  placeholder="Tu nombre completo"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <span className="text-red-400 text-xs mt-1">{errors.name}</span>
                )}
              </div>
              <div className="flex items-center space-x-2 justify-end sm:justify-start">
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                title="Guardar nombre"
                className="flex items-center justify-center min-w-[44px] h-[44px] bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-110 disabled:hover:scale-100 disabled:cursor-not-allowed border border-blue-400/30 hover:border-cyan-300/50 hover:shadow-blue-500/30"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Check className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                title="Cancelar edición"
                className="flex items-center justify-center min-w-[44px] h-[44px] bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 disabled:opacity-50 text-white rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-110 disabled:hover:scale-100 disabled:cursor-not-allowed border border-gray-500/30 hover:border-gray-400/50 hover:shadow-gray-500/20"
              >
                <X className="w-5 h-5" />
              </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold break-all sm:break-normal">{formData.full_name}</span>
              <button
                onClick={() => handleStartEdit('name')}
                className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                title="Editar nombre"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
