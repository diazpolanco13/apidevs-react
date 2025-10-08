import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkRenewal() {
  console.log('\n🔍 Verificando renovaciones en purchases...\n');
  
  // Verificar purchases del usuario de prueba
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('customer_email', 'test-monthly@apidevs.io')
    .order('order_date', { ascending: false });
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`📊 Total de compras: ${purchases?.length || 0}\n`);
  
  if (purchases && purchases.length > 0) {
    purchases.forEach((p, idx) => {
      console.log(`${idx + 1}. Order: ${p.order_number}`);
      console.log(`   Date: ${p.order_date}`);
      console.log(`   Total: $${(p.order_total_cents / 100).toFixed(2)}`);
      console.log(`   Status: ${p.order_status}`);
      console.log(`   Product: ${p.product_name}`);
      if (p.notes) {
        console.log(`   Notes: ${p.notes}`);
        if (p.notes.includes('Renovación') || p.notes.includes('renewal')) {
          console.log(`   🔄 ¡RENOVACIÓN DETECTADA!`);
        }
      }
      console.log('');
    });
  } else {
    console.log('⚠️  No hay compras registradas');
  }
  
  // Verificar indicator_access_log por user_id
  console.log('\n═'.repeat(60));
  console.log('\n🔍 Verificando indicator_access_log por user_id...\n');
  
  const userId = '71b7b58f-6c9d-4133-88e5-c69972dea205';
  
  const { data: logs, error: logsError } = await supabase
    .from('indicator_access_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (logsError) {
    console.error('❌ Error:', logsError);
    return;
  }
  
  console.log(`📋 Total de registros en log: ${logs?.length || 0}\n`);
  
  if (logs && logs.length > 0) {
    logs.forEach((log, idx) => {
      console.log(`${idx + 1}. ${log.created_at}`);
      console.log(`   Operation: ${log.operation_type || 'N/A'}`);
      console.log(`   Source: ${log.access_source || 'N/A'}`);
      console.log(`   TradingView: ${log.tradingview_username || 'N/A'}`);
      console.log(`   Indicator ID: ${log.indicator_id || 'N/A'}`);
      console.log('');
    });
  } else {
    console.log('⚠️  No hay registros en log');
  }
}

checkRenewal();

