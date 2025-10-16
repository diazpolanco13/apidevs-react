import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { checkAdminPermission, PERMISSIONS, logAdminActivity, getAdminUser } from '@/utils/admin/permissions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/configuration/roles/[id]
 * Obtener detalles de un rol específico
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
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

    // Obtener rol
    const { data: role, error } = await (supabase as any)
      .from('admin_roles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !role) {
      return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 });
    }

    // Contar admins con este rol
    const { count } = await (supabase as any)
      .from('admin_users')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', id);

    return NextResponse.json({
      success: true,
      data: {
        ...role,
        admins_count: count || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { error: 'Error al obtener rol', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/configuration/roles/[id]
 * Actualizar permisos de un rol
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
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
        { error: 'Solo el Super Admin puede modificar roles' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, permissions } = body;

    // Obtener rol actual
    const { data: currentRole } = await (supabase as any)
      .from('admin_roles')
      .select('*')
      .eq('id', id)
      .single();

    if (!currentRole) {
      return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 });
    }

    // Validar: No se pueden modificar roles del sistema (excepto permisos)
    if (currentRole.is_system_role && (name || description)) {
      return NextResponse.json(
        { error: 'No se pueden modificar nombre o descripción de roles del sistema. Solo permisos.' },
        { status: 403 }
      );
    }

    // Preparar datos a actualizar
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined && !currentRole.is_system_role) {
      updateData.name = name;
    }

    if (description !== undefined && !currentRole.is_system_role) {
      updateData.description = description;
    }

    if (permissions !== undefined) {
      // Validar que es un objeto con valores booleanos
      if (typeof permissions !== 'object') {
        return NextResponse.json({ error: 'Permissions debe ser un objeto' }, { status: 400 });
      }
      updateData.permissions = permissions;
    }

    // Actualizar rol
    const { data: updatedRole, error: updateError } = await (supabase as any)
      .from('admin_roles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Registrar actividad
    await logAdminActivity(
      user.id,
      'role_updated',
      {
        role_id: id,
        role_name: updatedRole.name,
        role_slug: updatedRole.slug,
        changes: updateData,
      },
      undefined,
      'admin_roles',
      request
    );

    return NextResponse.json({
      success: true,
      data: updatedRole,
      message: 'Rol actualizado exitosamente',
    });
  } catch (error: any) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Error al actualizar rol', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/configuration/roles/[id]
 * Eliminar rol personalizado (solo Super Admin)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
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
        { error: 'Solo el Super Admin puede eliminar roles' },
        { status: 403 }
      );
    }

    // Obtener rol actual
    const { data: currentRole } = await (supabase as any)
      .from('admin_roles')
      .select('*')
      .eq('id', id)
      .single();

    if (!currentRole) {
      return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 });
    }

    // Validar: No se pueden eliminar roles del sistema
    if (currentRole.is_system_role) {
      return NextResponse.json(
        { error: 'No se pueden eliminar roles del sistema' },
        { status: 403 }
      );
    }

    // Verificar que no haya admins con este rol
    const { count } = await (supabase as any)
      .from('admin_users')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. Hay ${count} administrador(es) con este rol` },
        { status: 409 }
      );
    }

    // Eliminar rol
    const { error: deleteError } = await (supabase as any)
      .from('admin_roles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    // Registrar actividad
    await logAdminActivity(
      user.id,
      'role_deleted',
      {
        role_id: id,
        role_name: currentRole.name,
        role_slug: currentRole.slug,
      },
      undefined,
      'admin_roles',
      request
    );

    return NextResponse.json({
      success: true,
      message: 'Rol eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Error al eliminar rol', details: error.message },
      { status: 500 }
    );
  }
}

