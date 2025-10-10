// Script para verificar qué se guardó en la tabla purchases
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkPurchaseData() {
  const email = 'pro-anual@test.com';
  
  console.log('\n🔍 ========== VERIFICACIÓN DE COMPRA ==========');
  console.log(`📧 Email: ${email}\n`);
  
  // Query 1: Todas las compras de este usuario (sin filtros)
  const { data: allPurchases, error: error1 } = await supabase
    .from('purchases')
    .select('*')
    .eq('customer_email', email)
    .order('created_at', { ascending: false });
  
  if (error1) {
    console.error('❌ Error query 1:', error1);
  } else {
    console.log(`📊 TODAS LAS COMPRAS (${allPurchases?.length || 0}):`);
    allPurchases?.forEach((p, i) => {
      console.log(`\n   Compra ${i + 1}:`);
      console.log(`   - Order Number: "${p.order_number}"`);
      console.log(`   - Starts with INV-? ${p.order_number?.startsWith('INV-') ? '✅ SÍ' : '❌ NO'}`);
      console.log(`   - Order Status: "${p.order_status}"`);
      console.log(`   - is_lifetime_purchase: ${p.is_lifetime_purchase}`);
      console.log(`   - order_total_cents: ${p.order_total_cents}`);
      console.log(`   - currency: ${p.currency}`);
      console.log(`   - payment_status: ${p.payment_status}`);
      console.log(`   - purchase_type: ${p.purchase_type}`);
      console.log(`   - created_at: ${p.created_at}`);
      console.log(`   - order_date: ${p.order_date}`);
    });
  }
  
  // Query 2: Con los filtros del dashboard
  console.log('\n\n📊 QUERY DASHBOARD (con filtros):');
  const { data: dashboardPurchases, error: error2 } = await supabase
    .from('purchases')
    .select('*')
    .eq('customer_email', email)
    .eq('is_lifetime_purchase', false)
    .eq('order_status', 'completed')
    .like('order_number', 'INV-%')
    .order('created_at', { ascending: false });
  
  if (error2) {
    console.error('❌ Error query 2:', error2);
  } else {
    console.log(`   Resultados: ${dashboardPurchases?.length || 0}`);
    if (dashboardPurchases && dashboardPurchases.length > 0) {
      console.log('   ✅ ENCONTRADO - Dashboard debería mostrarlas');
    } else {
      console.log('   ❌ NO ENCONTRADO - Por eso no aparece en dashboard');
      console.log('\n   🔍 Verificando filtros uno por uno...');
      
      // Test each filter individually
      const { data: test1 } = await supabase.from('purchases').select('count').eq('customer_email', email);
      console.log(`   - customer_email match: ${test1?.[0]?.count || 0} registros`);
      
      const { data: test2 } = await supabase.from('purchases').select('count').eq('customer_email', email).eq('is_lifetime_purchase', false);
      console.log(`   - + is_lifetime_purchase=false: ${test2?.[0]?.count || 0} registros`);
      
      const { data: test3 } = await supabase.from('purchases').select('count').eq('customer_email', email).eq('is_lifetime_purchase', false).eq('order_status', 'completed');
      console.log(`   - + order_status='completed': ${test3?.[0]?.count || 0} registros`);
      
      const { data: test4 } = await supabase.from('purchases').select('count').eq('customer_email', email).eq('is_lifetime_purchase', false).eq('order_status', 'completed').like('order_number', 'INV-%');
      console.log(`   - + order_number LIKE 'INV-%': ${test4?.[0]?.count || 0} registros`);
    }
  }
  
  console.log('\n============================================\n');
}

checkPurchaseData();

