#!/usr/bin/env tsx
/**
 * Script para sincronizar productos y precios desde Stripe a Supabase
 * Ejecutar: npx tsx scripts/sync-products-from-stripe.ts
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Validar variables de entorno
const stripeKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno requeridas');
  console.error('   STRIPE_SECRET_KEY:', !!stripeKey);
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

// Inicializar clientes
const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-09-30.clover' as any,
});

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncProducts() {
  console.log('🔄 Iniciando sincronización de productos desde Stripe...\n');

  try {
    // 1. Obtener todos los productos activos de Stripe
    const { data: products } = await stripe.products.list({
      active: true,
      limit: 100,
    });

    console.log(`📦 Productos encontrados en Stripe: ${products.length}\n`);

    // 2. Sincronizar cada producto
    for (const product of products) {
      console.log(`📦 Producto: ${product.name} (${product.id})`);

      // Insertar/actualizar producto en Supabase
      const { error: productError } = await supabase
        .from('products')
        .upsert({
          id: product.id,
          active: product.active,
          name: product.name,
          description: product.description || null,
          image: product.images?.[0] || null,
          metadata: product.metadata || {},
        });

      if (productError) {
        console.error(`   ❌ Error al sincronizar producto: ${productError.message}`);
        continue;
      }

      console.log(`   ✅ Producto sincronizado`);

      // 3. Obtener precios del producto
      const { data: prices } = await stripe.prices.list({
        product: product.id,
        limit: 100,
      });

      console.log(`   💵 Precios encontrados: ${prices.length}`);

      // 4. Sincronizar cada precio
      for (const price of prices) {
        const priceData = {
          id: price.id,
          product_id: typeof price.product === 'string' ? price.product : price.product.id,
          active: price.active,
          description: null,
          unit_amount: price.unit_amount,
          currency: price.currency,
          type: price.type,
          interval: price.recurring?.interval || null,
          interval_count: price.recurring?.interval_count || null,
          trial_period_days: price.recurring?.trial_period_days || null,
          metadata: price.metadata || {},
        };

        const { error: priceError } = await supabase
          .from('prices')
          .upsert(priceData);

        if (priceError) {
          console.error(`      ❌ Error al sincronizar precio ${price.id}: ${priceError.message}`);
        } else {
          const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'Gratis';
          const interval = price.recurring ? ` / ${price.recurring.interval}` : '';
          console.log(`      ✅ Precio sincronizado: ${amount}${interval}`);
        }
      }

      console.log('');
    }

    console.log('============================================================');
    console.log('✅ SINCRONIZACIÓN COMPLETADA');
    console.log('============================================================');
    console.log(`Productos sincronizados: ${products.length}`);
    console.log('============================================================\n');

  } catch (error: any) {
    console.error('❌ Error durante la sincronización:', error.message);
    process.exit(1);
  }
}

// Ejecutar sincronización
syncProducts();

