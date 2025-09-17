const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Configuración Supabase:');
console.log('   URL:', supabaseUrl ? '✅ Configurado' : '❌ Faltante');
console.log('   Key:', supabaseKey ? '✅ Configurado' : '❌ Faltante');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes. Verifica .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para detectar si es producto Lifetime
function isLifetimeProduct(productName, orderTotal) {
  if (!productName) return false;
  
  const lifetimeKeywords = ['lifetime', 'de por vida', 'permanente', 'forever'];
  const productLower = productName.toLowerCase();
  
  // Por keywords
  if (lifetimeKeywords.some(keyword => productLower.includes(keyword))) {
    return true;
  }
  
  // Por precio (productos de $900+ probablemente sean Lifetime)
  if (orderTotal >= 900) {
    return true;
  }
  
  return false;
}

// Función para categorizar producto
function categorizeProduct(productName) {
  if (!productName) return 'unknown';
  
  const productLower = productName.toLowerCase();
  
  if (productLower.includes('mensual') || productLower.includes('monthly')) {
    return 'monthly';
  }
  if (productLower.includes('semestral') || productLower.includes('semester')) {
    return 'semester';
  }
  if (productLower.includes('anual') || productLower.includes('annual') || productLower.includes('yearly')) {
    return 'annual';
  }
  if (productLower.includes('lifetime') || productLower.includes('de por vida')) {
    return 'lifetime';
  }
  
  return 'standard';
}

// Función para normalizar método de pago
function normalizePaymentMethod(paymentMethod) {
  if (!paymentMethod) return 'unknown';
  
  const methodLower = paymentMethod.toLowerCase();
  
  if (methodLower.includes('stripe') || methodLower.includes('tarjeta') || methodLower.includes('apple pay')) {
    return 'stripe';
  }
  if (methodLower.includes('paypal')) {
    return 'paypal';
  }
  if (methodLower.includes('cripto') || methodLower.includes('crypto') || methodLower.includes('binance')) {
    return 'binance';
  }
  
  return 'other';
}

// Función para parsear fecha DD/MM/YYYY HH:MM
function parseCustomDate(dateString) {
  if (!dateString) return null;
  
  try {
    // Formato esperado: "07/09/2025 00:56"
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hour, minute] = (timePart || '00:00').split(':');
    
    // Crear fecha en formato correcto
    const date = new Date(year, month - 1, day, hour, minute);
    
    // Validar que la fecha es válida
    if (isNaN(date.getTime())) {
      console.log(`⚠️  Fecha inválida: ${dateString}`);
      return null;
    }
    
    return date.toISOString();
  } catch (error) {
    console.log(`⚠️  Error parseando fecha: ${dateString}`, error);
    return null;
  }
}

// Función para vincular con usuario legacy
async function findLegacyUser(email) {
  const { data, error } = await supabase
    .from('legacy_users')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .single();
    
  if (error || !data) {
    return null;
  }
  
  return data.id;
}

