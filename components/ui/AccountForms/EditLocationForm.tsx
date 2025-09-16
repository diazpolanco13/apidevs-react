'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Button from '@/components/ui/Button';
import { MapPin, Edit3, Check, X, Phone, Mail } from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import moment from 'moment-timezone';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface LocationData {
  country: string;
  city: string;
  phone: string;
  postal_code: string;
  address: string;
  timezone: string;
}

interface EditLocationFormProps {
  userId: string;
  initialData: LocationData;
  onUpdate: (newData: LocationData) => void;
}

export default function EditLocationForm({ userId, initialData, onUpdate }: EditLocationFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [tempData, setTempData] = useState(initialData);
  const [errors, setErrors] = useState<Partial<LocationData>>({});
  
  // Country/State/City data
  const [countries] = useState(() => Country.getAllCountries());
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);

  // Initialize selected country and state based on current data
  useEffect(() => {
    if (tempData.country) {
      const country = countries.find(c => c.name === tempData.country);
      if (country) {
        setSelectedCountry(country);
        const countryStates = State.getStatesOfCountry(country.isoCode);
        setStates(countryStates);
        
        if (tempData.city) {
          const state = countryStates.find(s => {
            const stateCities = City.getCitiesOfState(country.isoCode, s.isoCode);
            return stateCities.some(c => c.name === tempData.city);
          });
          if (state) {
            setSelectedState(state);
            setCities(City.getCitiesOfState(country.isoCode, state.isoCode));
          }
        }
      }
    }
  }, [tempData.country, tempData.city, countries]);

  const handleCountryChange = (countryIso: string) => {
    const country = countries.find(c => c.isoCode === countryIso);
    if (country) {
      setSelectedCountry(country);
      setSelectedState(null);
      setStates(State.getStatesOfCountry(country.isoCode));
      setCities([]);
      
      // Use client-side timezone detection only after mount
      const timezone = typeof window !== 'undefined' ? moment.tz.guess() || 'UTC' : 'UTC';
      
      setTempData(prev => ({
        ...prev,
        country: country.name,
        city: '',
        timezone: timezone
      }));
    }
  };

  const handleStateChange = (stateIso: string) => {
    if (selectedCountry) {
      const state = states.find(s => s.isoCode === stateIso);
      if (state) {
        setSelectedState(state);
        const stateCities = City.getCitiesOfState(selectedCountry.isoCode, state.isoCode);
        setCities(stateCities);
      }
    }
  };

  const handleCityChange = (cityName: string) => {
    setTempData(prev => ({ ...prev, city: cityName }));
  };

  const validateData = (): boolean => {
    const newErrors: Partial<LocationData> = {};

    if (!tempData.country.trim()) {
      newErrors.country = 'El país es requerido';
    }
    
    if (!tempData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    if (tempData.phone && !isValidPhoneNumber(tempData.phone)) {
      newErrors.phone = 'El número de teléfono no es válido';
    }

    if (tempData.postal_code && !/^[\w\s\-]+$/.test(tempData.postal_code)) {
      newErrors.postal_code = 'Formato de código postal inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setTempData(formData);
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempData(formData);
    setErrors({});
  };

  const handleSave = async () => {
    if (!validateData()) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      
      const { error } = (await (supabase as any)
        .from('users')
        .update({
          country: tempData.country.trim(),
          city: tempData.city.trim(),
          phone: tempData.phone.trim() || null,
          postal_code: tempData.postal_code.trim() || null,
          address: tempData.address.trim() || null,
          timezone: tempData.timezone || 'UTC'
        })
        .eq('id', userId));

      if (error) throw error;

      // Update local state
      setFormData(tempData);
      setIsEditing(false);
      onUpdate(tempData); // Notify parent component
      
    } catch (error) {
      console.error('Error updating location:', error);
      setErrors({ country: 'Error al guardar. Inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LocationData, value: string) => {
    setTempData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Información de Ubicación</h3>
          <button
            onClick={handleStartEdit}
            className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
            title="Editar ubicación"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-black/30 rounded-2xl">
            <span className="text-gray-300 text-sm">País</span>
            <span className="text-white font-medium">{formData.country}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-black/30 rounded-2xl">
            <span className="text-gray-300 text-sm">Ciudad</span>
            <span className="text-white font-medium">{formData.city}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-black/30 rounded-2xl">
            <span className="text-gray-300 text-sm">Teléfono</span>
            <span className="text-white font-medium">{formData.phone || 'No registrado'}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-black/30 rounded-2xl">
            <span className="text-gray-300 text-sm">Código Postal</span>
            <span className="text-white font-medium">{formData.postal_code || 'No registrado'}</span>
          </div>
        </div>

        {formData.address && (
          <div className="flex items-center justify-between p-3 bg-black/30 rounded-2xl">
            <span className="text-gray-300 text-sm">Dirección</span>
            <span className="text-white font-medium">{formData.address}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Editar Ubicación</h3>
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            title="Guardar ubicación"
            className="flex items-center justify-center px-6 py-3 min-h-[44px] bg-gradient-to-r from-purple-600 to-pink-500 hover:from-pink-500 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-110 disabled:hover:scale-100 disabled:cursor-not-allowed border border-purple-400/30 hover:border-pink-300/50 hover:shadow-purple-500/30"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
            ) : (
              <Check className="w-5 h-5 mr-2" />
            )}
            Guardar
          </button>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            title="Cancelar edición"
            className="flex items-center justify-center px-6 py-3 min-h-[44px] bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 disabled:opacity-50 text-white font-semibold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-110 disabled:hover:scale-100 disabled:cursor-not-allowed border border-gray-500/30 hover:border-gray-400/50 hover:shadow-gray-500/20"
          >
            <X className="w-5 h-5 mr-2" />
            Cancelar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">País *</label>
          <select
            value={selectedCountry?.isoCode || ''}
            onChange={(e) => handleCountryChange(e.target.value)}
            title="Seleccionar país"
            className={`w-full p-3 bg-gray-800 border rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
              errors.country ? 'border-red-500' : 'border-gray-600'
            }`}
            disabled={isSubmitting}
          >
            <option value="">Selecciona un país</option>
            {countries.map(country => (
              <option key={country.isoCode} value={country.isoCode}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <span className="text-red-400 text-xs mt-1">{errors.country}</span>
          )}
        </div>

        {/* State (if available) */}
        {states.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Estado/Provincia</label>
            <select
              value={selectedState?.isoCode || ''}
              onChange={(e) => handleStateChange(e.target.value)}
              title="Seleccionar estado o provincia"
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              disabled={isSubmitting}
            >
              <option value="">Selecciona estado/provincia</option>
              {states.map(state => (
                <option key={state.isoCode} value={state.isoCode}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Ciudad *</label>
          {cities.length > 0 ? (
            <select
              value={tempData.city}
              onChange={(e) => handleCityChange(e.target.value)}
              title="Seleccionar ciudad"
              className={`w-full p-3 bg-gray-800 border rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                errors.city ? 'border-red-500' : 'border-gray-600'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Selecciona una ciudad</option>
              {cities.map(city => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={tempData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`w-full p-3 bg-gray-800 border rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                errors.city ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Ingresa tu ciudad"
              disabled={isSubmitting}
            />
          )}
          {errors.city && (
            <span className="text-red-400 text-xs mt-1">{errors.city}</span>
          )}
        </div>

        {/* Postal Code - Movido aquí para estar junto a Ciudad */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Código Postal</label>
          <input
            type="text"
            value={tempData.postal_code}
            onChange={(e) => handleInputChange('postal_code', e.target.value)}
            className={`w-full p-3 bg-gray-800 border rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
              errors.postal_code ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="12345"
            disabled={isSubmitting}
          />
          {errors.postal_code && (
            <span className="text-red-400 text-xs mt-1">{errors.postal_code}</span>
          )}
        </div>

        {/* Phone - Ahora ocupa toda la línea */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
          <div className={`phone-input-container ${errors.phone ? 'error' : ''}`}>
            <PhoneInput
              placeholder="Ingresa tu número de teléfono"
              value={tempData.phone}
              onChange={(value) => setTempData(prev => ({ ...prev, phone: value || '' }))}
              defaultCountry={selectedCountry?.isoCode as any}
              international
              countryCallingCodeEditable={false}
              className="w-full"
              disabled={isSubmitting}
            />
          </div>
          {errors.phone && (
            <span className="text-red-400 text-xs mt-1">{errors.phone}</span>
          )}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
          <input
            type="text"
            value={tempData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            placeholder="Calle, número, apartamento..."
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
