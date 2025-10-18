import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { email, permissions } = await request.json();

    if (!email || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Email and permissions array are required' },
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

    // Obtener información del admin user
    const { data: admin, error } = await (supabaseAdmin as any)
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
      .eq('email', email)
      .eq('status', 'active')
      .single();

    if (error || !admin) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Super Admin tiene todos los permisos
    if (admin.admin_roles?.slug === 'super-admin') {
      const result: Record<string, boolean> = {};
      permissions.forEach(permission => {
        result[permission] = true;
      });
      return NextResponse.json({ permissions: result });
    }

    // Verificar permisos específicos
    const userPermissions = admin.admin_roles?.permissions || {};
    const result: Record<string, boolean> = {};
    
    permissions.forEach(permission => {
      result[permission] = userPermissions[permission] === true;
    });

    return NextResponse.json({ permissions: result });

  } catch (error) {
    console.error('Error checking permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
