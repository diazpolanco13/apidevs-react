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

async function importUsers() {
  console.log('🚀 Iniciando migración de usuarios...');
  
  const users = [];
  let totalUsers = 0;
  let successCount = 0;
  let errorCount = 0;
  
  // Leer CSV
  return new Promise((resolve, reject) => {
    fs.createReadStream('../clientes_supabase_migrados.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Transformar datos del CSV
        const user = {
          email: row.email?.toLowerCase().trim(),
          full_name: row.full_name?.trim(),
          country: row.country === 'UNKNOWN' ? null : row.country,
          city: row.city?.toLowerCase() === 'caracas' ? 'Caracas' : row.city,
          phone: row.phone || null,
          postal_code: row.postal_code || null,
          address: row.address || null,
          wordpress_username: row.wordpress_username || null,
          billing_email: row.billing_email?.toLowerCase().trim(),
          wordpress_created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
          migration_status: 'imported',
          migrated_at: new Date().toISOString(),
          
          // 🏆 CAMPOS LEGACY CUSTOMER
          customer_type: 'legacy',
          legacy_customer: true,
          legacy_benefits: {
            'grandfathered_pricing': true,
            'priority_support': true,
            'exclusive_indicators': true,
            'early_access': true
          },
          legacy_discount_percentage: 50, // 50% descuento para legacy
          wordpress_customer_id: row.wordpress_username,
          
          // 📊 TRACKING DE REACTIVACIÓN
          reactivation_status: 'pending', // Estado inicial
          reactivated_at: null, // Se actualiza cuando se reactive
          first_new_subscription_id: null, // Se llena con primera suscripción
          reactivation_campaign: null, // Se asigna según campaña
          days_to_reactivation: null // Se calcula automáticamente
        };
        
        // Validar email
        if (user.email && user.email.includes('@')) {
          users.push(user);
          totalUsers++;
        }
      })
      .on('end', async () => {
        console.log(`📊 Total de usuarios a migrar: ${totalUsers}`);
        
        // Migrar en lotes de 100
        const batchSize = 100;
        for (let i = 0; i < users.length; i += batchSize) {
          const batch = users.slice(i, i + batchSize);
          
          try {
            console.log(`📦 Procesando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(users.length/batchSize)}...`);
            
            const { data, error } = await supabase
              .from('legacy_users')
              .upsert(batch, { 
                onConflict: 'email',
                ignoreDuplicates: false 
              });
            
            if (error) {
              console.error(`❌ Error en lote ${Math.floor(i/batchSize) + 1}:`, error);
              errorCount += batch.length;
            } else {
              console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} completado`);
              successCount += batch.length;
            }
            
            // Pausa entre lotes
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (err) {
            console.error(`💥 Error crítico en lote ${Math.floor(i/batchSize) + 1}:`, err);
            errorCount += batch.length;
          }
        }
        
        // Resumen final
        console.log('\n🎯 RESUMEN DE MIGRACIÓN:');
        console.log(`✅ Usuarios migrados exitosamente: ${successCount}`);
        console.log(`❌ Errores: ${errorCount}`);
        console.log(`📊 Total procesados: ${successCount + errorCount}`);
        console.log(`🔥 Tasa de éxito: ${((successCount / totalUsers) * 100).toFixed(2)}%`);
        
        resolve();
      })
      .on('error', reject);
  });
}

// Ejecutar migración
if (require.main === module) {
  importUsers()
    .then(() => {
      console.log('🚀 Migración completada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en migración:', error);
      process.exit(1);
    });
}

module.exports = { importUsers };
