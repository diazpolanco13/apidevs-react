import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { checkAdminPermission, PERMISSIONS, logAdminActivity, getAdminUser } from '@/utils/admin/permissions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/configuration/roles
 * Listar todos los roles disponibles
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos
    const hasPermission = await checkAdminPermission(user.id, PERMISSIONS.CONFIG_VIEW);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 });
    }

    // Obtener todos los roles
    const { data: roles, error } = await (supabase as any)
      .from('admin_roles')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    // Contar cuántos admins tiene cada rol
    const rolesWithCounts = await Promise.all(
      (roles || []).map(async (role: any) => {
        const { count } = await (supabase as any)
          .from('admin_users')
          .select('*', { count: 'exact', head: true })
          .eq('role_id', role.id);

        return {
          ...role,
          admins_count: count || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: rolesWithCounts,
      count: rolesWithCounts.length,
    });
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Error al obtener roles', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/configuration/roles
 * Crear nuevo rol personalizado (solo Super Admin)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que sea Super Admin
    const adminUser = await getAdminUser(user.id);
    if (!adminUser || adminUser.admin_roles.slug !== 'super-admin') {
      return NextResponse.json(
        { error: 'Solo el Super Admin puede crear roles personalizados' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, slug, description, permissions } = body;

    // Validaciones
    if (!name || !slug || !permissions) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, slug, permissions' },
        { status: 400 }
      );
    }

    // Validar slug (solo letras, números y guiones)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: 'Slug inválido. Solo letras minúsculas, números y guiones' },
        { status: 400 }
      );
    }

    // Verificar que no exista un rol con ese slug
    const { data: existingRole } = await (supabase as any)
      .from('admin_roles')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingRole) {
      return NextResponse.json({ error: 'Ya existe un rol con ese slug' }, { status: 409 });
    }

    // Crear rol
    const { data: newRole, error: insertError } = await (supabase as any)
      .from('admin_roles')
      .insert({
        name,
        slug,
        description: description || null,
        permissions,
        is_system_role: false, // Los roles personalizados no son del sistema
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Registrar actividad
    await logAdminActivity(
      user.id,
      'role_created',
      {
        role_id: newRole.id,
        role_name: name,
        role_slug: slug,
        permissions,
      },
      undefined,
      'admin_roles',
      request
    );

    return NextResponse.json({
      success: true,
      data: newRole,
      message: 'Rol creado exitosamente',
    });
  } catch (error: any) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Error al crear rol', details: error.message },
      { status: 500 }
    );
  }
}

