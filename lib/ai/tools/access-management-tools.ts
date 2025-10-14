import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

export const getUserAccessDetails = tool({
  description: "Obtiene lista detallada de indicadores activos de un usuario con fechas de expiración. Útil para administradores que necesitan ver qué accesos tiene un usuario, o para usuarios que quieren consultar sus propios accesos.",
  inputSchema: z.object({
    userEmail: z.string().email().describe("Email del usuario para consultar sus accesos")
  }),
  execute: async ({ userEmail }) => {
    try {
      console.log(`🔍 getUserAccessDetails: Consultando accesos para ${userEmail}`);

      const supabase = await createClient();

      // Buscar el usuario por email (sin verificar permisos aquí, se hace en API route)
      const { data: targetUser, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, tradingview_username, customer_tier')
        .eq('email', userEmail)
        .single();

      console.log(`👤 Usuario encontrado:`, targetUser);
      console.log(`❌ Error de usuario:`, userError);

      if (userError || !targetUser) {
        return {
          success: false,
          error: `Usuario con email ${userEmail} no encontrado en la base de datos. Error: ${userError?.message || 'Usuario no existe'}`
        };
      }

      // Verificar si el usuario tiene tradingview_username
      if (!(targetUser as any).tradingview_username) {
        console.log(`⚠️ Usuario ${userEmail} no tiene tradingview_username configurado`);
        return {
          success: true,
          user: {
            email: (targetUser as any).email,
            full_name: (targetUser as any).full_name,
            tradingview_username: "No configurado",
            customer_tier: (targetUser as any).customer_tier
          },
          access_stats: {
            total_active: 0,
            free_indicators: 0,
            premium_indicators: 0,
            expiring_soon: 0
          },
          active_accesses: [],
          note: "Este usuario no tiene configurado su usuario de TradingView, por lo que no puede tener accesos a indicadores."
        };
      }

      // Obtener accesos activos del usuario
      console.log(`🔍 Consultando accesos activos para user_id: ${(targetUser as any).id}`);

      const { data: accesses, error: accessError } = await supabase
        .from('indicator_access')
        .select(`
          id,
          status,
          granted_at,
          expires_at,
          duration_type,
          access_source,
          indicators (
            id,
            name,
            pine_id,
            category,
            access_tier
          )
        `)
        .eq('user_id', (targetUser as any).id)
        .eq('status', 'active')
        .order('granted_at', { ascending: false });

      console.log(`📊 Accesos encontrados:`, accesses?.length || 0);
      console.log(`❌ Error de accesos:`, accessError);

      if (accessError) {
        return {
          success: false,
          error: `Error al consultar accesos del usuario: ${accessError.message}`
        };
      }

      // Type assertion for accesses
      const typedAccesses = accesses as any[] || [];

      console.log(`📋 Datos completos de accesos:`, JSON.stringify(typedAccesses, null, 2));

      // Contar accesos por tipo
      const accessStats = {
        total_active: typedAccesses.length,
        free_indicators: typedAccesses.filter((a: any) => a.indicators?.access_tier === 'free').length,
        premium_indicators: typedAccesses.filter((a: any) => a.indicators?.access_tier === 'premium').length,
        expiring_soon: typedAccesses.filter((a: any) => {
          if (!a.expires_at) return false;
          const daysUntilExpiry = Math.ceil((new Date(a.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 7;
        }).length
      };

      return {
        success: true,
        user: {
          email: (targetUser as any).email,
          full_name: (targetUser as any).full_name,
          tradingview_username: (targetUser as any).tradingview_username,
          customer_tier: (targetUser as any).customer_tier
        },
        access_stats: accessStats,
        active_accesses: typedAccesses.map((access: any) => ({
          indicator_name: access.indicators?.name,
          pine_id: access.indicators?.pine_id,
          category: access.indicators?.category,
          tier: access.indicators?.access_tier,
          granted_at: access.granted_at,
          expires_at: access.expires_at,
          duration_type: access.duration_type,
          access_source: access.access_source,
          days_until_expiry: access.expires_at ?
            Math.ceil((new Date(access.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) :
            null
        }))
      };

      // Crear respuesta formateada para que el AI la use fácilmente
      const formattedResponse = {
        success: true,
        summary: `${(targetUser as any).full_name} (${(targetUser as any).email}) tiene ${typedAccesses.length} indicadores activos: ${typedAccesses.filter((a: any) => a.indicators?.access_tier === 'free').length} gratuitos y ${typedAccesses.filter((a: any) => a.indicators?.access_tier === 'premium').length} premium.`,
        user_info: {
          name: (targetUser as any).full_name,
          email: (targetUser as any).email,
          tradingview_username: (targetUser as any).tradingview_username,
          tier: (targetUser as any).customer_tier
        },
        active_indicators: typedAccesses.map((access: any) => ({
          name: access.indicators?.name,
          category: access.indicators?.category,
          tier: access.indicators?.access_tier,
          expires_at: access.expires_at,
          duration: access.duration_type
        }))
      };

      console.log(`✅ RETORNO FINAL FORMATEADO:`, JSON.stringify(formattedResponse, null, 2));

      // Retornar respuesta optimizada para que el AI la use fácilmente
      return formattedResponse;

    } catch (error) {
      console.error('Error en getUserAccessDetails:', error);
      return {
        success: false,
        error: "Error interno al consultar accesos del usuario"
      };
    }
  }
});
