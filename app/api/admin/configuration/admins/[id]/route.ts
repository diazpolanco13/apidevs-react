import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { checkAdminPermission, PERMISSIONS, logAdminActivity } from '@/utils/admin/permissions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/configuration/admins/[id]
 * Obtener detalles de un administrador específico
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

    // Obtener administrador
    const { data: admin, error } = await (supabase as any)
      .from('admin_users')
      .select(`
        *,
        admin_roles (
          id,
          name,
          slug,
          description,
          permissions,
          is_system_role
        )
      `)
      .eq('id', id)
      .single();

    if (error || !admin) {
      return NextResponse.json({ error: 'Administrador no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: admin,
    });
  } catch (error: any) {
    console.error('Error fetching admin:', error);
    return NextResponse.json(
      { error: 'Error al obtener administrador', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/configuration/admins/[id]
 * Actualizar administrador
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

    // Verificar permisos
    const hasPermission = await checkAdminPermission(user.id, PERMISSIONS.ADMINS_MANAGE);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Sin permisos para modificar administradores' }, { status: 403 });
    }

    const body = await request.json();
    const { full_name, role_id, status } = body;

    // Obtener admin actual para validaciones
    const { data: currentAdmin } = await (supabase as any)
      .from('admin_users')
      .select('*, admin_roles(slug)')
      .eq('id', id)
      .single();

    if (!currentAdmin) {
      return NextResponse.json({ error: 'Administrador no encontrado' }, { status: 404 });
    }

    // Validar: No se puede modificar al Super Admin (slug = 'super-admin')
    if (currentAdmin.admin_roles?.slug === 'super-admin') {
      return NextResponse.json(
        { error: 'No se puede modificar al Super Admin' },
        { status: 403 }
      );
    }

    // Validar: No se puede auto-eliminar
    if (id === user.id && status === 'suspended') {
      return NextResponse.json(
        { error: 'No puedes suspender tu propia cuenta' },
        { status: 400 }
      );
    }

    // Preparar datos a actualizar
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (full_name !== undefined) {
      updateData.full_name = full_name;
    }

    if (role_id !== undefined) {
      // Verificar que el nuevo rol existe
      const { data: newRole } = await (supabase as any)
        .from('admin_roles')
        .select('id, name')
        .eq('id', role_id)
        .single();

      if (!newRole) {
        return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 });
      }

      updateData.role_id = role_id;
    }

    if (status !== undefined) {
      if (!['active', 'suspended', 'pending'].includes(status)) {
        return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
      }
      updateData.status = status;
    }

    // Actualizar en BD
    const { data: updatedAdmin, error: updateError } = await (supabase as any)
      .from('admin_users')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        admin_roles (
          id,
          name,
          slug,
          description,
          permissions
        )
      `)
      .single();

    if (updateError) {
      throw updateError;
    }

    // Registrar actividad
    await logAdminActivity(
      user.id,
      'admin_updated',
      {
        admin_id: id,
        admin_email: updatedAdmin.email,
        changes: updateData,
      },
      id,
      'admin_users',
      request
    );

    return NextResponse.json({
      success: true,
      data: updatedAdmin,
      message: 'Administrador actualizado exitosamente',
    });
  } catch (error: any) {
    console.error('Error updating admin:', error);
    return NextResponse.json(
      { error: 'Error al actualizar administrador', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/configuration/admins/[id]
 * Suspender administrador (soft delete)
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

    // Verificar permisos
    const hasPermission = await checkAdminPermission(user.id, PERMISSIONS.ADMINS_MANAGE);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Sin permisos para eliminar administradores' }, { status: 403 });
    }

    // Obtener admin actual
    const { data: currentAdmin } = await (supabase as any)
      .from('admin_users')
      .select('*, admin_roles(slug)')
      .eq('id', id)
      .single();

    if (!currentAdmin) {
      return NextResponse.json({ error: 'Administrador no encontrado' }, { status: 404 });
    }

    // Validar: No se puede eliminar al Super Admin
    if (currentAdmin.admin_roles?.slug === 'super-admin') {
      return NextResponse.json(
        { error: 'No se puede eliminar al Super Admin' },
        { status: 403 }
      );
    }

    // Validar: No se puede auto-eliminar
    if (id === user.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      );
    }

    // Cambiar status a 'suspended' (soft delete)
    const { data: deletedAdmin, error: deleteError } = await (supabase as any)
      .from('admin_users')
      .update({
        status: 'suspended',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (deleteError) {
      throw deleteError;
    }

    // Registrar actividad
    await logAdminActivity(
      user.id,
      'admin_suspended',
      {
        admin_id: id,
        admin_email: deletedAdmin.email,
        reason: 'Manual suspension by admin',
      },
      id,
      'admin_users',
      request
    );

    return NextResponse.json({
      success: true,
      message: 'Administrador suspendido exitosamente',
    });
  } catch (error: any) {
    console.error('Error deleting admin:', error);
    return NextResponse.json(
      { error: 'Error al suspender administrador', details: error.message },
      { status: 500 }
    );
  }
}

