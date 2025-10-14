import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity/client';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 60; // ISR: Revalidar cada 60 segundos

export async function GET() {
  try {
    // 1. Obtener contenido de Sanity
    const sanityIndicators = await client.fetch(
      `*[_type == "indicator"] | order(publishedAt desc) {
        pineId,
        "slug": slug.current,
        title,
        shortDescription,
        "image": mainImage.asset->url,
        features,
        publishedAt
      }`
    );

    // 2. Obtener datos técnicos de Supabase
    const supabase = await createClient();
    const { data: supabaseIndicators } = await supabase
      .from('indicators')
      .select('pine_id, access_tier, category, status, type')
      .eq('status', 'activo');

    // 3. Combinar datos
    const combinedIndicators = sanityIndicators.map((sanityInd: any) => {
      const technical = supabaseIndicators?.find(
        (sup: any) => sup.pine_id === sanityInd.pineId
      );

      return {
        id: sanityInd.pineId,
        slug: sanityInd.slug,
        title: sanityInd.title,
        description: sanityInd.shortDescription || '',
        category: (technical as any)?.access_tier || 'free', // 'free' | 'premium'
        type: (technical as any)?.category || 'indicador', // 'indicador' | 'escaner' | 'tools'
        tags: sanityInd.features?.slice(0, 3) || [],
        image: sanityInd.image || '/images/indicators/default.png',
        publishedAt: sanityInd.publishedAt || new Date().toISOString(),
      };
    });

    return NextResponse.json({
      indicators: combinedIndicators,
      total: combinedIndicators.length,
    });
  } catch (error) {
    console.error('Error fetching indicators:', error);
    return NextResponse.json(
      { error: 'Error obteniendo indicadores' },
      { status: 500 }
    );
  }
}

