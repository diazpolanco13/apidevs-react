/**
 * Script para migrar GIFs/WebP optimizados a Supabase Storage
 * 
 * 1. Crea bucket 'static-assets' (si no existe)
 * 2. Sube los archivos WebP optimizados
 * 3. Genera URLs públicas
 * 4. Muestra comandos para actualizar el código
 * 
 * Uso:
 *   npm run migrate-gifs-to-supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import path from 'path';
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

const BUCKET_NAME = 'static-assets';
const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Archivos a subir
const FILES_TO_UPLOAD = [
  {
    local: path.join(PUBLIC_DIR, 'chatbot-boton.webp'),
    remote: 'animations/chatbot-boton.webp',
    contentType: 'image/webp'
  },
  {
    local: path.join(PUBLIC_DIR, 'buho-leyendo.webp'),
    remote: 'animations/buho-leyendo.webp',
    contentType: 'image/webp'
  }
];

async function createBucketIfNotExists() {
  console.log('\n📦 Verificando bucket "static-assets"...');
  
  // Verificar si el bucket existe
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('❌ Error listando buckets:', listError);
    throw listError;
  }

  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

  if (bucketExists) {
    console.log('✅ Bucket "static-assets" ya existe');
    return;
  }

  // Crear bucket público
  console.log('🔨 Creando bucket "static-assets"...');
  const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 10485760, // 10 MB
    allowedMimeTypes: ['image/webp', 'image/gif', 'image/png', 'image/jpeg', 'video/mp4', 'video/webm']
  });

  if (error) {
    console.error('❌ Error creando bucket:', error);
    throw error;
  }

  console.log('✅ Bucket "static-assets" creado exitosamente');
}

async function createStoragePolicies() {
  console.log('\n🔐 Configurando políticas RLS para Storage...');

  try {
    // Política 1: Public Read (cualquiera puede ver)
    await supabase.rpc('exec_sql', {
    sql: `
      CREATE POLICY IF NOT EXISTS "Public read access for static assets"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = '${BUCKET_NAME}');
    `
  } as any); // Tipo temporal para evitar error de TypeScript con mcp_supabase

    console.log('✅ Políticas RLS configuradas');
  } catch (error: any) {
    console.warn('⚠️  No se pudieron crear políticas automáticamente');
    console.warn('   Deberás crearlas manualmente en Supabase Dashboard');
    console.warn('   (Esto es normal, las políticas se pueden crear después)');
  }
}

async function uploadFile(file: typeof FILES_TO_UPLOAD[0]) {
  console.log(`\n📤 Subiendo: ${path.basename(file.local)}`);
  
  try {
    // Leer archivo
    const fileBuffer = await readFile(file.local);
    const fileSize = fileBuffer.length;
    
    console.log(`   📦 Tamaño: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(file.remote, fileBuffer, {
        contentType: file.contentType,
        upsert: true, // Sobrescribir si existe
        cacheControl: '31536000' // Cache por 1 año (archivos estáticos)
      });

    if (error) {
      throw error;
    }

    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(file.remote);

    console.log(`   ✅ Subido exitosamente`);
    console.log(`   🌐 URL: ${publicUrlData.publicUrl}`);

    return {
      success: true,
      local: file.local,
      remote: file.remote,
      url: publicUrlData.publicUrl
    };
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
    return {
      success: false,
      local: file.local,
      remote: file.remote,
      error: error.message
    };
  }
}

async function main() {
  console.log('🚀 Migración de GIFs/WebP a Supabase Storage\n');
  console.log('='.repeat(60));

  try {
    // 1. Crear bucket
    await createBucketIfNotExists();

    // 2. Configurar políticas (best effort)
    await createStoragePolicies();

    // 3. Subir archivos
    console.log('\n📤 Subiendo archivos...');
    const results = [];
    
    for (const file of FILES_TO_UPLOAD) {
      const result = await uploadFile(file);
      results.push(result);
      
      // Pequeña pausa entre archivos
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // 4. Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(60));

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`\n✅ Exitosos: ${successful.length}/${results.length}`);
    
    if (successful.length > 0) {
      console.log('\n🌐 URLs Públicas de Supabase:');
      successful.forEach(({ remote, url }) => {
        console.log(`   • ${remote}`);
        console.log(`     ${url}`);
      });
    }

    if (failed.length > 0) {
      console.log(`\n❌ Fallidos: ${failed.length}`);
      failed.forEach(({ remote, error }) => {
        console.log(`   • ${remote}: ${error}`);
      });
    }

    // 5. Instrucciones para actualizar código
    console.log('\n' + '='.repeat(60));
    console.log('🔄 PRÓXIMOS PASOS');
    console.log('='.repeat(60));
    
    if (successful.length > 0) {
      console.log('\nActualiza estas URLs en tu código:\n');
      
      successful.forEach(({ remote, url }) => {
        const filename = path.basename(remote, '.webp');
        console.log(`📝 ${filename}:`);
        console.log(`   ANTES: /${filename}.webp`);
        console.log(`   DESPUÉS: ${url}`);
        console.log('');
      });

      console.log('Archivos a modificar:');
      console.log('   • components/chat-widget.tsx');
      console.log('   • components/chat-auth.tsx\n');
      
      console.log('💡 Beneficios:');
      console.log('   ✅ CDN global de Supabase');
      console.log('   ✅ Cache optimizado (1 año)');
      console.log('   ✅ No ocupan espacio en bundle de Next.js');
      console.log('   ✅ Carga más rápida desde edge locations\n');
    }

    console.log('='.repeat(60) + '\n');

    if (failed.length > 0) {
      process.exit(1);
    }

  } catch (error: any) {
    console.error('\n💥 Error fatal:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('✨ Migración completada exitosamente!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });

