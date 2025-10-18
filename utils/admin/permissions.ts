import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

/**
 * Sistema de Permisos Granulares para Admin Panel
 * Cada permiso controla acceso a funcionalidades específicas
 */
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',
  
  // Usuarios
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  
  // Compras
  PURCHASES_VIEW: 'purchases.view',
  PURCHASES_REFUND: 'purchases.refund',
  
  // Indicadores TradingView
  INDICATORS_VIEW: 'indicators.view',
  INDICATORS_CREATE: 'indicators.create',
  INDICATORS_EDIT: 'indicators.edit',
  INDICATORS_DELETE: 'indicators.delete',
  INDICATORS_GRANT: 'indicators.grant',
  INDICATORS_REVOKE: 'indicators.revoke',
  
  // Gestión de accesos de usuarios
  USERS_GRANT_ACCESS: 'users.grant_access',
  USERS_REVOKE_ACCESS: 'users.revoke_access',
  
  // Campañas
  CAMPAIGNS_VIEW: 'campaigns.view',
  CAMPAIGNS_CREATE: 'campaigns.create',
  
  // IA Configuration
  IA_VIEW: 'ia.view',
  IA_EDIT: 'ia.edit',
  
  // Content Creator AI
  CONTENT_AI_VIEW: 'content.ai.view',
  CONTENT_AI_CREATE_BLOG: 'content.ai.create_blog',
  CONTENT_AI_CREATE_DOCS: 'content.ai.create_docs',
  CONTENT_AI_EDIT_INDICATORS: 'content.ai.edit_indicators',
  CONTENT_AI_TRANSLATE: 'content.ai.translate',
  CONTENT_AI_IMAGES: 'content.ai.images',
  CONTENT_AI_PUBLISH_AUTO: 'content.ai.publish_auto',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics.view',
  
  // Configuración del Sistema
  CONFIG_VIEW: 'config.view',
  CONFIG_EDIT: 'config.edit',
  
  // Administradores
  ADMINS_MANAGE: 'admins.manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Interfaz para Admin User con permisos
 */
export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  avatar_url: string | null;
  status: 'active' | 'suspended' | 'pending';
  last_login_at: string | null;
  created_at: string;
  admin_roles: {
    name: string;
    slug: string;
    permissions: Record<string, boolean>;
  };
}

/**
 * Verificar si un usuario admin tiene un permiso específico
 * @param userId - UUID del usuario
 * @param permission - Permiso a verificar (usar constantes de PERMISSIONS)
 * @returns Promise<boolean> - true si tiene el permiso, false si no
 */
export async function checkAdminPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  try {
    // Usar supabaseAdmin para bypass RLS
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
      .eq('id', userId)
      .eq('status', 'active')
      .single();

    if (error || !admin) {
      console.warn(`❌ Admin user not found or error: ${userId}`, error?.message);
      return false;
    }

    // Super Admin tiene todos los permisos automáticamente
    if (admin.admin_roles?.slug === 'super-admin') {
      return true;
    }

    // Verificar permiso específico en el rol
    const permissions = admin.admin_roles?.permissions || {};
    const hasPermission = permissions[permission] === true;

    if (!hasPermission) {
      console.warn(`⚠️ Permission denied for user ${userId}: ${permission}`);
    }

    return hasPermission;
  } catch (err) {
    console.error('Error checking admin permission:', err);
    return false;
  }
}

/**
 * Verificar si un usuario es administrador activo (cualquier rol)
 * @param userId - UUID del usuario
 * @returns Promise<boolean>
 */
export async function isActiveAdmin(userId: string): Promise<boolean> {
  try {
    // Usar supabaseAdmin para bypass RLS
    const { data: admin, error } = await (supabaseAdmin as any)
      .from('admin_users')
      .select('id, status')
      .eq('id', userId)
      .eq('status', 'active')
      .single();

    return !error && !!admin;
  } catch (err) {
    console.error('Error checking admin status:', err);
    return false;
  }
}

/**
 * Obtener información completa del admin user
 * @param userId - UUID del usuario
 * @returns Promise<AdminUser | null>
 */
export async function getAdminUser(userId: string): Promise<AdminUser | null> {
  try {
    // Usar supabaseAdmin para bypass RLS
    const { data: admin, error } = await (supabaseAdmin as any)
      .from('admin_users')
      .select(`
        id,
        email,
        full_name,
        role_id,
        avatar_url,
        status,
        last_login_at,
        created_at,
        admin_roles (
          name,
          slug,
          permissions
        )
      `)
      .eq('id', userId)
      .eq('status', 'active')
      .single();

    if (error || !admin) {
      console.warn(`⚠️ Admin user not found: ${userId}`, error?.message);
      return null;
    }

    return admin as AdminUser;
  } catch (err) {
    console.error('Error getting admin user:', err);
    return null;
  }
}

/**
 * Verificar múltiples permisos a la vez
 * @param userId - UUID del usuario
 * @param permissions - Array de permisos a verificar
 * @returns Promise<Record<Permission, boolean>>
 */
export async function checkMultiplePermissions(
  userId: string,
  permissions: Permission[]
): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  for (const permission of permissions) {
    results[permission] = await checkAdminPermission(userId, permission);
  }

  return results;
}

/**
 * Registrar actividad del admin en el log
 * @param adminId - UUID del admin
 * @param action - Acción realizada
 * @param details - Detalles adicionales en JSON
 * @param targetUserId - UUID del usuario afectado (opcional)
 * @param targetResource - Recurso afectado (opcional)
 * @param request - Request object para obtener IP y user agent (opcional)
 */
export async function logAdminActivity(
  adminId: string,
  action: string,
  details?: Record<string, any>,
  targetUserId?: string,
  targetResource?: string,
  request?: Request
) {
  try {
    const supabase = await createClient();

    // Extraer IP y user agent del request si está disponible
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    if (request) {
      // Intentar obtener IP real (considerando proxies como Vercel)
      ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                  request.headers.get('x-real-ip') || 
                  null;
      
      userAgent = request.headers.get('user-agent');
    }

    await (supabase as any)
      .from('admin_activity_log')
      .insert({
        admin_id: adminId,
        action,
        target_user_id: targetUserId || null,
        target_resource: targetResource || null,
        details: details || null,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    console.log(`📝 Admin activity logged: ${action} by ${adminId}`);
  } catch (err) {
    // No bloquear la operación si falla el log
    console.error('Error logging admin activity:', err);
  }
}

