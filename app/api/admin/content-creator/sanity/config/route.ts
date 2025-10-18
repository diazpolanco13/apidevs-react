import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(request: NextRequest) {
  try {
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

    // Verificar permiso de vista
    const userPermissions = admin.admin_roles?.permissions || {};
    const hasPermission = userPermissions['content.ai.view'] || admin.admin_roles?.slug === 'super-admin';

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Obtener configuración de Sanity desde variables de entorno
    const sanityConfig = {
      projectId: process.env.SANITY_PROJECT_ID || '',
      dataset: process.env.SANITY_DATASET || 'production',
      apiVersion: process.env.SANITY_API_VERSION || '2023-05-03',
      token: process.env.SANITY_TOKEN ? '***configured***' : 'not_configured',
      isConfigured: !!(process.env.SANITY_PROJECT_ID && process.env.SANITY_DATASET),
    };

    return NextResponse.json({
      success: true,
      config: sanityConfig
    });

  } catch (error) {
    console.error('Error getting Sanity config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, dataset, apiVersion, token } = await request.json();

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

    // Verificar permiso de edición
    const userPermissions = admin.admin_roles?.permissions || {};
    const hasPermission = userPermissions['config.edit'] || admin.admin_roles?.slug === 'super-admin';

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Guardar configuración en system_configuration
    const configs = [
      { key: 'sanity_project_id', value: projectId, category: 'integrations' },
      { key: 'sanity_dataset', value: dataset, category: 'integrations' },
      { key: 'sanity_api_version', value: apiVersion, category: 'integrations' },
      { key: 'sanity_token', value: token, category: 'integrations' },
    ];

    for (const config of configs) {
      const { error } = await (supabaseAdmin as any)
        .from('system_configuration')
        .upsert([config], { onConflict: 'key' });

      if (error) {
        console.error(`Error saving ${config.key}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sanity configuration saved successfully'
    });

  } catch (error) {
    console.error('Error saving Sanity config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
