"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface ChatAuthProps {
  onAuthSuccess: (userData: any) => void;
  onGuestContinue: (email: string) => void;
}

export function ChatAuth({ onAuthSuccess, onGuestContinue }: ChatAuthProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;

    setIsLoading(true);
    setError("");

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un email válido");
      setIsLoading(false);
      return;
    }

    try {
      // Verificar si el usuario existe en la base de datos
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (userError || !userData) {
        // Usuario no encontrado, continuar como invitado
        onGuestContinue(email);
      } else {
        // Usuario encontrado, usar sus datos
        onAuthSuccess(userData);
      }
    } catch (error) {
      console.error('Error verificando usuario:', error);
      setError("Error al verificar el email. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#1a1a1a] rounded-lg flex flex-col z-10">
      {/* Header con color correcto */}
      <div className="bg-[#C9D92E] p-4 rounded-t-lg text-center">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-black/10 flex items-center justify-center mx-auto mb-2">
          <picture>
            <source srcSet="https://zzieiqxlxfydvexalbsr.supabase.co/storage/v1/object/public/static-assets/animations/buho-leyendo.webp" type="image/webp" />
            <img 
              src="/buho-leyendo.gif" 
              alt="Búho APIDevs" 
              className="w-full h-full object-cover"
            />
          </picture>
        </div>
        <h3 className="text-black font-bold text-lg">¡Hola! Obtén soporte personalizado</h3>
        <p className="text-black/70 text-sm font-medium">Inicia sesión o crea una cuenta gratis para una experiencia completa</p>
      </div>

      {/* Contenido */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Botones principales para usuarios con cuenta */}
        <div className="space-y-3 mb-6">
          <a
            href="/signin"
            className="block w-full px-4 py-3 bg-[#C9D92E] text-black text-center rounded-lg hover:bg-[#B8C428] transition-all duration-200 font-bold shadow-md hover:shadow-xl hover:scale-105"
          >
            Iniciar Sesión
          </a>
          
          <a
            href="/signup"
            className="block w-full px-4 py-3 bg-[#2a2a2a] text-white text-center rounded-lg hover:bg-[#333] border border-[#444] hover:border-[#C9D92E] transition-all duration-200 font-medium"
          >
            Crear Cuenta Gratis
          </a>
        </div>

        {/* Separador */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#333]"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-[#1a1a1a] text-gray-500">O continuar sin cuenta</span>
          </div>
        </div>

        {/* Opción de continuar con email (modo limitado) */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com (opcional)"
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9D92E] focus:border-[#C9D92E] text-white placeholder-gray-400 text-sm"
              disabled={isLoading}
            />
            {error && (
              <p className="text-red-400 text-xs mt-1">{error}</p>
            )}
          </div>
        
          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full px-4 py-2 bg-[#2a2a2a] text-gray-300 rounded-lg hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium border border-[#444]"
          >
            {isLoading ? "Verificando..." : "Continuar con Email"}
          </button>
        </form>

        <div className="mt-3 text-center">
          <button
            onClick={() => onGuestContinue("")}
            className="text-gray-500 hover:text-gray-400 text-xs transition-colors underline"
          >
            Continuar sin email (muy limitado)
          </button>
        </div>

        {/* Beneficios de tener cuenta */}
        <div className="mt-6 p-4 bg-[#2a2a2a] rounded-lg border border-[#333]">
          <p className="text-[#C9D92E] text-sm font-bold mb-2">✨ Beneficios con cuenta:</p>
          <ul className="text-gray-400 text-xs space-y-1.5 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#C9D92E] mt-0.5">✓</span>
              <span>Acceso completo a tu información y suscripción</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#C9D92E] mt-0.5">✓</span>
              <span>Historial de conversaciones guardado</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#C9D92E] mt-0.5">✓</span>
              <span>Soporte técnico especializado y prioritario</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#C9D92E] mt-0.5">✓</span>
              <span>Acceso a descuentos exclusivos (usuarios legacy)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">🎁</span>
              <span><strong className="text-white">¡100% Gratis!</strong> Sin tarjeta de crédito</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
