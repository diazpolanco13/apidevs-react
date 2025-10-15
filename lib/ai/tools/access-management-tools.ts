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

      // 🚀 CAMBIO CRÍTICO: Retornar texto simple en lugar de JSON complejo
      // Esto evita que el stream se trabe con respuestas muy grandes
      
      const freeCount = typedAccesses.filter((a: any) => a.indicators?.access_tier === 'free').length;
      const premiumCount = typedAccesses.filter((a: any) => a.indicators?.access_tier === 'premium').length;
      
      // Formatear lista de indicadores de forma legible
      const indicatorsList = typedAccesses.map((access: any, index: number) => {
        const name = access.indicators?.name || 'Sin nombre';
        const tier = access.indicators?.access_tier === 'premium' ? '⭐ PREMIUM' : '🆓 GRATIS';
        const duration = access.duration_type === '1L' ? 'Acceso de por vida' : `Expira: ${access.expires_at || 'N/A'}`;
        return `${index + 1}. ${name} - ${tier} (${duration})`;
      }).join('\n');
      
      // Retornar texto formateado listo para mostrar al usuario
      const textResponse = `
📊 RESUMEN DE ACCESOS PARA ${(targetUser as any).full_name}

Usuario: ${(targetUser as any).email}
TradingView: ${(targetUser as any).tradingview_username}
Tier: ${(targetUser as any).customer_tier || 'Standard'}

Total de indicadores activos: ${typedAccesses.length}
- Gratuitos: ${freeCount}
- Premium: ${premiumCount}

📋 LISTA DE INDICADORES:
${indicatorsList}
      `.trim();
      
      console.log(`✅ RETORNO FINAL (${textResponse.length} caracteres):`, textResponse.substring(0, 200) + '...');
      
      return textResponse;

    } catch (error) {
      console.error('Error en getUserAccessDetails:', error);
      return {
        success: false,
        error: "Error interno al consultar accesos del usuario"
      };
    }
  }
});
