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

    // Obtener configuración de Sanity y OpenAI desde system_configuration
    const { data: configs, error: configError } = await (supabaseAdmin as any)
      .from('system_configuration')
      .select('key, value')
      .in('key', ['sanity_project_id', 'sanity_dataset', 'sanity_api_version', 'sanity_token', 'openai_api_key']);

    if (configError) {
      console.error('Error loading config:', configError);
    }

    // Convertir array de configs a objeto
    const configMap = configs?.reduce((acc: any, config: any) => {
      acc[config.key] = config.value;
      return acc;
    }, {}) || {};

    const sanityConfig = {
      projectId: configMap.sanity_project_id || '',
      dataset: configMap.sanity_dataset || 'production',
      apiVersion: configMap.sanity_api_version || '2023-05-03',
      token: configMap.sanity_token ? '***configured***' : 'not_configured',
      openai_api_key: configMap.openai_api_key ? '***configured***' : 'not_configured',
      isConfigured: !!(configMap.sanity_project_id && configMap.sanity_dataset && configMap.sanity_token),
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
    const { projectId, dataset, apiVersion, token, openai_api_key } = await request.json();

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
    const configs = [];
    
    // Agregar configuración de Sanity si se proporciona
    if (projectId && dataset && apiVersion && token) {
      configs.push(
        { key: 'sanity_project_id', value: projectId, category: 'integrations' },
        { key: 'sanity_dataset', value: dataset, category: 'integrations' },
        { key: 'sanity_api_version', value: apiVersion, category: 'integrations' },
        { key: 'sanity_token', value: token, category: 'integrations' }
      );
    }
    
    // Agregar configuración de OpenAI si se proporciona
    if (openai_api_key) {
      configs.push({
        key: 'openai_api_key',
        value: openai_api_key,
        category: 'integrations'
      });
    }

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
