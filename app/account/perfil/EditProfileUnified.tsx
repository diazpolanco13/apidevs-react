'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Phone, Mail, Send, Globe, Camera, Check, X, Loader2, Edit2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import TimezoneSelect from 'react-timezone-select';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useTradingViewValidation } from '@/hooks/useTradingViewValidation';

interface ProfileData {
  full_name: string;
  tradingview_username: string;
  avatar_url: string;
  phone: string;
  country: string;
  city: string;
  postal_code: string;
  address: string;
  timezone: string;
  telegram_username: string;
}

interface Props {
  userId: string;
  userEmail: string;
  initialData: ProfileData;
}

export default function EditProfileUnified({ userId, userEmail, initialData }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState(initialData.timezone || 'America/New_York');
  const [tvUsername, setTvUsername] = useState(initialData.tradingview_username);
  const [isEditingTv, setIsEditingTv] = useState(false);
  const [tempTvUsername, setTempTvUsername] = useState(initialData.tradingview_username);
  
  const { isValidating, validationResult, validateUsername, resetValidation } = useTradingViewValidation();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (validationResult?.isValid && validationResult.profileImage) {
      setFormData(prev => ({ ...prev, avatar_url: validationResult.profileImage || '' }));
    }
  }, [validationResult]);

  // Cleanup del debounce timer al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Mapear nombre de país a código ISO para PhoneInput
  const getCountryCode = (countryName: string): string | undefined => {
    const countryMap: { [key: string]: string } = {
      'Venezuela': 'VE',
      'United States': 'US',
      'Estados Unidos': 'US',
      'España': 'ES',
      'Spain': 'ES',
      'México': 'MX',
      'Mexico': 'MX',
      'Colombia': 'CO',
      'Argentina': 'AR',
      'Chile': 'CL',
      'Perú': 'PE',
      'Peru': 'PE',
      'Ecuador': 'EC',
      'Uruguay': 'UY',
      'Paraguay': 'PY',
      'Bolivia': 'BO',
      'Panamá': 'PA',
      'Panama': 'PA',
      'Costa Rica': 'CR',
      'República Dominicana': 'DO',
      'Dominican Republic': 'DO'
    };
    return countryMap[countryName];
  };

  const handleTvUsernameChange = (value: string) => {
    setTempTvUsername(value);
    
    // Limpiar el timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Si es muy corto, resetear validación
    if (value.length < 3) {
      resetValidation();
      return;
    }
    
    // Esperar 1.2 segundos antes de validar (darle chance al usuario de escribir)
    debounceTimerRef.current = setTimeout(() => {
      validateUsername(value);
    }, 1200);
  };

  const handleEditTv = () => {
    setIsEditingTv(true);
    setTempTvUsername(tvUsername);
    resetValidation();
  };

  const handleCancelEditTv = () => {
    setIsEditingTv(false);
    setTempTvUsername(tvUsername);
    resetValidation();
  };

  const handleSaveTv = async () => {
    if (!validationResult?.isValid) {
      setMessage({ type: 'error', text: 'Debes validar el nuevo username antes de guardarlo' });
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const updateData = {
        tradingview_username: validationResult.username,
        avatar_url: validationResult.profileImage || formData.avatar_url
      };
      
      const { error } = await (supabase as any)
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      // Actualizar estados locales
      setTvUsername(validationResult.username || '');
      setFormData(prev => ({ 
        ...prev, 
        tradingview_username: validationResult.username || '',
        avatar_url: validationResult.profileImage || prev.avatar_url
      }));
      setIsEditingTv(false);
      setMessage({ type: 'success', text: '¡Username de TradingView actualizado exitosamente!' });
      
      // Refrescar el navbar para mostrar la nueva imagen
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error al actualizar el username de TradingView' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si está editando TradingView, debe guardar esos cambios primero
    if (isEditingTv) {
      setMessage({ type: 'error', text: 'Debes guardar o cancelar los cambios de TradingView primero' });
      return;
    }

    // Validar teléfono si existe
    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      setMessage({ type: 'error', text: 'El número de teléfono no tiene un formato válido' });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const updateData = {
        ...formData,
        tradingview_username: tvUsername,
        timezone: selectedTimezone
      };
      
      const { error } = await (supabase as any)
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      setMessage({ type: 'success', text: '¡Perfil actualizado exitosamente!' });
      
      // Refrescar el navbar para mostrar los cambios
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* TradingView Section - IMPORTANTE */}
      <div className="bg-gradient-to-br from-apidevs-primary/10 to-green-400/10 backdrop-blur-xl border border-apidevs-primary/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <img 
            src="/logos/tradingview-logo.png" 
            alt="TradingView Logo" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h3 className="text-lg font-bold text-white">Cuenta TradingView</h3>
            <p className="text-xs text-gray-400">Necesario para acceso a indicadores</p>
          </div>
        </div>

        <div className="space-y-4">
          {!isEditingTv ? (
            // Modo de solo lectura con botón editar
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username TradingView *
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={tvUsername || ''}
                      readOnly
                      disabled
                      className="w-full px-4 py-3 pr-12 bg-black/30 border border-white/5 rounded-lg text-white cursor-not-allowed"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleEditTv}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                </div>
                <p className="mt-2 text-sm text-green-400">
                  ✓ Usuario verificado durante el registro
                </p>
              </div>

              {/* Foto actual de TradingView */}
              {formData.avatar_url && (
                <div className="flex items-center gap-4 p-4 bg-black/30 rounded-lg">
                  <img
                    src={formData.avatar_url}
                    alt="TradingView Profile"
                    className="w-16 h-16 rounded-full border-2 border-apidevs-primary object-cover"
                  />
                  <div>
                    <p className="text-sm text-white font-medium">Foto de perfil activa</p>
                    <p className="text-xs text-gray-400">Sincronizada desde TradingView</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Modo de edición con validación
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nuevo Username TradingView *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={tempTvUsername}
                    onChange={(e) => handleTvUsernameChange(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-black/50 border border-apidevs-primary/50 rounded-lg text-white placeholder-gray-500 focus:border-apidevs-primary focus:ring-1 focus:ring-apidevs-primary transition-all"
                    placeholder="tu_nuevo_username"
                  />
                  {/* Indicador de validación */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isValidating && (
                      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    )}
                    {!isValidating && validationResult && (
                      <>
                        {validationResult.isValid ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </>
                    )}
                  </div>
                </div>
                {validationResult && !isValidating && (
                  <p className={`mt-2 text-sm ${validationResult.isValid ? 'text-green-400' : 'text-red-400'}`}>
                    {validationResult.isValid 
                      ? `✓ Usuario verificado: @${validationResult.username}` 
                      : validationResult.error || 'Usuario no encontrado'}
                  </p>
                )}
              </div>

              {/* Vista previa de nueva foto */}
              {validationResult?.isValid && validationResult.profileImage && (
                <div className="flex items-center gap-4 p-4 bg-black/30 rounded-lg border border-apidevs-primary/30">
                  <img
                    src={validationResult.profileImage}
                    alt="Nueva foto TradingView"
                    className="w-16 h-16 rounded-full border-2 border-apidevs-primary object-cover"
                  />
                  <div>
                    <p className="text-sm text-white font-medium">Nueva foto detectada</p>
                    <p className="text-xs text-gray-400">Se actualizará al guardar</p>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveTv}
                  disabled={!validationResult?.isValid}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-apidevs-primary to-green-400 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-apidevs-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Guardar Cambio
                </button>
                <button
                  type="button"
                  onClick={handleCancelEditTv}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-all"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Información Personal */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Información Personal</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Nombre Completo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-apidevs-primary focus:ring-1 focus:ring-apidevs-primary transition-all"
              placeholder="Tu nombre completo"
            />
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={userEmail}
              disabled
              className="w-full px-4 py-3 bg-black/30 border border-white/5 rounded-lg text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Teléfono
            </label>
            <div className="phone-input-container">
              <PhoneInput
                placeholder="Ingresa tu número de teléfono"
                value={formData.phone}
                onChange={(value) => handleChange('phone', value || '')}
                defaultCountry={getCountryCode(formData.country) as any}
                international
                countryCallingCodeEditable={false}
                className="w-full"
              />
            </div>
            {formData.phone && !isValidPhoneNumber(formData.phone) && (
              <p className="mt-2 text-sm text-orange-400">
                ⚠️ Formato de teléfono no válido
              </p>
            )}
            {formData.phone && isValidPhoneNumber(formData.phone) && (
              <p className="mt-2 text-sm text-green-400">
                ✓ Número válido
              </p>
            )}
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Globe className="w-4 h-4 inline mr-2" />
              Zona Horaria
            </label>
            <TimezoneSelect
              value={selectedTimezone}
              onChange={(tz: any) => setSelectedTimezone(tz.value)}
              className="timezone-select"
              styles={{
                control: (base: any) => ({
                  ...base,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '0.25rem',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'rgba(201, 217, 46, 0.5)'
                  }
                }),
                menu: (base: any) => ({
                  ...base,
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  zIndex: 9999
                }),
                menuPortal: (base: any) => ({
                  ...base,
                  zIndex: 9999
                }),
                option: (base: any, state: any) => ({
                  ...base,
                  backgroundColor: state.isFocused ? 'rgba(201, 217, 46, 0.2)' : 'transparent',
                  color: 'white',
                  '&:active': {
                    backgroundColor: 'rgba(201, 217, 46, 0.3)'
                  }
                }),
                singleValue: (base: any) => ({
                  ...base,
                  color: 'white'
                }),
                input: (base: any) => ({
                  ...base,
                  color: 'white'
                })
              }}
              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            />
          </div>
        </div>
      </div>

      {/* Redes Sociales */}
      <div className="bg-black/40 backdrop-blur-xl border border-apidevs-primary/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-full flex items-center justify-center">
            <Send className="w-5 h-5 text-black" />
          </div>
          <h3 className="text-lg font-bold text-white">Redes Sociales</h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Telegram */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Send className="w-4 h-4 inline mr-2" />
              Username Telegram
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
              <input
                type="text"
                value={formData.telegram_username}
                onChange={(e) => handleChange('telegram_username', e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-apidevs-primary focus:ring-1 focus:ring-apidevs-primary transition-all"
                placeholder="tu_username"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Para soporte y alertas</p>
          </div>
        </div>
      </div>

      {/* Ubicación */}
      <div className="bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Ubicación</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* País */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              País
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              placeholder="Venezuela"
            />
          </div>

          {/* Ciudad */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ciudad
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              placeholder="Caracas"
            />
          </div>

          {/* Dirección */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              placeholder="Calle, Avenida, Número"
            />
          </div>

          {/* Código Postal */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Código Postal
            </label>
            <input
              type="text"
              value={formData.postal_code}
              onChange={(e) => handleChange('postal_code', e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              placeholder="1234"
            />
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-apidevs-primary to-green-400 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-apidevs-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}

