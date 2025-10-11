import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno PRIMERO
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Importar después de cargar variables
import { writeClient } from '../lib/sanity/client';

// Cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Función para generar slug desde el nombre
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
    .trim();
}

// Función para subir imagen a Sanity
async function uploadImageToSanity(imageUrl: string, altText: string) {
  if (!imageUrl) return null;

  try {
    // Si es una URL completa, fetch la imagen
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const blob = Buffer.from(buffer);

    // Subir a Sanity
    const asset = await writeClient.assets.upload('image', blob, {
      filename: altText.replace(/\s+/g, '-').toLowerCase() + '.png',
    });

    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
      alt: altText,
    };
  } catch (error) {
    console.error(`❌ Error uploading image: ${imageUrl}`, error);
    return null;
  }
}

async function migrateIndicators() {
  console.log('🚀 Iniciando migración de indicadores de Supabase a Sanity...\n');

  try {
    // 1. Obtener indicadores de Supabase
    console.log('📊 Obteniendo indicadores de Supabase...');
    const { data: indicators, error } = await supabase
      .from('indicators')
      .select('*')
      .eq('status', 'activo')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error obteniendo indicadores: ${error.message}`);
    }

    if (!indicators || indicators.length === 0) {
      console.log('⚠️  No se encontraron indicadores en Supabase');
      return;
    }

    console.log(`✅ Encontrados ${indicators.length} indicadores\n`);

    // 2. Migrar cada indicador
    for (const indicator of indicators) {
      console.log(`\n📝 Migrando: ${indicator.name}`);
      console.log(`   Pine ID: ${indicator.pine_id}`);

      const slug = generateSlug(indicator.name);
      console.log(`   Slug generado: ${slug}`);

      // Verificar si ya existe en Sanity
      const existing = await writeClient.fetch(
        `*[_type == "indicator" && pineId == $pineId][0]`,
        { pineId: indicator.pine_id }
      );

      if (existing) {
        console.log(`   ⚠️  Ya existe en Sanity, saltando...`);
        continue;
      }

      // Preparar imagen principal
      let mainImage = null;
      if (indicator.image_1) {
        console.log('   📸 Subiendo imagen principal...');
        mainImage = await uploadImageToSanity(indicator.image_1, indicator.name);
      }

      // Preparar galería
      const gallery = [];
      if (indicator.image_2) {
        console.log('   📸 Subiendo imagen 2...');
        const img = await uploadImageToSanity(
          indicator.image_2,
          `${indicator.name} - Screenshot 2`
        );
        if (img) gallery.push(img);
      }
      if (indicator.image_3) {
        console.log('   📸 Subiendo imagen 3...');
        const img = await uploadImageToSanity(
          indicator.image_3,
          `${indicator.name} - Screenshot 3`
        );
        if (img) gallery.push(img);
      }

      // Preparar features desde JSONB si existe
      let features = [];
      if (indicator.features && Array.isArray(indicator.features)) {
        features = indicator.features;
      }

      // Preparar tags
      let tags = [];
      if (indicator.tags && Array.isArray(indicator.tags)) {
        tags = indicator.tags;
      }

      // Crear documento en Sanity
      const sanityDoc = {
        _type: 'indicator',
        pineId: indicator.pine_id,
        slug: {
          _type: 'slug',
          current: slug,
        },
        title: indicator.name,
        shortDescription: indicator.description || `${indicator.name} - Indicador profesional para TradingView`,
        mainImage,
        gallery,
        features,
        videoUrl: indicator.tradingview_url || '',
        content: [
          {
            _type: 'block',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: indicator.description || `${indicator.name} es un indicador profesional diseñado para mejorar tu análisis técnico en TradingView.`,
              },
            ],
          },
        ],
        seo: {
          metaTitle: indicator.name,
          metaDescription: indicator.description || `${indicator.name} - Indicador profesional`,
          keywords: tags,
        },
        publishedAt: indicator.created_at || new Date().toISOString(),
      };

      // Crear en Sanity
      console.log('   💾 Creando documento en Sanity...');
      const result = await writeClient.create(sanityDoc);
      console.log(`   ✅ Creado con ID: ${result._id}`);
    }

    console.log('\n\n🎉 ¡Migración completada exitosamente!');
    console.log(`\n📊 Resumen:`);
    console.log(`   - Total procesados: ${indicators.length}`);
    console.log(`\n✨ Ahora puedes ver los indicadores en: http://localhost:3000/studio`);
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateIndicators();

