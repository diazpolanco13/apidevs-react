import { useState, useCallback } from 'react';

// Usar API routes de Next.js en lugar de llamar directamente al microservicio (evita CORS)
const API_BASE = '/api/tradingview';

interface ValidationResult {
  isValid: boolean;
  username?: string;
  profileImage?: string;
  error?: string;
}

export const useTradingViewValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  /**
   * Valida que un usuario de TradingView existe
   */
  const validateUsername = useCallback(async (username: string): Promise<ValidationResult> => {
    if (!username || username.trim().length < 3) {
      return {
        isValid: false,
        error: 'El usuario debe tener al menos 3 caracteres'
      };
    }

    setIsValidating(true);
    
    try {
      // 1. Validar que el usuario existe (a través de nuestra API route)
      const validateResponse = await fetch(`${API_BASE}/validate/${username.trim()}`);
      
      if (!validateResponse.ok) {
        throw new Error('Error al validar usuario');
      }

      const validateData = await validateResponse.json();

      if (!validateData.validuser) {
        setValidationResult({
          isValid: false,
          error: 'Este usuario no existe en TradingView'
        });
        return {
          isValid: false,
          error: 'Este usuario no existe en TradingView'
        };
      }

      // 2. Obtener imagen de perfil (a través de nuestra API route)
      // ✅ Hacer esto NO bloqueante - si falla, continuar sin imagen
      let profileImage: string | null = null;
      
      try {
        const profileResponse = await fetch(`${API_BASE}/profile/${validateData.verifiedUserName}`);
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('Profile data received:', profileData); // Debug
          profileImage = profileData.profile_image || profileData.profileImage || null;
        } else {
          console.log('Profile not found, continuing without image (status:', profileResponse.status, ')');
        }
      } catch (profileError) {
        console.warn('Could not fetch profile image, continuing without it:', profileError);
      }

      const result: ValidationResult = {
        isValid: true,
        username: validateData.verifiedUserName,
        profileImage
      };

      setValidationResult(result);
      return result;

    } catch (error: any) {
      console.error('Error validating TradingView username:', error);
      const errorResult = {
        isValid: false,
        error: error.message || 'Error al conectar con TradingView'
      };
      setValidationResult(errorResult);
      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Resetea el estado de validación
   */
  const resetValidation = useCallback(() => {
    setValidationResult(null);
    setIsValidating(false);
  }, []);

  return {
    isValidating,
    validationResult,
    validateUsername,
    resetValidation
  };
};
