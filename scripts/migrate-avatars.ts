/**
 * Script de migración de avatares de TradingView a Supabase Storage
 * 
 * Este script:
 * 1. Busca usuarios con avatares que apunten a TradingView
 * 2. Descarga, optimiza y sube cada imagen a Supabase Storage
 * 3. Actualiza el avatar_url en la base de datos
 * 
 * Uso:
 *   npm run migrate-avatars
 */

import { createClient } from '@supabase/supabase-js';
import { downloadAndOptimizeAvatar } from '../utils/images/optimize-avatar';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno faltantes');
  console.error('Necesitas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Cliente admin de Supabase (bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Sube un avatar optimizado a Supabase Storage
 */
async function uploadToStorage(
  userId: string,
  optimizedBuffer: Buffer
): Promise<string> {
  const fileName = `${userId}.webp`;
  const filePath = `avatars/${fileName}`;

  // Subir a Supabase Storage
  const { data, error } = await supabase.storage
    .from('user-avatars')
    .upload(filePath, optimizedBuffer, {
      contentType: 'image/webp',
      upsert: true // Sobrescribir si ya existe
    });

  if (error) {
    throw new Error(`Error subiendo imagen: ${error.message}`);
  }

  // Obtener URL pública
  const { data: publicUrlData } = supabase.storage
    .from('user-avatars')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Migra un avatar individual
 */
async function migrateAvatar(userId: string, currentAvatarUrl: string, username: string) {
  try {
    console.log(`📥 Procesando: ${username} (${userId})`);

    // 1. Descargar y optimizar
    const optimizedBuffer = await downloadAndOptimizeAvatar(currentAvatarUrl);

    // 2. Subir a Supabase Storage
    const supabaseUrl = await uploadToStorage(userId, optimizedBuffer);

    // 3. Actualizar base de datos
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: supabaseUrl })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ ${username} migrado exitosamente`);
    console.log(`   Antes: ${currentAvatarUrl.substring(0, 50)}...`);
    console.log(`   Después: ${supabaseUrl.substring(0, 50)}...`);
    
    return { success: true, username };
  } catch (error: any) {
    console.error(`❌ Error en ${username}:`, error.message);
    return { success: false, username, error: error.message };
  }
}

/**
 * Función principal de migración
 */
async function migrateAvatars() {
  console.log('🚀 Iniciando migración de avatares...\n');

  // Obtener usuarios con avatares de TradingView
  const { data: users, error } = await supabase
    .from('users')
    .select('id, avatar_url, tradingview_username, full_name')
    .like('avatar_url', '%tradingview.com%')
    .not('tradingview_username', 'is', null);

  if (error) {
    console.error('❌ Error obteniendo usuarios:', error);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log('✅ No hay avatares para migrar');
    console.log('Todos los usuarios ya tienen avatares optimizados o no tienen avatar.');
    return;
  }

  console.log(`📊 Encontrados ${users.length} usuarios con avatares de TradingView\n`);

  const results = {
    total: users.length,
    success: 0,
    failed: 0,
    errors: [] as Array<{ username: string; error: string }>
  };

  // Migrar cada usuario
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    console.log(`\n[${i + 1}/${users.length}] ========================================`);

    const result = await migrateAvatar(
      user.id,
      user.avatar_url,
      user.tradingview_username || user.full_name || 'Unknown'
    );

    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push({
        username: result.username,
        error: result.error || 'Unknown error'
      });
    }

    // Pequeña pausa para no saturar la API (opcional)
    if (i < users.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Resumen final
  console.log('\n\n' + '='.repeat(60));
  console.log('🎉 Migración completada');
  console.log('='.repeat(60));
  console.log(`✅ Exitosos: ${results.success}/${results.total}`);
  console.log(`❌ Fallidos: ${results.failed}/${results.total}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errores encontrados:');
    results.errors.forEach(({ username, error }) => {
      console.log(`   - ${username}: ${error}`);
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// Ejecutar migración
migrateAvatars()
  .then(() => {
    console.log('🏁 Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });

