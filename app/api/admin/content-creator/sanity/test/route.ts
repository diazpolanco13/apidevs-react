import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { projectId, dataset, token } = await request.json();

    if (!projectId || !dataset || !token) {
      return NextResponse.json(
        { error: 'Project ID, dataset, and token are required' },
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

    // Verificar permiso de vista
    const userPermissions = admin.admin_roles?.permissions || {};
    const hasPermission = userPermissions['content.ai.view'] || admin.admin_roles?.slug === 'super-admin';

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Si el token es 'using_saved_token', obtenerlo de la base de datos
    let actualToken = token;
    if (token === 'using_saved_token') {
      const { data: tokenConfig } = await (supabaseAdmin as any)
        .from('system_configuration')
        .select('value')
        .eq('key', 'sanity_token')
        .single();

      if (!tokenConfig?.value) {
        return NextResponse.json(
          { error: 'No saved token found' },
          { status: 400 }
        );
      }

      actualToken = tokenConfig.value;
    }

    // Test de conexión con Sanity
    try {
      // Hacer una consulta simple a Sanity para verificar la conexión
      const sanityUrl = `https://${projectId}.api.sanity.io/v${process.env.SANITY_API_VERSION || '2023-05-03'}/data/query/${dataset}?query=*[_type == "sanity.imageAsset"][0...1]`;
      
      const response = await fetch(sanityUrl, {
        headers: {
          'Authorization': `Bearer ${actualToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({
          success: false,
          message: `Error de conexión con Sanity: ${response.status} ${response.statusText}`,
          details: errorText
        });
      }

      const data = await response.json();
      
      return NextResponse.json({
        success: true,
        message: `Conexión exitosa con Sanity (${projectId}/${dataset})`,
        details: {
          projectId,
          dataset,
          apiVersion: process.env.SANITY_API_VERSION || '2023-05-03',
          responseTime: Date.now()
        }
      });

    } catch (error) {
      console.error('Sanity connection test error:', error);
      return NextResponse.json({
        success: false,
        message: `Error al conectar con Sanity: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        details: error
      });
    }

  } catch (error) {
    console.error('Error in Sanity test:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
