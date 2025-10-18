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
    
    // Por ahora, marcar como publicado
    // La integración real con Sanity MCP se implementará en el siguiente paso
    const sanityDocumentId = `draft.post-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    console.log('Marking content as published:', {
      queueItemId: id,
      title: queueItem.title,
      sanityId: sanityDocumentId
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

