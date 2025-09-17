const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Actualizar estado de reactivación cuando un cliente legacy se suscribe
 */
async function updateReactivationStatus(userEmail, subscriptionId, campaignSource = 'organic') {
  try {
    console.log(`🔄 Actualizando reactivación para: ${userEmail}`);
    
    // Obtener datos del usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('migrated_at, legacy_customer')
      .eq('email', userEmail)
      .single();
    
    if (userError || !user) {
      console.error('❌ Usuario no encontrado:', userError);
      return false;
    }
    
    if (!user.legacy_customer) {
      console.log('ℹ️ Usuario no es legacy, no requiere tracking de reactivación');
      return false;
    }
    
    // Calcular días hasta reactivación
    const migratedAt = new Date(user.migrated_at);
    const reactivatedAt = new Date();
    const daysToReactivation = Math.floor((reactivatedAt - migratedAt) / (1000 * 60 * 60 * 24));
    
    // Actualizar estado de reactivación
    const { data, error } = await supabase
      .from('users')
      .update({
        reactivation_status: 'reactivated',
        reactivated_at: reactivatedAt.toISOString(),
        first_new_subscription_id: subscriptionId,
        reactivation_campaign: campaignSource,
        days_to_reactivation: daysToReactivation
      })
      .eq('email', userEmail);
    
    if (error) {
      console.error('❌ Error actualizando reactivación:', error);
      return false;
    }
    
    console.log(`✅ Cliente legacy reactivado exitosamente:`);
    console.log(`   📧 Email: ${userEmail}`);
    console.log(`   🆔 Subscription: ${subscriptionId}`);
    console.log(`   📅 Días hasta reactivación: ${daysToReactivation}`);
    console.log(`   🎯 Campaña: ${campaignSource}`);
    
    return true;
    
  } catch (error) {
    console.error('💥 Error crítico en reactivación:', error);
    return false;
  }
}

/**
 * Actualizar estado de contacto para campañas de email
 */
async function updateContactStatus(emails, campaignName) {
  try {
    console.log(`📧 Marcando ${emails.length} usuarios como contactados...`);
    
    const { data, error } = await supabase
      .from('users')
      .update({
        reactivation_status: 'contacted',
        reactivation_campaign: campaignName
      })
      .in('email', emails)
      .eq('legacy_customer', true);
    
    if (error) {
      console.error('❌ Error actualizando estado de contacto:', error);
      return false;
    }
    
    console.log(`✅ ${emails.length} clientes legacy marcados como contactados`);
    return true;
    
  } catch (error) {
    console.error('💥 Error en actualización de contacto:', error);
    return false;
  }
}

/**
 * Obtener estadísticas de reactivación
 */
async function getReactivationStats() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('reactivation_status, days_to_reactivation, reactivation_campaign')
      .eq('legacy_customer', true);
    
    if (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return null;
    }
    
    const stats = {
      total_legacy: data.length,
      pending: data.filter(u => u.reactivation_status === 'pending').length,
      contacted: data.filter(u => u.reactivation_status === 'contacted').length,
      engaged: data.filter(u => u.reactivation_status === 'engaged').length,
      reactivated: data.filter(u => u.reactivation_status === 'reactivated').length,
      churned_final: data.filter(u => u.reactivation_status === 'churned_final').length,
      avg_days_to_reactivation: data
        .filter(u => u.days_to_reactivation !== null)
        .reduce((sum, u) => sum + u.days_to_reactivation, 0) / data.filter(u => u.days_to_reactivation !== null).length || 0
    };
    
    stats.reactivation_rate = ((stats.reactivated / stats.total_legacy) * 100).toFixed(2);
    
    console.log('📊 ESTADÍSTICAS DE REACTIVACIÓN:');
    console.log(`   👥 Total clientes legacy: ${stats.total_legacy}`);
    console.log(`   ⏳ Pendientes: ${stats.pending}`);
    console.log(`   📧 Contactados: ${stats.contacted}`);
    console.log(`   👀 Engaged: ${stats.engaged}`);
    console.log(`   ✅ Reactivados: ${stats.reactivated}`);
    console.log(`   ❌ Churned final: ${stats.churned_final}`);
    console.log(`   📈 Tasa de reactivación: ${stats.reactivation_rate}%`);
    console.log(`   📅 Promedio días a reactivación: ${Math.round(stats.avg_days_to_reactivation)}`);
    
    return stats;
    
  } catch (error) {
    console.error('💥 Error obteniendo estadísticas:', error);
    return null;
  }
}

module.exports = {
  updateReactivationStatus,
  updateContactStatus,
  getReactivationStats
};

// Ejecutar estadísticas si se llama directamente
if (require.main === module) {
  getReactivationStats();
}
