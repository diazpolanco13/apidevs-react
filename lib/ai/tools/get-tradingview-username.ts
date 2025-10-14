import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

export const getTradingViewUsername = tool({
  description: "Obtiene el username de TradingView del usuario autenticado. Úsala cuando pregunten por su usuario de TradingView.",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const supabase = await createClient();
      
      // Obtener usuario autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          error: "Usuario no autenticado",
        };
      }

      // Obtener datos del usuario desde la tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('tradingview_username, full_name, email')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        return {
          error: "Usuario no encontrado en la base de datos",
        };
      }

      // Retornar un mensaje simple y directo
      const username = (userData as any)?.tradingview_username || 'No configurado';
      return `Tu usuario de TradingView es: ${username}`;
    } catch (error) {
      console.error('Error en getTradingViewUsername:', error);
      return {
        error: "Error interno al consultar el username de TradingView",
        details: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },
});