async function importPurchases() {
  console.log('🚀 Iniciando migración de compras...');
  
  const purchases = [];
  let totalProcessed = 0;
  let validPurchases = 0;
  let failedPurchases = 0;
  let successCount = 0;
  let errorCount = 0;
  
  // Leer CSV
  return new Promise((resolve, reject) => {
    fs.createReadStream('../compras_supabase_migradas.csv')
      .pipe(csv())
      .on('data', (row) => {
        totalProcessed++;
        
        // ❌ SOLO DESCARTAR FAILED (pagos que nunca se procesaron)
        if (row.order_status === 'failed') {
          failedPurchases++;
          return; // Skip failed orders
        }
        
        // ✅ INCLUIR TODOS LOS ESTADOS VÁLIDOS PARA ANÁLISIS
        const validStatuses = ['processing', 'completed', 'refunded', 'pending', 'on-hold', 'cancelled'];
        if (!validStatuses.includes(row.order_status)) {
          console.log(`⚠️  Estado desconocido: ${row.order_status} en orden ${row.order_number}`);
          return;
        }
        
        validPurchases++;
        
        // Transformar datos del CSV
        const orderTotal = parseFloat(row.order_total) || 0;
        const purchase = {
          order_number: row.order_number,
          wordpress_order_id: row.order_number,
          customer_email: row.customer_email?.toLowerCase().trim(),
          order_date: parseCustomDate(row.order_date),
          order_status: row.order_status, // Mantener estado original para análisis
          payment_status: row.order_status === 'refunded' ? 'refunded' : 
                         row.order_status === 'pending' ? 'pending' :
                         row.order_status === 'on-hold' ? 'on_hold' :
                         row.order_status === 'cancelled' ? 'cancelled' : 'paid',
          
          // Montos en centavos para precisión
          order_total_cents: Math.round(orderTotal * 100),
          subtotal_cents: Math.round((parseFloat(row.subtotal) || 0) * 100),
          discount_amount_cents: Math.round((parseFloat(row.discount_amount) || 0) * 100),
          tax_amount_cents: Math.round((parseFloat(row.tax_amount) || 0) * 100),
          refund_amount_cents: Math.round((parseFloat(row.refund_amount) || 0) * 100),
          currency: row.currency || 'USD',
          
          // Productos
          product_name: row.products_list || null,
          product_sku: `P-${row.order_number}`, // Generar SKU si no existe
          item_price_cents: Math.round(orderTotal * 100), // Asumir precio = total para productos únicos
          quantity: parseInt(row.products_count) || 1,
          
          // Detección automática de Lifetime
          is_lifetime_purchase: isLifetimeProduct(row.products_list, orderTotal),
          product_category: categorizeProduct(row.products_list),
          
          // Pago
          payment_method: normalizePaymentMethod(row.payment_method),
          payment_gateway: normalizePaymentMethod(row.payment_method),
          transaction_id: row.transaction_id || null,
          
          // Facturación
          billing_country: row.billing_country || null,
          billing_state: row.billing_state || null,
          billing_city: row.billing_city || null,
          billing_address: row.billing_address || null,
          billing_postcode: row.billing_postcode || null,
          billing_phone: row.billing_phone || null,
          
          created_at: new Date().toISOString(),
          
          // 📊 ANÁLISIS ESTRATÉGICO AUTOMÁTICO
          revenue_impact: row.order_status === 'refunded' ? 'negative' :
                         row.order_status === 'cancelled' ? 'neutral' : 'positive',
          
          customer_segment: row.order_status === 'refunded' ? 'refund_requester' :
                           ['pending', 'on-hold'].includes(row.order_status) ? 'incomplete_buyer' :
                           orderTotal >= 200 ? 'high_value' : 'regular',
          
          follow_up_opportunity: row.order_status === 'refunded' ? 'experience_survey' :
                                ['pending', 'on-hold'].includes(row.order_status) ? 'reactivation_campaign' :
                                row.order_status === 'cancelled' ? 'retention_offer' : 'none',
          
          revenue_valid_for_metrics: !['cancelled'].includes(row.order_status) // Cancelled no cuenta como ingreso real
        };
        
        purchases.push(purchase);
      })
      .on('end', async () => {
        console.log(`📊 Procesamiento completado:`);
        console.log(`   📋 Total filas procesadas: ${totalProcessed}`);
        console.log(`   ✅ Compras válidas: ${validPurchases}`);
        console.log(`   ❌ Compras failed descartadas: ${failedPurchases}`);
        console.log(`   🎯 Listo para migrar: ${purchases.length}`);
        
        // Migrar en lotes de 50
        const batchSize = 50;
        const totalBatches = Math.ceil(purchases.length / batchSize);
        
        console.log(`🔄 Migrando en ${totalBatches} lotes de ${batchSize}...`);
        
        for (let i = 0; i < purchases.length; i += batchSize) {
          const batch = purchases.slice(i, i + batchSize);
          const batchNumber = Math.floor(i / batchSize) + 1;
          
          try {
            // Vincular con usuarios legacy
            for (let purchase of batch) {
              if (purchase.customer_email) {
                purchase.legacy_user_id = await findLegacyUser(purchase.customer_email);
              }
            }
            
            console.log(`📦 Procesando lote ${batchNumber}/${totalBatches} (${batch.length} compras)...`);
            
            const { data, error } = await supabase
              .from('purchases')
              .upsert(batch, { 
                onConflict: 'order_number',
                ignoreDuplicates: false 
              });
              
            if (error) {
              console.error(`❌ Error en lote ${batchNumber}:`, error);
              errorCount += batch.length;
            } else {
              console.log(`✅ Lote ${batchNumber} completado exitosamente`);
              successCount += batch.length;
            }
            
            // Pausa entre lotes para no sobrecargar la DB
            if (i + batchSize < purchases.length) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
          } catch (err) {
            console.error(`💥 Error crítico en lote ${batchNumber}:`, err);
            errorCount += batch.length;
          }
        }
        
        // Estadísticas finales
        console.log(`\n🎯 MIGRACIÓN COMPLETADA:`);
        console.log(`   ✅ Éxitos: ${successCount}`);
        console.log(`   ❌ Errores: ${errorCount}`);
        console.log(`   📊 Tasa de éxito: ${((successCount / purchases.length) * 100).toFixed(1)}%`);
        
        resolve();
      })
      .on('error', reject);
  });
}

// Ejecutar migración
importPurchases()
  .then(() => {
    console.log('🏆 Migración de compras finalizada exitosamente!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en migración:', error);
    process.exit(1);
  });
