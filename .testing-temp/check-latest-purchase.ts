// Script para verificar la compra más reciente
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkLatestPurchase() {
  console.log('\n🔍 ========== VERIFICACIÓN COMPRA MÁS RECIENTE ==========\n');
  
  // Últimas 5 compras de CUALQUIER usuario
  const { data: latest, error } = await supabase
    .from('purchases')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`📊 ÚLTIMAS 5 COMPRAS EN SUPABASE:\n`);
  
  latest?.forEach((p, i) => {
    const isRecent = (Date.now() - new Date(p.created_at).getTime()) < 5 * 60 * 1000; // Últimos 5 min
    const timeAgo = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 1000 / 60);
    
    console.log(`${i + 1}. ${isRecent ? '🆕 RECIENTE' : ''}`);
    console.log(`   Email: ${p.customer_email}`);
    console.log(`   Order #: ${p.order_number}`);
    console.log(`   Monto: $${p.order_total_cents / 100} ${p.currency}`);
    console.log(`   Status: ${p.order_status}`);
    console.log(`   Created: ${p.created_at} (hace ${timeAgo} min)`);
    console.log(`   Order Date: ${p.order_date}`);
    console.log(`   Purchase Type: ${p.purchase_type}`);
    console.log(`   Payment Status: ${p.payment_status || 'NULL'}`);
    console.log('');
  });
  
  // Verificar si hay alguna compra en los últimos 5 minutos
  const recentPurchases = latest?.filter(p => 
    (Date.now() - new Date(p.created_at).getTime()) < 5 * 60 * 1000
  );
  
  if (recentPurchases && recentPurchases.length > 0) {
    console.log(`✅ Se encontraron ${recentPurchases.length} compra(s) en los últimos 5 minutos\n`);
  } else {
    console.log(`⚠️  No hay compras en los últimos 5 minutos\n`);
  }
  
  // Contar por tipo de order_number
  const { data: allPurchases } = await supabase
    .from('purchases')
    .select('order_number')
    .order('created_at', { ascending: false })
    .limit(50);
  
  const invCount = allPurchases?.filter(p => p.order_number.startsWith('INV-')).length || 0;
  const piCount = allPurchases?.filter(p => p.order_number.startsWith('PI-')).length || 0;
  const freeCount = allPurchases?.filter(p => p.order_number.startsWith('FREE-')).length || 0;
  
  console.log('📈 ESTADÍSTICAS (últimas 50 compras):');
  console.log(`   INV- (invoices): ${invCount}`);
  console.log(`   PI- (payment intents): ${piCount}`);
  console.log(`   FREE- (planes gratis): ${freeCount}`);
  
  console.log('\n========================================\n');
}

checkLatestPurchase();

