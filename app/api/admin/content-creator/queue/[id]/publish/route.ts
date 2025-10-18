import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar autenticación
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Obtener el item de la cola
    const { data: queueItem, error: fetchError } = await (supabaseAdmin as any)
      .from('ai_content_queue')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !queueItem) {
      return NextResponse.json({ error: 'Queue item not found' }, { status: 404 });
    }

    // Verificar que esté aprobado o ya publicado (para republicar)
    if (queueItem.status !== 'approved' && queueItem.status !== 'published_in_sanity') {
      return NextResponse.json({ 
        error: `Content must be approved before publishing. Current status: ${queueItem.status}` 
      }, { status: 400 });
    }

    // Obtener configuración de Sanity
    const { data: sanityConfig } = await (supabaseAdmin as any)
      .from('system_configuration')
      .select('key, value')
      .in('key', ['sanity_project_id', 'sanity_dataset', 'sanity_token']);

    const configMap = sanityConfig?.reduce((acc: any, config: any) => {
      acc[config.key] = config.value;
      return acc;
    }, {}) || {};

    if (!configMap.sanity_project_id || !configMap.sanity_dataset || !configMap.sanity_token) {
      return NextResponse.json({ error: 'Sanity not configured' }, { status: 400 });
    }

    // Preparar los datos para crear en Sanity
    const generatedContent = queueItem.generated_content || {};
    
    // Crear documento en Sanity usando la API HTTP
    const sanityMutation = {
      mutations: [
        {
          create: {
            _type: 'post',
            language: queueItem.language,
            title: queueItem.title,
            slug: {
              _type: 'slug',
              current: generatedContent.slug || queueItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            },
            excerpt: generatedContent.excerpt || queueItem.user_prompt.substring(0, 200),
            content: [
              {
                _type: 'block',
                children: [
                  {
                    _type: 'span',
                    text: generatedContent.content || queueItem.content
                  }
                ]
              }
            ],
            tags: generatedContent.tags || ['trading'],
            readingTime: generatedContent.readingTime || 5,
            status: 'draft',
            visibility: 'public',
            seo: {
              _type: 'object',
              metaTitle: generatedContent.seo?.metaTitle || queueItem.title,
              metaDescription: generatedContent.seo?.metaDescription || generatedContent.excerpt,
              keywords: generatedContent.seo?.keywords || []
            }
          }
        }
      ]
    };

    const sanityResponse = await fetch(
      `https://${configMap.sanity_project_id}.api.sanity.io/v2021-06-07/data/mutate/${configMap.sanity_dataset}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${configMap.sanity_token}`,
        },
        body: JSON.stringify(sanityMutation),
      }
    );

    if (!sanityResponse.ok) {
      const errorText = await sanityResponse.text();
      console.error('Sanity API error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to create in Sanity',
        details: errorText
      }, { status: 500 });
    }

    const sanityResult = await sanityResponse.json();
    const sanityDocumentId = sanityResult.results?.[0]?.id || `draft.${Date.now()}`;

    console.log('Document created in Sanity:', {
      documentId: sanityDocumentId,
      title: queueItem.title
    });

    // Actualizar el item en la cola
    const { error: updateError } = await (supabaseAdmin as any)
      .from('ai_content_queue')
      .update({
        status: 'published_in_sanity',
        sanity_document_id: sanityDocumentId,
        published_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating queue item:', updateError);
      return NextResponse.json({ error: 'Failed to update queue item' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sanityDocumentId: sanityDocumentId,
      message: 'Content marked as published. Sanity integration pending.'
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

