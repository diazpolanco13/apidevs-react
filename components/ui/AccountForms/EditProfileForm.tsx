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
    <div className="space-y-4">
      {/* TradingView Username */}
      <div className="flex items-center justify-between p-4 bg-black/30 rounded-2xl">
        <div className="flex items-center">
          <TrendingUp className="w-5 h-5 text-apidevs-primary mr-3" />
          <span className="text-gray-300">TradingView</span>
        </div>
        
        <div className="flex items-center space-x-3">
          {isEditing === 'tradingview' ? (
            <div className="flex items-center space-x-2">
              <div className="flex flex-col">
                <input
                  type="text"
                  value={tempData.tradingview_username}
                  onChange={(e) => handleInputChange('tradingview', e.target.value)}
                  className={`px-3 py-2 bg-gray-800 border rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50 ${
                    errors.tradingview ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="usuario_tradingview"
                  disabled={isSubmitting}
                />
                {errors.tradingview && (
                  <span className="text-red-400 text-xs mt-1">{errors.tradingview}</span>
                )}
              </div>
              <Button
                variant="slim"
                onClick={handleSave}
                loading={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-2xl shadow-lg transition-all transform hover:scale-105"
              >
                <Check className="w-4 h-4" />
              </Button>
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white rounded-2xl shadow-lg transition-all transform hover:scale-105"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold">{formData.tradingview_username}</span>
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
      <div className="flex items-center justify-between p-4 bg-black/30 rounded-2xl">
        <div className="flex items-center">
          <User className="w-5 h-5 text-blue-400 mr-3" />
          <span className="text-gray-300">Nombre</span>
        </div>
        
        <div className="flex items-center space-x-3">
          {isEditing === 'name' ? (
            <div className="flex items-center space-x-2">
              <div className="flex flex-col">
                <input
                  type="text"
                  value={tempData.full_name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`px-3 py-2 bg-gray-800 border rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    errors.name ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Tu nombre completo"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <span className="text-red-400 text-xs mt-1">{errors.name}</span>
                )}
              </div>
              <Button
                variant="slim"
                onClick={handleSave}
                loading={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-2xl shadow-lg transition-all transform hover:scale-105"
              >
                <Check className="w-4 h-4" />
              </Button>
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white rounded-2xl shadow-lg transition-all transform hover:scale-105"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold">{formData.full_name}</span>
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
