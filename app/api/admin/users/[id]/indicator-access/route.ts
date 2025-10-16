import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { checkAdminPermission, PERMISSIONS } from '@/utils/admin/permissions';

// GET - Obtener todos los accesos a indicadores de un usuario
// Next.js 15: Forzar renderizado dinámico porque usa cookies (Supabase)
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();

    // Verificar autenticación admin
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || !(await checkAdminPermission(user.id, PERMISSIONS.USERS_VIEW))) {
      return NextResponse.json({ error: 'No autorizado - Requiere permisos de visualización de usuarios' }, { status: 401 });
    }

    const userId = id;

    // Verificar que el usuario existe
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, tradingview_username')
      .eq('id', userId)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener todos los accesos del usuario con información de indicadores
    const { data: accesses, error: accessError } = await supabase
      .from('indicator_access')
      .select(
        `
        id,
        indicator_id,
        tradingview_username,
        status,
        granted_at,
        expires_at,
        revoked_at,
        duration_type,
        access_source,
        subscription_id,
        payment_intent_id,
        error_message,
        auto_renew,
        last_renewed_at,
        renewal_count,
        created_at,
        updated_at,
        indicators:indicator_id (
          id,
          pine_id,
          name,
          description,
          category,
          status,
          type,
          access_tier,
          image_1
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (accessError) {
      console.error('Error fetching accesses:', accessError);
      return NextResponse.json(
        { error: accessError.message },
        { status: 500 }
      );
    }

    // Type assertion - código funcional existente
    const validAccesses = (accesses || []) as any[];

    // Calcular estadísticas
    const now = new Date();
    const stats = {
      total: validAccesses.length,
      active:
        validAccesses.filter(
          (a) => {
            // Si el status no es 'active', no contar
            if (a.status !== 'active') return false;
            
            // Si es Lifetime (1L) y está activo, SIEMPRE contar
            if (a.duration_type === '1L') return true;
            
            // Si tiene expires_at null (Lifetime sin duration_type), contar
            if (!a.expires_at) return true;
            
            // Para accesos con expiración, verificar que no haya expirado
            return new Date(a.expires_at) > now;
          }
        ).length,
      pending: validAccesses.filter((a) => a.status === 'pending').length,
      expired: validAccesses.filter((a) => a.status === 'expired').length,
      revoked: validAccesses.filter((a) => a.status === 'revoked').length,
      failed: validAccesses.filter((a) => a.status === 'failed').length
    };

    return NextResponse.json({
      user: targetUser,
      accesses: validAccesses,
      stats
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


