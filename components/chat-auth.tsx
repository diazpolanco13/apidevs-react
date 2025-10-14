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
    <div className="p-6 bg-[#1a1a1a] border-t border-[#333]">
      <div className="text-center mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#aaff00]/20 flex items-center justify-center mx-auto mb-3">
          <img 
            src="/buho-leyendo.gif" 
            alt="Búho APIDevs" 
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-white font-medium mb-2">¡Hola! Para personalizar tu experiencia</h3>
        <p className="text-gray-400 text-sm">Ingresa tu email para acceder a tu información personalizada</p>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-3">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aaff00] focus:border-[#aaff00] text-white placeholder-gray-400 text-sm"
            disabled={isLoading}
            required
          />
          {error && (
            <p className="text-red-400 text-xs mt-1">{error}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="w-full px-4 py-2 bg-[#aaff00] text-white rounded-lg hover:bg-[#C9D92E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
        >
          {isLoading ? "Verificando..." : "Continuar"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => onGuestContinue("")}
          className="text-gray-400 hover:text-white text-xs transition-colors"
        >
          Continuar sin email (modo limitado)
        </button>
      </div>

      <div className="mt-4 p-3 bg-[#2a2a2a] rounded-lg">
        <p className="text-gray-400 text-xs">
          <strong className="text-[#aaff00]">¿Por qué pedimos tu email?</strong><br/>
          • Acceso a tu información personalizada<br/>
          • Historial de consultas<br/>
          • Protección contra spam<br/>
          • Soporte más efectivo
        </p>
      </div>
    </div>
  );
}
