import { supabaseAdmin } from '@/utils/supabase/admin';

/**
 * Revoca automáticamente todos los accesos premium de un usuario cuando se cancela su suscripción
 * 
 * @param customerEmail - Email del cliente de Stripe
 * @param subscriptionId - ID de la suscripción cancelada
 * @param reason - Razón de la cancelación
 * @returns Resultado de la operación
 */
export async function revokeIndicatorAccessOnCancellation(
  customerEmail: string,
  subscriptionId: string,
  reason: 'subscription_cancelled' | 'subscription_deleted' = 'subscription_cancelled'
) {
  console.log('\n🚫 ========== AUTO-REVOKE DEBUG ==========');
  console.log('📧 Customer Email:', customerEmail);
  console.log('🔖 Subscription ID:', subscriptionId);
  console.log('📝 Reason:', reason);
  console.log('==========================================\n');

  try {
    // 1. Buscar usuario en Supabase
    const { data: user, error: userError } = await (supabaseAdmin as any)
      .from('users')
      .select('id, email, tradingview_username')
      .eq('email', customerEmail)
      .maybeSingle();

    if (userError) {
      console.error('❌ Error buscando usuario:', userError);
      return {
        success: false,
        reason: 'Error buscando usuario en base de datos'
      };
    }

    if (!user) {
      console.log('⚠️ Usuario no encontrado en Supabase:', customerEmail);
      return {
        success: false,
        reason: 'Usuario no registrado en la plataforma'
      };
    }

    if (!user.tradingview_username) {
      console.log('⚠️ Usuario sin tradingview_username:', customerEmail);
      return {
        success: false,
        reason: 'Usuario no completó onboarding (sin tradingview_username)'
      };
    }

    console.log('✅ Usuario encontrado:', {
      id: user.id,
      email: user.email,
      tradingview_username: user.tradingview_username
    });

    // 2. Buscar accesos premium activos del usuario
    const { data: activeAccesses, error: accessError } = await (supabaseAdmin as any)
      .from('indicator_access')
      .select(`
        id,
        indicator_id,
        tradingview_username,
        expires_at,
        duration_type,
        indicators!inner(
          id,
          name,
          pine_id,
          access_tier
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('indicators.access_tier', 'premium');

    if (accessError) {
      console.error('❌ Error buscando accesos:', accessError);
      return {
        success: false,
        reason: 'Error buscando accesos del usuario'
      };
    }

    if (!activeAccesses || activeAccesses.length === 0) {
      console.log('ℹ️ Usuario no tiene accesos premium activos');
      return {
        success: true,
        reason: 'Usuario no tiene accesos premium activos',
        accessesRevoked: 0
      };
    }

    console.log(`🎯 Encontrados ${activeAccesses.length} accesos premium activos`);

    // 3. Preparar pine_ids para revocar en TradingView
    const pineIds = activeAccesses.map((access: any) => access.indicators.pine_id);
    console.log('📦 Pine IDs a revocar:', pineIds);

    // 4. Llamar al microservicio TradingView para revocar accesos
    const tradingViewUrl = process.env.TRADINGVIEW_MICROSERVICE_URL || 'http://185.218.124.241:5001';
    
    try {
      const tvResponse = await fetch(
        `${tradingViewUrl}/api/access/${user.tradingview_username}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pine_ids: pineIds
          })
        }
      );

      if (!tvResponse.ok) {
        throw new Error(`TradingView API error: ${tvResponse.status} ${tvResponse.statusText}`);
      }

      const tvResult = await tvResponse.json();
      console.log('📡 Respuesta TradingView:', tvResult);

      // 5. Actualizar registros en indicator_access
      const revokedAccesses = [];
      const revokedLogRecords = [];

      for (const access of activeAccesses) {
        // Actualizar indicator_access
        const { error: updateError } = await (supabaseAdmin as any)
          .from('indicator_access')
          .update({
            status: 'revoked',
            revoked_at: new Date().toISOString(),
            revoked_by: null, // Sistema automático
            notes: `Auto-revoked due to ${reason}`
          })
          .eq('id', access.id);

        if (updateError) {
          console.error('❌ Error actualizando indicator_access:', updateError);
          continue;
        }

        revokedAccesses.push({
          id: access.id,
          indicator_name: access.indicators.name,
          pine_id: access.indicators.pine_id
        });

        // Crear registro en indicator_access_log
        const logRecord = {
          user_id: user.id,
          indicator_id: access.indicator_id,
          tradingview_username: user.tradingview_username,
          operation_type: 'revoke',
          access_source: 'subscription_cancellation',
          status: 'revoked',
          granted_at: null, // No aplica para revocación
          expires_at: access.expires_at,
          revoked_at: new Date().toISOString(),
          duration_type: access.duration_type,
          subscription_id: subscriptionId,
          payment_intent_id: null,
          indicator_access_id: access.id,
          tradingview_response: tvResult,
          error_message: null,
          performed_by: null, // Sistema automático
          notes: `Auto-revoked due to ${reason}`,
          metadata: {
            reason: reason,
            subscription_id: subscriptionId,
            revoked_count: revokedAccesses.length
          }
        };

        revokedLogRecords.push(logRecord);
      }

      // 6. Insertar registros en indicator_access_log
      if (revokedLogRecords.length > 0) {
        const { error: logError } = await (supabaseAdmin as any)
          .from('indicator_access_log')
          .insert(revokedLogRecords);

        if (logError) {
          console.error('❌ Error insertando logs:', logError);
        } else {
          console.log(`✅ ${revokedLogRecords.length} registros de log creados`);
        }
      }

      // 7. Crear evento de actividad del usuario
      try {
        const activityEvent = {
          user_id: user.id,
          event_type: 'subscription_cancelled',
          event_data: {
            reason: reason,
            subscription_id: subscriptionId,
            cancelled_at: new Date().toISOString(),
            product_name: 'APIDevs indicator - Pro',
            accesses_revoked: revokedAccesses.length,
            indicators_affected: revokedAccesses.map(a => a.indicator_name)
          }
        };

        await (supabaseAdmin as any)
          .from('user_activity_events')
          .insert(activityEvent);

        console.log('✅ Evento de actividad creado');
      } catch (activityError) {
        console.error('⚠️ Error creando evento de actividad:', activityError);
        // No fallar por esto
      }

      console.log('\n✅ AUTO-REVOKE COMPLETADO:');
      console.log('   Usuario:', user.email);
      console.log('   TradingView Username:', user.tradingview_username);
      console.log('   Accesos Revocados:', revokedAccesses.length);
      console.log('   Indicadores Afectados:', revokedAccesses.map(a => a.indicator_name));
      console.log('==========================================\n');

      return {
        success: true,
        userId: user.id,
        tradingviewUsername: user.tradingview_username,
        accessesRevoked: revokedAccesses.length,
        indicatorsAffected: revokedAccesses.map(a => a.indicator_name),
        tradingViewResponse: tvResult
      };

    } catch (tvError: any) {
      console.error('❌ Error en TradingView:', tvError);
      
      // Marcar accesos como "failed" en lugar de "revoked"
      for (const access of activeAccesses) {
        await (supabaseAdmin as any)
          .from('indicator_access')
          .update({
            status: 'failed',
            notes: `Auto-revoke failed: ${tvError?.message || 'Unknown error'}`
          })
          .eq('id', access.id);
      }

      return {
        success: false,
        reason: `Error en TradingView: ${tvError?.message || 'Unknown error'}`,
        accessesRevoked: 0
      };
    }

  } catch (error: any) {
    console.error('❌ Error en auto-revoke:', error);
    return {
      success: false,
      reason: `Error interno: ${error?.message || 'Unknown error'}`,
      accessesRevoked: 0
    };
  }
}

/**
 * Extrae el email del customer de Stripe
 */
export async function getCustomerEmail(customerId: string): Promise<string | null> {
  try {
    const stripe = require('@/utils/stripe/config').stripe;
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer && !customer.deleted && customer.email) {
      return customer.email;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo email del customer:', error);
    return null;
  }
}
