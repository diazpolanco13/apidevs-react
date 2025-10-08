import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyRenewalResults(email: string) {
  console.log(`\n🔍 Verificando resultados para: ${email}\n`);
  console.log('═'.repeat(60));
  
  // 1. Verificar registros en indicator_access_log
  const { data: logs, error: logsError } = await supabase
    .from('indicator_access_log')
    .select('*')
    .eq('customer_email', email)
    .order('created_at', { ascending: false });
  
  if (logsError) {
    console.error('❌ Error obteniendo logs:', logsError);
    return;
  }
  
  console.log(`\n📋 REGISTROS EN indicator_access_log: ${logs?.length || 0}\n`);
  
  if (logs && logs.length > 0) {
    logs.forEach((log, idx) => {
      console.log(`${idx + 1}. ${log.created_at}`);
      console.log(`   Operation: ${log.operation_type}`);
      console.log(`   Source: ${log.access_source}`);
      console.log(`   Billing Reason: ${log.billing_reason || 'N/A'}`);
      console.log(`   Duration: ${log.duration_type || 'N/A'}`);
      console.log(`   Indicators Granted: ${log.indicators_granted || 'N/A'}`);
      console.log(`   Invoice ID: ${log.invoice_id || 'N/A'}`);
      console.log('');
    });
  } else {
    console.log('   ⚠️  No hay registros aún');
  }
  
  // 2. Verificar compras
  const { data: purchases, error: purchasesError } = await supabase
    .from('purchases')
    .select('order_number, order_date, order_status, order_total_cents, product_name, notes')
    .eq('customer_email', email)
    .order('order_date', { ascending: false });
  
  if (purchasesError) {
    console.error('❌ Error obteniendo compras:', purchasesError);
    return;
  }
  
  console.log('═'.repeat(60));
  console.log(`\n💰 COMPRAS REGISTRADAS: ${purchases?.length || 0}\n`);
  
  if (purchases && purchases.length > 0) {
    purchases.forEach((purchase, idx) => {
      console.log(`${idx + 1}. ${purchase.order_date}`);
      console.log(`   Order: ${purchase.order_number}`);
      console.log(`   Status: ${purchase.order_status}`);
      console.log(`   Total: $${(purchase.order_total_cents / 100).toFixed(2)}`);
      console.log(`   Product: ${purchase.product_name}`);
      if (purchase.notes && purchase.notes.includes('Renovación')) {
        console.log(`   🔄 RENOVACIÓN DETECTADA`);
      }
      console.log('');
    });
  } else {
    console.log('   ⚠️  No hay compras registradas');
  }
  
  console.log('═'.repeat(60));
  
  // 3. Resumen de validación
  const renewalLogs = logs?.filter(l => 
    l.billing_reason === 'subscription_cycle' || 
    l.access_source === 'renewal'
  ) || [];
  
  const renewalPurchases = purchases?.filter(p => 
    p.notes && p.notes.includes('Renovación')
  ) || [];
  
  console.log('\n✅ RESUMEN DE VALIDACIÓN:\n');
  console.log(`   Logs de renovación: ${renewalLogs.length}`);
  console.log(`   Compras de renovación: ${renewalPurchases.length}`);
  
  if (renewalLogs.length > 0 && renewalPurchases.length > 0) {
    console.log('\n   🎉 ¡RENOVACIÓN EXITOSA!');
    
    renewalLogs.forEach(log => {
      console.log(`\n   📊 Detalle de renovación:`);
      console.log(`      - Duración: ${log.duration_type}`);
      console.log(`      - Indicadores concedidos: ${log.indicators_granted}`);
      console.log(`      - Billing reason: ${log.billing_reason}`);
    });
  } else {
    console.log('\n   ⚠️  Aún no se detectó renovación');
    console.log('      Espera a que se procese el webhook después de avanzar el Test Clock');
  }
  
  console.log('\n');
}

// Verificar ambos emails de prueba
const testEmails = [
  'test-monthly@apidevs.io',
  'test-annual@apidevs.io'
];

async function runAll() {
  for (const email of testEmails) {
    await verifyRenewalResults(email);
  }
}

runAll();

