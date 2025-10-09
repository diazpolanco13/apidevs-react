#!/usr/bin/env tsx
/**
 * Script para verificar accesos concedidos por renovaciones automáticas
 * 
 * Uso:
 *   npx tsx scripts/check-renewal-access.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRenewalAccess() {
  console.log('\n🔍 ========== VERIFICANDO ACCESOS POR RENOVACIÓN ==========\n');

  // 1. Buscar registros en indicator_access con access_source='renewal'
  const { data: renewalAccesses, error: accessError } = await supabase
    .from('indicator_access')
    .select(`
      id,
      user_id,
      indicator_id,
      status,
      granted_at,
      expires_at,
      access_source,
      renewal_count,
      last_renewed_at,
      users!inner (
        email,
        tradingview_username,
        full_name
      ),
      indicators!inner (
        name,
        pine_id
      )
    `)
    .eq('access_source', 'renewal')
    .order('granted_at', { ascending: false })
    .limit(50);

  if (accessError) {
    console.error('❌ Error obteniendo accesos por renovación:', accessError);
    return;
  }

  if (!renewalAccesses || renewalAccesses.length === 0) {
    console.log('⚠️ No se encontraron accesos concedidos por renovación automática');
    console.log('   Esto es normal si aún no ha ocurrido ninguna renovación.');
    console.log('\n💡 Para probar:');
    console.log('   1. Forzar renovación en Stripe Dashboard');
    console.log('   2. Usar: stripe trigger invoice.payment_succeeded --override billing_reason=subscription_cycle');
    console.log('   3. Esperar a que ocurra una renovación real\n');
    return;
  }

  console.log(`✅ Se encontraron ${renewalAccesses.length} accesos por renovación:\n`);

  renewalAccesses.forEach((access: any, index: number) => {
    const user = access.users;
    const indicator = access.indicators;
    
    console.log(`\n${index + 1}. Usuario: ${user.email}`);
    console.log(`   TradingView: ${user.tradingview_username}`);
    console.log(`   Indicador: ${indicator.name}`);
    console.log(`   Pine ID: ${indicator.pine_id}`);
    console.log(`   Estado: ${access.status}`);
    console.log(`   Concedido: ${new Date(access.granted_at).toLocaleString('es-ES')}`);
    console.log(`   Expira: ${new Date(access.expires_at).toLocaleString('es-ES')}`);
    console.log(`   Renovaciones: ${access.renewal_count || 0}`);
    if (access.last_renewed_at) {
      console.log(`   Última renovación: ${new Date(access.last_renewed_at).toLocaleString('es-ES')}`);
    }
  });

  // 2. Buscar registros en indicator_access_log con operation_type='grant' y access_source='renewal'
  console.log('\n\n🔍 ========== VERIFICANDO HISTORIAL DE RENOVACIONES ==========\n');

  const { data: renewalLogs, error: logError } = await supabase
    .from('indicator_access_log')
    .select(`
      id,
      user_id,
      tradingview_username,
      operation_type,
      access_source,
      granted_at,
      expires_at,
      created_at,
      indicators!inner (
        name
      )
    `)
    .eq('access_source', 'renewal')
    .order('created_at', { ascending: false })
    .limit(50);

  if (logError) {
    console.error('❌ Error obteniendo logs de renovación:', logError);
    return;
  }

  if (!renewalLogs || renewalLogs.length === 0) {
    console.log('⚠️ No se encontraron logs de renovaciones');
  } else {
    console.log(`✅ Se encontraron ${renewalLogs.length} registros en el historial:\n`);

    renewalLogs.forEach((log: any, index: number) => {
      const indicator = log.indicators;
      console.log(`${index + 1}. ${log.tradingview_username} → ${indicator.name}`);
      console.log(`   Fecha: ${new Date(log.created_at).toLocaleString('es-ES')}`);
      console.log(`   Expira: ${new Date(log.expires_at).toLocaleString('es-ES')}`);
    });
  }

  // 3. Estadísticas
  console.log('\n\n📊 ========== ESTADÍSTICAS ==========\n');

  const { count: totalRenewals } = await supabase
    .from('indicator_access_log')
    .select('*', { count: 'exact', head: true })
    .eq('access_source', 'renewal');

  const { count: activeRenewals } = await supabase
    .from('indicator_access')
    .select('*', { count: 'exact', head: true })
    .eq('access_source', 'renewal')
    .eq('status', 'active');

  console.log(`📈 Total renovaciones históricas: ${totalRenewals || 0}`);
  console.log(`✅ Accesos activos por renovación: ${activeRenewals || 0}`);

  console.log('\n✅ Verificación completada\n');
}

// Ejecutar
checkRenewalAccess()
  .catch(error => {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  });

