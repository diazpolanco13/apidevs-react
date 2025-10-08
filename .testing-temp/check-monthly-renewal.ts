import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkMonthlyRenewal() {
  const email = 'pro-mensual@test.com';
  const userId = '6b89d9ba-fbac-4883-a773-befe02e47713';
  
  console.log('\n🔍 VERIFICACIÓN RENOVACIÓN MENSUAL\n');
  console.log('═'.repeat(70));
  
  // 1. Compras
  console.log('\n💰 COMPRAS REGISTRADAS:\n');
  const { data: purchases, error: purchasesError } = await supabase
    .from('purchases')
    .select('*')
    .eq('customer_email', email)
    .order('order_date', { ascending: false });
  
  if (purchasesError) {
    console.error('❌ Error:', purchasesError);
  } else {
    console.log(`Total: ${purchases?.length || 0} compras\n`);
    purchases?.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.order_date}`);
      console.log(`   Order: ${p.order_number}`);
      console.log(`   Total: $${(p.order_total_cents / 100).toFixed(2)}`);
      console.log(`   Product: ${p.product_name}`);
      if (p.notes) console.log(`   Notes: ${p.notes.substring(0, 50)}...`);
      console.log('');
    });
  }
  
  // 2. Indicator Access Log
  console.log('═'.repeat(70));
  console.log('\n📋 INDICATOR ACCESS LOG (últimos 20):\n');
  
  const { data: logs, error: logsError } = await supabase
    .from('indicator_access_log')
    .select('created_at, operation_type, access_source, tradingview_username, indicator_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (logsError) {
    console.error('❌ Error:', logsError);
  } else {
    console.log(`Total registros: ${logs?.length || 0}\n`);
    
    // Agrupar por fecha
    const today = logs?.filter(l => l.created_at.startsWith('2025-10-08'));
    const grouped = logs?.reduce((acc: any, log) => {
      const date = log.created_at.split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(log);
      return acc;
    }, {});
    
    Object.entries(grouped || {}).forEach(([date, items]: [string, any]) => {
      console.log(`📅 ${date}: ${items.length} operaciones`);
      const operations = items.reduce((acc: any, item: any) => {
        const key = `${item.operation_type}-${item.access_source}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      Object.entries(operations).forEach(([op, count]) => {
        console.log(`   - ${op}: ${count}`);
      });
    });
  }
  
  // 3. Indicator Access (estado actual)
  console.log('\n═'.repeat(70));
  console.log('\n🎯 ACCESOS ACTIVOS ACTUALES:\n');
  
  const { data: accesses, error: accessesError } = await supabase
    .from('indicator_access')
    .select('*, indicators(name)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (accessesError) {
    console.error('❌ Error:', accessesError);
  } else {
    console.log(`Total accesos: ${accesses?.length || 0}\n`);
    accesses?.slice(0, 3).forEach((a, idx) => {
      console.log(`${idx + 1}. ${(a.indicators as any)?.name || 'N/A'}`);
      console.log(`   Status: ${a.status}`);
      console.log(`   Granted: ${a.granted_at}`);
      console.log(`   Expires: ${a.expires_at}`);
      console.log(`   Duration: ${a.duration_type}`);
      console.log(`   Renewals: ${a.renewal_count || 0}`);
      console.log('');
    });
  }
  
  console.log('═'.repeat(70));
  console.log('\n✅ VERIFICACIÓN COMPLETADA\n');
}

checkMonthlyRenewal();

