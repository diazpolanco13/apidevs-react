/**
 * Script para calcular y asignar tiers a legacy_users basándose en sus compras históricas
 * 
 * Ejecutar con: npx tsx scripts/calculate-legacy-tiers.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env' });

// Configuración de Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Umbrales de tiers (en USD) - AJUSTADOS A DATOS REALES
const TIER_THRESHOLDS = {
  diamond: 500,   // $500+ (Top 0.5% - VIP)
  platinum: 300,  // $300-$499 (Top 2-3%)
  gold: 150,      // $150-$299 (Top 10%)
  silver: 50,     // $50-$149 (Top 30%)
  bronze: 20,     // $20-$49 (Top 45%)
  free: 0         // <$20 (Resto)
};

function calculateTier(totalSpent: number): string {
  if (totalSpent >= TIER_THRESHOLDS.diamond) return 'diamond';
  if (totalSpent >= TIER_THRESHOLDS.platinum) return 'platinum';
  if (totalSpent >= TIER_THRESHOLDS.gold) return 'gold';
  if (totalSpent >= TIER_THRESHOLDS.silver) return 'silver';
  if (totalSpent >= TIER_THRESHOLDS.bronze) return 'bronze';
  return 'free';
}

interface PurchaseRecord {
  order_number: string;
  customer_email: string;
  order_date: string;
  order_total: string;
  order_status: string;
  currency: string;
}

interface CustomerStats {
  email: string;
  total_spent: number;
  purchase_count: number;
  tier: string;
  first_purchase_date: Date | null;
  last_purchase_date: Date | null;
}

async function main() {
  console.log('🚀 Iniciando cálculo de tiers para legacy_users...\n');

  // 1. Leer CSV de compras
  const csvPath = path.join(process.cwd(), 'data', 'compras_supabase_migradas.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ No se encontró el archivo:', csvPath);
    process.exit(1);
  }

  console.log('📂 Leyendo archivo CSV:', csvPath);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  // Parsear CSV (simplificado, asumiendo que no hay comas dentro de campos)
  const headers = lines[0].split(',');
  const purchases: PurchaseRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length >= headers.length) {
      purchases.push({
        order_number: values[0],
        customer_email: values[1],
        order_date: values[2],
        order_total: values[3],
        order_status: values[11] || 'completed',
        currency: values[8] || 'USD'
      });
    }
  }

  console.log(`✅ ${purchases.length} compras leídas del CSV\n`);

  // 2. Calcular estadísticas por cliente
  const customerStatsMap = new Map<string, CustomerStats>();

  for (const purchase of purchases) {
    const email = purchase.customer_email.toLowerCase().trim();
    const total = parseFloat(purchase.order_total) || 0;
    
    // Solo contar compras completadas o procesadas
    const validStatuses = ['completed', 'processing', 'on-hold'];
    if (!validStatuses.includes(purchase.order_status.toLowerCase())) {
      continue;
    }

    if (!customerStatsMap.has(email)) {
      customerStatsMap.set(email, {
        email,
        total_spent: 0,
        purchase_count: 0,
        tier: 'free',
        first_purchase_date: null,
        last_purchase_date: null
      });
    }

    const stats = customerStatsMap.get(email)!;
    stats.total_spent += total;
    stats.purchase_count += 1;

    // Parsear fecha (formato: DD/MM/YYYY HH:MM)
    const dateParts = purchase.order_date.split(' ')[0].split('/');
    if (dateParts.length === 3) {
      const purchaseDate = new Date(
        parseInt(dateParts[2]), // year
        parseInt(dateParts[1]) - 1, // month (0-indexed)
        parseInt(dateParts[0]) // day
      );

      if (!stats.first_purchase_date || purchaseDate < stats.first_purchase_date) {
        stats.first_purchase_date = purchaseDate;
      }
      if (!stats.last_purchase_date || purchaseDate > stats.last_purchase_date) {
        stats.last_purchase_date = purchaseDate;
      }
    }
  }

  // Calcular tier para cada cliente
  for (const stats of customerStatsMap.values()) {
    stats.tier = calculateTier(stats.total_spent);
  }

  console.log(`👥 ${customerStatsMap.size} clientes únicos procesados\n`);

  // 3. Mostrar distribución de tiers
  const tierDistribution = {
    diamond: 0,
    platinum: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
    free: 0
  };

  for (const stats of customerStatsMap.values()) {
    tierDistribution[stats.tier as keyof typeof tierDistribution]++;
  }

  console.log('📊 DISTRIBUCIÓN DE TIERS:');
  console.log('═══════════════════════════════════════');
  console.log(`💎 Diamond (≥$${TIER_THRESHOLDS.diamond}):  ${tierDistribution.diamond} clientes`);
  console.log(`🏆 Platinum ($${TIER_THRESHOLDS.platinum}-$${TIER_THRESHOLDS.diamond - 1}): ${tierDistribution.platinum} clientes`);
  console.log(`🥇 Gold ($${TIER_THRESHOLDS.gold}-$${TIER_THRESHOLDS.platinum - 1}):     ${tierDistribution.gold} clientes`);
  console.log(`🥈 Silver ($${TIER_THRESHOLDS.silver}-$${TIER_THRESHOLDS.gold - 1}):   ${tierDistribution.silver} clientes`);
  console.log(`🥉 Bronze ($${TIER_THRESHOLDS.bronze}-$${TIER_THRESHOLDS.silver - 1}):    ${tierDistribution.bronze} clientes`);
  console.log(`🆓 Free (<$${TIER_THRESHOLDS.bronze}):      ${tierDistribution.free} clientes`);
  console.log('═══════════════════════════════════════\n');

  // 4. Top 10 clientes
  const topClients = Array.from(customerStatsMap.values())
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 10);

  console.log('🏆 TOP 10 CLIENTES (por gasto total):');
  console.log('═══════════════════════════════════════');
  topClients.forEach((client, index) => {
    console.log(
      `${index + 1}. ${client.email.padEnd(35)} | $${client.total_spent.toFixed(2).padStart(10)} | ${client.purchase_count} compras | ${client.tier.toUpperCase()}`
    );
  });
  console.log('═══════════════════════════════════════\n');

  // 5. Actualizar legacy_users en Supabase (OPTIMIZADO CON BATCH)
  console.log('💾 Actualizando legacy_users en Supabase...');
  
  // Primero, obtener todos los legacy_users de una sola vez
  const { data: allLegacyUsers, error: fetchError } = await supabase
    .from('legacy_users')
    .select('id, email');

  if (fetchError) {
    console.error('❌ Error obteniendo legacy_users:', fetchError);
    process.exit(1);
  }

  console.log(`📥 ${allLegacyUsers?.length || 0} legacy_users obtenidos de Supabase`);

  // Crear un mapa email -> id para lookup rápido
  const emailToIdMap = new Map<string, string>();
  for (const user of allLegacyUsers || []) {
    emailToIdMap.set(user.email.toLowerCase().trim(), user.id);
  }

  // Preparar actualizaciones en batch
  const updates = [];
  let notFound = 0;

  for (const stats of customerStatsMap.values()) {
    const userId = emailToIdMap.get(stats.email);
    
    if (!userId) {
      notFound++;
      continue;
    }

    updates.push({
      id: userId,
      customer_tier: stats.tier,
      total_lifetime_spent: stats.total_spent.toFixed(2),
      purchase_count: stats.purchase_count,
      first_purchase_date: stats.first_purchase_date?.toISOString(),
      last_purchase_date: stats.last_purchase_date?.toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  console.log(`🔄 Actualizando ${updates.length} usuarios en lotes de 100...`);

  // Actualizar en lotes de 100 usando UPDATE directo
  const BATCH_SIZE = 100;
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    
    try {
      // Usar Promise.all para actualizar en paralelo dentro del batch
      const updatePromises = batch.map(update => 
        supabase
          .from('legacy_users')
          .update({
            customer_tier: update.customer_tier,
            total_lifetime_spent: update.total_lifetime_spent,
            purchase_count: update.purchase_count,
            first_purchase_date: update.first_purchase_date,
            last_purchase_date: update.last_purchase_date,
            updated_at: update.updated_at
          })
          .eq('id', update.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Contar errores
      const batchErrors = results.filter(r => r.error).length;
      if (batchErrors > 0) {
        errors += batchErrors;
        console.error(`❌ ${batchErrors} errores en lote ${Math.floor(i / BATCH_SIZE) + 1}`);
      }
      
      const batchSuccess = batch.length - batchErrors;
      updated += batchSuccess;
      console.log(`   ✓ Lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(updates.length / BATCH_SIZE)} completado (${updated}/${updates.length})`);
      
    } catch (err) {
      console.error(`❌ Error en lote ${Math.floor(i / BATCH_SIZE) + 1}:`, err);
      errors += batch.length;
    }
  }

  console.log('\n✅ RESUMEN DE ACTUALIZACIÓN:');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Actualizados:     ${updated}`);
  console.log(`⚠️  No encontrados:  ${notFound}`);
  console.log(`❌ Errores:          ${errors}`);
  console.log('═══════════════════════════════════════\n');

  console.log('🎉 ¡Proceso completado!');
}

main().catch(console.error);

