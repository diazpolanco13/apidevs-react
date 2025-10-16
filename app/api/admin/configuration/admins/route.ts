import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { checkAdminPermission, PERMISSIONS, logAdminActivity } from '@/utils/admin/permissions';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/configuration/admins
 * Listar todos los administradores con filtros opcionales
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

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const roleId = searchParams.get('role_id');

    // Query base
    let query = (supabase as any)
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
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status);
    }

    if (roleId) {
      query = query.eq('role_id', roleId);
    }

    const { data: admins, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: admins,
      count: admins?.length || 0,
    });
  } catch (error: any) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Error al obtener administradores', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/configuration/admins
 * Crear nuevo administrador
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

    // Verificar permisos
    const hasPermission = await checkAdminPermission(user.id, PERMISSIONS.ADMINS_MANAGE);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Sin permisos para crear administradores' }, { status: 403 });
    }

    const body = await request.json();
    const { email, full_name, role_id, send_invitation = false } = body;

    // Validaciones
    if (!email || !full_name || !role_id) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: email, full_name, role_id' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    // Verificar que el rol existe
    const { data: role, error: roleError } = await (supabase as any)
      .from('admin_roles')
      .select('*')
      .eq('id', role_id)
      .single();

    if (roleError || !role) {
      return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 });
    }

    // Verificar que el email no exista en admin_users
    const { data: existingAdmin } = await (supabase as any)
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingAdmin) {
      return NextResponse.json({ error: 'Ya existe un administrador con ese email' }, { status: 409 });
    }

    // 1. Crear usuario en auth.users usando supabaseAdmin
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: send_invitation ? false : true, // Si envía invitación, requiere confirmación
      user_metadata: {
        full_name,
        is_admin: true,
      },
    });

    if (authError || !authUser.user) {
      throw new Error(`Error al crear usuario en auth: ${authError?.message}`);
    }

    // 2. Insertar en admin_users
    const { data: newAdmin, error: insertError } = await (supabase as any)
      .from('admin_users')
      .insert({
        id: authUser.user.id,
        email,
        full_name,
        role_id,
        status: send_invitation ? 'pending' : 'active',
        created_by: user.id,
      })
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

    if (insertError) {
      // Rollback: eliminar usuario de auth si falla la inserción
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Error al insertar en admin_users: ${insertError.message}`);
    }

    // 3. Registrar actividad
    await logAdminActivity(
      user.id,
      'admin_created',
      {
        new_admin_id: newAdmin.id,
        new_admin_email: email,
        role_id,
        role_name: role.name,
      },
      newAdmin.id,
      'admin_users',
      request
    );

    // 4. TODO: Enviar email de invitación si send_invitation = true
    if (send_invitation) {
      console.log('📧 TODO: Enviar email de invitación a:', email);
    }

    return NextResponse.json({
      success: true,
      data: newAdmin,
      message: 'Administrador creado exitosamente',
    });
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { error: 'Error al crear administrador', details: error.message },
      { status: 500 }
    );
  }
}

