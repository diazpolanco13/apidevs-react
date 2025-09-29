'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Button from '@/components/ui/Button';
import { User, TrendingUp, Edit3, Check, X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useTradingViewValidation } from '@/hooks/useTradingViewValidation';

interface ProfileData {
  full_name: string;
  tradingview_username: string;
  avatar_url?: string;
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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // TradingView validation hook
  const { isValidating, validationResult, validateUsername, resetValidation } = useTradingViewValidation();

  // Update internal state when initialData changes
  React.useEffect(() => {
    setFormData(initialData);
    setTempData(initialData);
  }, [initialData]);

  // Ya NO validamos en tiempo real, solo cuando guarda

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
      // Si es TradingView, validar AHORA antes de guardar
      if (field === 'tradingview') {
        const result = await validateUsername(tempData.tradingview_username);
        
        if (!result.isValid) {
          setErrors({ tradingview: result.error || 'El usuario de TradingView no existe' });
          setIsSubmitting(false);
          return;
        }
        
        // Si es válido, guardar la imagen
        if (result.profileImage) {
          setProfileImage(result.profileImage);
        }
        
        // Guardar con username verificado
        const supabase = createClient();
        const { error: updateError } = await (supabase as any)
          .from('users')
          .update({
            tradingview_username: result.username || tempData.tradingview_username.trim(),
            avatar_url: result.profileImage || null
          })
          .eq('id', userId);

        if (updateError) {
          if (updateError.code === '23505') {
            setErrors({ tradingview: 'Este usuario de TradingView ya está registrado' });
            setIsSubmitting(false);
            return;
          }
          throw updateError;
        }
      } else {
        // Si es nombre, guardar directamente
        const supabase = createClient();
        const { error: updateError } = await (supabase as any)
          .from('users')
          .update({ full_name: tempData.full_name.trim() })
          .eq('id', userId);

        if (updateError) {
          throw updateError;
        }
      }

      // Update local state con avatar si es TradingView
      const updatedData = field === 'tradingview' && profileImage
        ? { ...tempData, avatar_url: profileImage }
        : tempData;
      
      setFormData(updatedData);
      setIsEditing(null);
      resetValidation();
      setProfileImage(null);
      
      // Mostrar mensaje de éxito
      if (field === 'tradingview') {
        setSuccessMessage('✓ Usuario de TradingView verificado y guardado correctamente');
      } else {
        setSuccessMessage('✓ Nombre actualizado correctamente');
      }
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      onUpdate(updatedData); // Pass updated data to parent component
      
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
      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="bg-gradient-to-r from-green-500/20 to-apidevs-primary/20 border border-green-500/50 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3 animate-pulse" />
            <span className="text-green-400 font-medium">{successMessage}</span>
          </div>
        </div>
      )}
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
                title={isSubmitting ? "Validando..." : "Guardar cambios"}
                className="flex items-center justify-center min-w-[44px] h-[44px] bg-gradient-to-r from-apidevs-primary to-green-400 hover:from-green-400 hover:to-apidevs-primary disabled:from-gray-600 disabled:to-gray-700 text-black font-semibold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-110 disabled:hover:scale-100 disabled:cursor-not-allowed border border-green-300/30 hover:border-green-200/50 hover:shadow-apidevs-primary/30"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2 px-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Validando...</span>
                  </div>
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
