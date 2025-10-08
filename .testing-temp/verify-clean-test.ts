import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyCleanTest() {
  const email = 'pro-mensual@test.com';
  const userId = '6b89d9ba-fbac-4883-a773-befe02e47713';
  
  console.log('\n🔍 VERIFICACIÓN PRUEBA LIMPIA\n');
  console.log('═'.repeat(70));
  
  // 1. Última compra
  console.log('\n💰 ÚLTIMA COMPRA:\n');
  const { data: lastPurchase } = await supabase
    .from('purchases')
    .select('*')
    .eq('customer_email', email)
    .order('order_date', { ascending: false })
    .limit(1)
    .single();
  
  if (lastPurchase) {
    console.log(`Fecha: ${lastPurchase.order_date}`);
    console.log(`Order: ${lastPurchase.order_number}`);
    console.log(`Total: $${(lastPurchase.order_total_cents / 100).toFixed(2)}`);
    console.log(`Product: ${lastPurchase.product_name}`);
  } else {
    console.log('❌ No se encontró compra');
  }
  
  // 2. Últimas operaciones en log
  console.log('\n═'.repeat(70));
  console.log('\n📋 ÚLTIMAS 10 OPERACIONES EN LOG:\n');
  
  const { data: logs } = await supabase
    .from('indicator_access_log')
    .select('created_at, operation_type, access_source, indicator_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (logs && logs.length > 0) {
    console.log(`Total operaciones recientes: ${logs.length}\n`);
    logs.forEach((log, idx) => {
      const time = new Date(log.created_at).toLocaleTimeString('es-ES');
      console.log(`${idx + 1}. ${time} - ${log.operation_type} (${log.access_source})`);
    });
  } else {
    console.log('❌ No hay operaciones registradas');
  }
  
  // 3. Accesos activos actuales
  console.log('\n═'.repeat(70));
  console.log('\n🎯 ACCESOS ACTIVOS:\n');
  
  const { data: accesses } = await supabase
    .from('indicator_access')
    .select('*, indicators(name, access_tier)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('updated_at', { ascending: false });
  
  if (accesses && accesses.length > 0) {
    console.log(`Total accesos activos: ${accesses.length}\n`);
    accesses.forEach((a, idx) => {
      const indicator = a.indicators as any;
      console.log(`${idx + 1}. ${indicator?.name || 'N/A'} [${indicator?.access_tier}]`);
      console.log(`   Status: ${a.status}`);
      console.log(`   Duration: ${a.duration_type}`);
      console.log(`   Expires: ${a.expires_at}`);
      console.log(`   Renewals: ${a.renewal_count || 0}`);
      console.log('');
    });
  } else {
    console.log('❌ No hay accesos activos');
  }
  
  console.log('═'.repeat(70));
  console.log('\n✅ Verificación completada\n');
}

verifyCleanTest();

