import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function forceSyncRefunds(userId: string) {
  console.log('🔄 Forzando sincronización de refunds...\n');

  // Obtener todos los payment intents del usuario
  const { data: paymentIntents, error } = await supabase
    .from('payment_intents')
    .select('id, amount')
    .eq('user_id', userId)
    .eq('status', 'succeeded');

  if (error || !paymentIntents) {
    console.error('❌ Error obteniendo payment intents:', error);
    return;
  }

  console.log(`📋 Encontrados ${paymentIntents.length} payment intents\n`);

  let updated = 0;
  let withRefunds = 0;

  for (const pi of paymentIntents) {
    try {
      // Obtener payment intent de Stripe con charges expandidos
      const stripePI = await stripe.paymentIntents.retrieve(pi.id, {
        expand: ['charges.data.refunds']
      });

      // Extraer refunds
      const charges = (stripePI as any).charges?.data || [];
      const refunds = charges[0]?.refunds?.data || [];
      const amountRefunded = refunds.reduce((sum: number, r: any) => sum + r.amount, 0);
      const isFullyRefunded = amountRefunded >= pi.amount;

      if (refunds.length > 0) {
        withRefunds++;
        console.log(`💸 REFUND DETECTADO: ${pi.id}`);
        console.log(`   Original: $${(pi.amount / 100).toFixed(2)}`);
        console.log(`   Reembolsado: $${(amountRefunded / 100).toFixed(2)}`);
        console.log(`   Refunds: ${refunds.length}`);
        
        // Actualizar en Supabase
        const { error: updateError } = await supabase
          .from('payment_intents')
          .update({
            amount_refunded: amountRefunded,
            refunded: isFullyRefunded,
            refunds: refunds.map((r: any) => ({
              id: r.id,
              amount: r.amount,
              currency: r.currency,
              reason: r.reason,
              status: r.status,
              created: r.created
            })),
            last_refund_at: new Date(Math.max(...refunds.map((r: any) => r.created)) * 1000).toISOString(),
            updated: new Date().toISOString()
          })
          .eq('id', pi.id);

        if (updateError) {
          console.error(`   ❌ Error actualizando: ${updateError.message}`);
        } else {
          updated++;
          console.log(`   ✅ Actualizado en Supabase\n`);
        }
      } else {
        console.log(`✓ ${pi.id} - Sin refunds`);
      }

      // Pequeña pausa para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error: any) {
      console.error(`❌ Error procesando ${pi.id}:`, error.message);
    }
  }

  console.log('\n============================================================');
  console.log('✅ SINCRONIZACIÓN DE REFUNDS COMPLETADA');
  console.log('============================================================');
  console.log(`Payment Intents procesados: ${paymentIntents.length}`);
  console.log(`Con refunds detectados: ${withRefunds}`);
  console.log(`Actualizados en Supabase: ${updated}`);
  console.log('============================================================\n');
}

// Ejecutar
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Uso: npx tsx scripts/force-sync-refunds.ts <user_id>');
  process.exit(1);
}

forceSyncRefunds(userId).catch(console.error);

