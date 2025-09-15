'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { User, TrendingUp, MapPin, Phone, CheckCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface OnboardingProps {
  user: any;
  redirectPath?: string;
}

interface OnboardingData {
  tradingview_username: string;
  full_name: string;
  phone: string;
  country: string;
  city: string;
}

export default function Onboarding({ user, redirectPath = '/account' }: OnboardingProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    tradingview_username: '',
    full_name: '',
    phone: '',
    country: '',
    city: ''
  });

  const [errors, setErrors] = useState<Partial<OnboardingData>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<OnboardingData> = {};

    if (step === 1) {
      if (!formData.tradingview_username.trim()) {
        newErrors.tradingview_username = 'El usuario de TradingView es obligatorio';
      }
      if (!formData.full_name.trim()) {
        newErrors.full_name = 'Tu nombre completo es requerido';
      }
    }

    if (step === 2) {
      if (!formData.country.trim()) {
        newErrors.country = 'El país es requerido';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'La ciudad es requerida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsSubmitting(true);
    
    try {
      const supabase = createClient();
      
      // Update user profile with onboarding data
      const { error } = await supabase
        .from('users')
        .update({
          tradingview_username: formData.tradingview_username.trim(),
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim() || null,
          country: formData.country.trim(),
          city: formData.city.trim(),
          onboarding_completed: true
        })
        .eq('id', user.id);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setErrors({ tradingview_username: 'Este usuario de TradingView ya está registrado' });
          setCurrentStep(1);
          setIsSubmitting(false);
          return;
        }
        throw error;
      }

      // Success - redirect to intended destination
      router.push(redirectPath);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ tradingview_username: 'Error al guardar los datos. Inténtalo de nuevo.' });
      setCurrentStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-full mb-4">
          <TrendingUp className="w-8 h-8 text-black" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">¡Bienvenido a APIDevs!</h2>
        <p className="text-gray-300 text-lg">
          Necesitamos algunos datos para personalizar tu experiencia de trading
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="tradingview_username" className="block text-sm font-semibold text-apidevs-primary mb-2">
            <TrendingUp className="inline w-4 h-4 mr-2" />
            Usuario de TradingView *
          </label>
          <input
            id="tradingview_username"
            type="text"
            placeholder="tu_usuario_tradingview"
            value={formData.tradingview_username}
            onChange={(e) => handleInputChange('tradingview_username', e.target.value)}
            className={`w-full p-4 rounded-2xl bg-gray-900/50 border text-white placeholder-gray-400 focus:ring-2 focus:ring-apidevs-primary/50 focus:outline-none transition-all ${
              errors.tradingview_username ? 'border-red-500' : 'border-gray-700 focus:border-apidevs-primary'
            }`}
          />
          {errors.tradingview_username && (
            <p className="text-red-400 text-sm mt-2">{errors.tradingview_username}</p>
          )}
          <p className="text-gray-400 text-sm mt-2">
            Este usuario será usado para darte acceso a los indicadores en TradingView
          </p>
        </div>

        <div>
          <label htmlFor="full_name" className="block text-sm font-semibold text-gray-200 mb-2">
            <User className="inline w-4 h-4 mr-2" />
            Nombre Completo *
          </label>
          <input
            id="full_name"
            type="text"
            placeholder="Tu nombre completo"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            className={`w-full p-4 rounded-2xl bg-gray-900/50 border text-white placeholder-gray-400 focus:ring-2 focus:ring-apidevs-primary/50 focus:outline-none transition-all ${
              errors.full_name ? 'border-red-500' : 'border-gray-700 focus:border-apidevs-primary'
            }`}
          />
          {errors.full_name && (
            <p className="text-red-400 text-sm mt-2">{errors.full_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-200 mb-2">
            <Phone className="inline w-4 h-4 mr-2" />
            Teléfono (Opcional)
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+1 234 567 8900"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full p-4 rounded-2xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:border-apidevs-primary focus:ring-2 focus:ring-apidevs-primary/50 focus:outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mb-4">
          <MapPin className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Ubicación</h2>
        <p className="text-gray-300 text-lg">
          Ayúdanos a personalizar tu experiencia según tu región
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="country" className="block text-sm font-semibold text-gray-200 mb-2">
            País *
          </label>
          <select
            id="country"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className={`w-full p-4 rounded-2xl bg-gray-900/50 border text-white focus:ring-2 focus:ring-apidevs-primary/50 focus:outline-none transition-all ${
              errors.country ? 'border-red-500' : 'border-gray-700 focus:border-apidevs-primary'
            }`}
          >
            <option value="">Selecciona tu país</option>
            <option value="Argentina">Argentina</option>
            <option value="Bolivia">Bolivia</option>
            <option value="Chile">Chile</option>
            <option value="Colombia">Colombia</option>
            <option value="Costa Rica">Costa Rica</option>
            <option value="Ecuador">Ecuador</option>
            <option value="El Salvador">El Salvador</option>
            <option value="España">España</option>
            <option value="Guatemala">Guatemala</option>
            <option value="Honduras">Honduras</option>
            <option value="México">México</option>
            <option value="Nicaragua">Nicaragua</option>
            <option value="Panamá">Panamá</option>
            <option value="Paraguay">Paraguay</option>
            <option value="Perú">Perú</option>
            <option value="República Dominicana">República Dominicana</option>
            <option value="Uruguay">Uruguay</option>
            <option value="Venezuela">Venezuela</option>
            <option value="Estados Unidos">Estados Unidos</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.country && (
            <p className="text-red-400 text-sm mt-2">{errors.country}</p>
          )}
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-semibold text-gray-200 mb-2">
            Ciudad *
          </label>
          <input
            id="city"
            type="text"
            placeholder="Tu ciudad"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className={`w-full p-4 rounded-2xl bg-gray-900/50 border text-white placeholder-gray-400 focus:ring-2 focus:ring-apidevs-primary/50 focus:outline-none transition-all ${
              errors.city ? 'border-red-500' : 'border-gray-700 focus:border-apidevs-primary'
            }`}
          />
          {errors.city && (
            <p className="text-red-400 text-sm mt-2">{errors.city}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-apidevs-primary rounded-full mb-6">
        <CheckCircle className="w-10 h-10 text-black" />
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-4">¡Todo listo!</h2>
      
      <div className="bg-gradient-to-r from-apidevs-primary/10 to-green-400/10 rounded-2xl p-6 border border-apidevs-primary/20">
        <h3 className="text-xl font-semibold text-apidevs-primary mb-4">Resumen de tu perfil:</h3>
        <div className="space-y-3 text-left">
          <div className="flex justify-between">
            <span className="text-gray-300">TradingView:</span>
            <span className="text-white font-medium">{formData.tradingview_username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Nombre:</span>
            <span className="text-white font-medium">{formData.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Ubicación:</span>
            <span className="text-white font-medium">{formData.city}, {formData.country}</span>
          </div>
          {formData.phone && (
            <div className="flex justify-between">
              <span className="text-gray-300">Teléfono:</span>
              <span className="text-white font-medium">{formData.phone}</span>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-gray-300">
        Tu usuario de TradingView será usado para darte acceso a nuestros indicadores premium
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-apidevs-dark via-black to-apidevs-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Paso {currentStep} de 3</span>
            <span className="text-sm text-apidevs-primary">{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-apidevs-primary to-green-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && currentStep < 3 && (
              <Button
                variant="slim"
                onClick={handleBack}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-2xl transition-all"
              >
                Anterior
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button
                variant="slim"
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-apidevs-primary to-green-400 hover:from-green-400 hover:to-apidevs-primary text-black font-bold py-4 rounded-2xl transition-all transform hover:scale-105"
              >
                Continuar
              </Button>
            ) : (
              <Button
                variant="slim"
                onClick={handleSubmit}
                loading={isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-apidevs-primary hover:from-apidevs-primary hover:to-green-500 text-black font-bold py-4 rounded-2xl transition-all transform hover:scale-105"
              >
                {isSubmitting ? 'Guardando...' : 'Completar Configuración'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
