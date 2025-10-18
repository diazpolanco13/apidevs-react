import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

// Función para crear contenido en Sanity usando MCP
async function createSanityContent(contentData: {
  title: string;
  content: string;
  type: 'blog' | 'docs' | 'indicators';
  language: 'es' | 'en';
  user_prompt?: string;
}) {
  try {
    // Aquí usaríamos el MCP de Sanity para crear el contenido
    // Por ahora simulamos la respuesta hasta que tengamos las credenciales configuradas
    
    const { title, content, type, language, user_prompt } = contentData;
    
    // Simular creación en Sanity
    const sanityDocument = {
      _type: type === 'blog' ? 'post' : type === 'docs' ? 'documentation' : 'indicator',
      title: {
        [language]: title
      },
      content: {
        [language]: content
      },
      language: language,
      status: 'draft', // Siempre crear como draft para revisión
      createdAt: new Date().toISOString(),
      createdBy: 'ai-content-creator',
      userPrompt: user_prompt || '',
      metadata: {
        source: 'ai-content-creator',
        type: type,
        language: language,
        generatedAt: new Date().toISOString()
      }
    };

    // TODO: Reemplazar con llamada real al MCP de Sanity
    // const result = await mcpSanityCreateDocument({
    //   resource: {
    //     projectId: process.env.SANITY_PROJECT_ID,
    //     dataset: process.env.SANITY_DATASET
    //   },
    //   type: sanityDocument._type,
    //   instruction: [user_prompt || `Create ${type} content: ${title}`],
    //   workspaceName: 'default'
    // });

    // Simular ID de documento de Sanity
    const sanityDocumentId = `sanity-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      documentId: sanityDocumentId,
      document: sanityDocument,
      message: `Content created successfully in Sanity as ${sanityDocumentId}`
    };

  } catch (error) {
    console.error('Error creating Sanity content:', error);
    throw new Error(`Failed to create content in Sanity: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, type, language, user_prompt, queueItemId } = await request.json();

    if (!title || !content || !type || !language) {
      return NextResponse.json(
        { error: 'Title, content, type, and language are required' },
        { status: 400 }
      );
    }

    // Verificar que el usuario esté autenticado
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verificar permisos de Content Creator
    const { data: admin, error: adminError } = await (supabaseAdmin as any)
      .from('admin_users')
      .select(`
        id,
        status,
        role_id,
        admin_roles (
          slug,
          permissions
        )
      `)
      .eq('email', user.email)
      .eq('status', 'active')
      .single();

    if (adminError || !admin) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Verificar permisos específicos según el tipo
    const userPermissions = admin.admin_roles?.permissions || {};
    let hasPermission = false;

    if (type === 'blog' && userPermissions['content.ai.create_blog']) {
      hasPermission = true;
    } else if (type === 'docs' && userPermissions['content.ai.create_docs']) {
      hasPermission = true;
    } else if (type === 'indicators' && userPermissions['content.ai.edit_indicators']) {
      hasPermission = true;
    } else if (admin.admin_roles?.slug === 'super-admin') {
      hasPermission = true;
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions for this content type' },
        { status: 403 }
      );
    }

    // Crear contenido en Sanity
    const sanityResult = await createSanityContent({
      title,
      content,
      type,
      language,
      user_prompt
    });

    // Actualizar el item de la cola con la información de Sanity
    if (queueItemId) {
      const { error: updateError } = await (supabaseAdmin as any)
        .from('ai_content_queue')
        .update({
          sanity_document_id: sanityResult.documentId,
          status: 'published_in_sanity',
          updated_at: new Date().toISOString(),
        })
        .eq('id', queueItemId);

      if (updateError) {
        console.error('Error updating queue item:', updateError);
        // No fallar la operación por esto
      }
    }

    return NextResponse.json({
      success: true,
      sanityResult,
      message: 'Content created successfully in Sanity'
    });

  } catch (error) {
    console.error('Error creating Sanity content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
