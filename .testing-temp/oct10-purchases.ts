import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkOct10() {
  const { data } = await supabase
    .from('purchases')
    .select('order_number, customer_email, order_total_cents, currency, order_status, payment_status, is_lifetime_purchase, purchase_type, created_at, order_date')
    .gte('created_at', '2025-10-10T00:00:00')
    .lte('created_at', '2025-10-10T23:59:59')
    .order('created_at', { ascending: false });

  console.log('\n🔍 COMPRAS DEL 10 DE OCTUBRE 2025:\n');
  console.log('Total:', data?.length || 0, 'compras\n');

  const invCount = data?.filter(p => p.order_number.startsWith('INV-')).length || 0;
  const piCount = data?.filter(p => p.order_number.startsWith('PI-')).length || 0;
  const freeCount = data?.filter(p => p.order_number.startsWith('FREE-')).length || 0;

  console.log('📊 RESUMEN:');
  console.log('  - INV- (invoices - mostrados en dashboard):', invCount);
  console.log('  - PI- (payment intents - ocultos):', piCount);
  console.log('  - FREE- (planes gratis):', freeCount);
  console.log('\n');

  data?.forEach((p, i) => {
    const prefix = p.order_number.startsWith('INV-') ? '✅ INV' : 
                   p.order_number.startsWith('FREE-') ? '🆓 FREE' : '❌ PI';
    console.log(`${i+1}. [${prefix}] ${p.customer_email}`);
    console.log(`   Order: ${p.order_number}`);
    console.log(`   Monto: $${p.order_total_cents/100} ${p.currency}`);
    console.log(`   Status: ${p.order_status} / ${p.payment_status || 'NULL'}`);
    console.log(`   Type: ${p.purchase_type}`);
    console.log(`   Lifetime: ${p.is_lifetime_purchase}`);
    console.log(`   Created: ${p.created_at}`);
    console.log('');
  });
}

checkOct10();

