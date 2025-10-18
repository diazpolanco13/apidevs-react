import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { title, content, type, language, user_prompt } = await request.json();

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

    // Crear item en la cola
    const { data: queueItem, error: insertError } = await (supabaseAdmin as any)
      .from('ai_content_queue')
      .insert({
        title,
        content,
        content_type: type,
        language,
        user_prompt: user_prompt || '',
        generated_content: {
          title,
          content,
          type,
          language
        },
        status: 'pending_review',
        created_by_admin_id: admin.id,
        tokens_used: Math.floor(content.length / 4), // Estimación aproximada
        processing_time_ms: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating queue item:', insertError);
      return NextResponse.json(
        { error: 'Failed to create content queue item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      queueItem,
      message: 'Content created successfully and added to review queue'
    });

  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
