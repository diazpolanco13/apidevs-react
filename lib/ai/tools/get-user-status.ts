import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

export const getUserStatus = tool({
  description: "Obtiene información completa del usuario autenticado incluyendo: email, nombre, tradingview_username, suscripción activa, accesos a indicadores y estado de la cuenta. Úsala cuando pregunten sobre su perfil, username de TradingView, suscripción o accesos.",
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
        .select('*')
        .eq('id', user.id)
        .single() as { data: any; error: any };

      if (userError || !userData) {
        return {
          error: "Usuario no encontrado en la base de datos",
        };
      }

      // Obtener suscripción activa
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      // Obtener accesos a indicadores
      const { data: indicatorAccess } = await supabase
        .from('indicator_access')
        .select(`
          *,
          indicators (
            name,
            description
          )
        `)
        .eq('user_id', user.id)
        .eq('active', true);

      const result = {
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          tradingview_username: userData.tradingview_username,
          created_at: userData.created_at,
        },
        subscription: subscription || null,
        indicatorAccess: indicatorAccess || [],
        summary: {
          hasActiveSubscription: !!subscription,
          totalIndicators: indicatorAccess?.length || 0,
          subscriptionStatus: userData.subscription_status || 'none',
          subscriptionTier: userData.subscription_tier || 'free',
        }
      };

      return result;
    } catch (error) {
      console.error('Error en getUserStatus:', error);
      return {
        error: "Error interno al consultar el estado del usuario",
        details: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },
});