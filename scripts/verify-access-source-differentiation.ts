/**
 * 🔍 Script de Verificación: Diferenciación Purchase vs Renewal
 * 
 * Verifica que el sistema diferencia correctamente entre:
 * - 'purchase': Compras iniciales (checkout.session.completed)
 * - 'renewal': Renovaciones automáticas (invoice.payment_succeeded con billing_reason=subscription_cycle)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verifyAccessSourceDifferentiation() {
  console.log('🔍 VERIFICACIÓN: Diferenciación Purchase vs Renewal\n');
  console.log('=' .repeat(80));
  
  // 1. Verificar registros en indicator_access
  console.log('\n📊 TABLA: indicator_access');
  console.log('-'.repeat(80));
  
  const { data: accessRecords } = await supabase
    .from('indicator_access')
    .select('id, user_id, access_source, granted_at, expires_at')
    .in('access_source', ['purchase', 'renewal'])
    .order('granted_at', { ascending: false })
    .limit(20);
  
  const purchaseCount = accessRecords?.filter(r => r.access_source === 'purchase').length || 0;
  const renewalCount = accessRecords?.filter(r => r.access_source === 'renewal').length || 0;
  
  console.log(`✅ Total de accesos registrados: ${accessRecords?.length || 0}`);
  console.log(`   📦 Purchase (compras iniciales): ${purchaseCount}`);
  console.log(`   🔄 Renewal (renovaciones automáticas): ${renewalCount}`);
  
  // 2. Verificar registros en indicator_access_log
  console.log('\n📊 TABLA: indicator_access_log');
  console.log('-'.repeat(80));
  
  const { data: logRecords } = await supabase
    .from('indicator_access_log')
    .select(`
      id, 
      user_id, 
      access_source, 
      operation_type, 
      created_at,
      notes,
      users!inner(email, tradingview_username)
    `)
    .in('access_source', ['purchase', 'renewal'])
    .order('created_at', { ascending: false })
    .limit(20);
  
  const logPurchaseCount = logRecords?.filter(r => r.access_source === 'purchase').length || 0;
  const logRenewalCount = logRecords?.filter(r => r.access_source === 'renewal').length || 0;
  
  console.log(`✅ Total de logs registrados: ${logRecords?.length || 0}`);
  console.log(`   📦 Purchase (compras iniciales): ${logPurchaseCount}`);
  console.log(`   🔄 Renewal (renovaciones automáticas): ${logRenewalCount}`);
  
  // 3. Mostrar últimos 10 registros de cada tipo
  if (logRecords && logRecords.length > 0) {
    console.log('\n📋 ÚLTIMOS REGISTROS (indicator_access_log):');
    console.log('-'.repeat(80));
    
    logRecords.slice(0, 10).forEach((log: any, index) => {
      const email = log.users?.email || 'N/A';
      const tvUsername = log.users?.tradingview_username || 'N/A';
      const source = log.access_source;
      const operation = log.operation_type;
      const timestamp = new Date(log.created_at).toLocaleString('es-ES');
      
      const icon = source === 'renewal' ? '🔄' : '📦';
      console.log(`\n${index + 1}. ${icon} ${source.toUpperCase()}`);
      console.log(`   Email: ${email}`);
      console.log(`   TradingView: ${tvUsername}`);
      console.log(`   Operation: ${operation}`);
      console.log(`   Fecha: ${timestamp}`);
      if (log.notes) {
        console.log(`   Notes: ${log.notes}`);
      }
    });
  }
  
  // 4. Resumen Final
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMEN FINAL:');
  console.log('='.repeat(80));
  
  if (renewalCount > 0 || logRenewalCount > 0) {
    console.log('\n✅ ¡SISTEMA FUNCIONANDO CORRECTAMENTE!');
    console.log('   El sistema está diferenciando correctamente entre:');
    console.log('   - Compras iniciales (purchase)');
    console.log('   - Renovaciones automáticas (renewal)');
  } else {
    console.log('\n⚠️  NO SE ENCONTRARON RENOVACIONES');
    console.log('   Esto puede significar que:');
    console.log('   1. Aún no se ha ejecutado ninguna renovación automática');
    console.log('   2. El sistema no está diferenciando correctamente');
    console.log('   3. Necesitas ejecutar el test de renovación');
  }
  
  console.log('\n' + '='.repeat(80));
}

// Ejecutar verificación
verifyAccessSourceDifferentiation()
  .then(() => {
    console.log('\n✅ Verificación completada\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error durante la verificación:', error);
    process.exit(1);
  });

