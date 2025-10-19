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

    // Usar variables de entorno directamente (más seguro)
    const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
    const sanityToken = process.env.SANITY_API_TOKEN;

    if (!sanityProjectId || !sanityDataset || !sanityToken) {
      return NextResponse.json({ 
        error: 'Sanity not configured. Check environment variables.' 
      }, { status: 400 });
    }

    // Preparar los datos para crear en Sanity
    const generatedContent = queueItem.generated_content || {};
    
    // PASO 1: Subir la imagen a Sanity Assets si existe
    let mainImageAsset = null;
    
    // La imagen está en generatedContent.mainImage.imageUrl
    const imageUrl = generatedContent.mainImage?.imageUrl;

    console.log('Checking for image:', {
      hasMainImage: !!generatedContent.mainImage,
      hasImageUrl: !!imageUrl,
      imageUrl: imageUrl?.substring(0, 50)
    });

    if (imageUrl) {
      console.log('Found image URL, uploading to Sanity...');
      
      try {
        let imageBuffer;
        
        // Si es base64, convertir directamente
        if (imageUrl.startsWith('data:image')) {
          const base64Data = imageUrl.split(',')[1];
          imageBuffer = Buffer.from(base64Data, 'base64');
        } 
        // Si es URL de Supabase, descargar primero
        else if (imageUrl.startsWith('http')) {
          const imageResponse = await fetch(imageUrl);
          const arrayBuffer = await imageResponse.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
          console.log('✅ Downloaded image from URL');
        }
        
        if (imageBuffer) {
          // Subir a Sanity Assets API
          const uploadResponse = await fetch(
            `https://${sanityProjectId}.api.sanity.io/v2021-06-07/assets/images/${sanityDataset}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'image/png',
                'Authorization': `Bearer ${sanityToken}`,
              },
              body: imageBuffer,
            }
          );

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            mainImageAsset = {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: uploadResult.document._id
              },
              alt: generatedContent.mainImage?.alt || queueItem.title,
              caption: generatedContent.mainImage?.caption || ''
            };
            
            console.log('✅ Image uploaded to Sanity Assets:', uploadResult.document._id);
          } else {
            const errorText = await uploadResponse.text();
            console.error('Error uploading to Sanity:', errorText);
          }
        }
      } catch (uploadError) {
        console.error('Error processing image upload:', uploadError);
      }
    }
    
    // PASO 2: Crear documento en Sanity usando la API HTTP
    const documentData: any = {
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
          _key: `block-${Date.now()}-1`,
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: `span-${Date.now()}-1`,
              text: generatedContent.content || queueItem.content,
              marks: []
            }
          ],
          markDefs: []
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
    };

    // Agregar mainImage solo si se subió exitosamente
    if (mainImageAsset) {
      documentData.mainImage = mainImageAsset;
    }

    const sanityMutation = {
      mutations: [
        {
          create: documentData
        }
      ]
    };

    const sanityResponse = await fetch(
      `https://${sanityProjectId}.api.sanity.io/v2021-06-07/data/mutate/${sanityDataset}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sanityToken}`,
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

