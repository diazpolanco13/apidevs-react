import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET - Buscar usuarios por email o tradingview_username
export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    // Verificar autenticación admin
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || user.email !== 'api@apidevs.io') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener query params
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    // 1. Buscar en tabla 'users' (usuarios registrados, incluyendo legacy que se registraron)
    let registeredQuery = supabase.from('users').select(
      `
        id,
        email,
        full_name,
        tradingview_username,
        customer_tier,
        is_legacy_user,
        total_lifetime_spent,
        purchase_count
      `
    );

    if (query && query.length >= 2) {
      registeredQuery = registeredQuery.or(
        `email.ilike.%${query}%,full_name.ilike.%${query}%`
      );
    }

    const { data: registeredUsers, error: registeredError } =
      await registeredQuery.limit(limit);

    if (registeredError) {
      console.error('Error buscando usuarios registrados:', registeredError);
      return NextResponse.json(
        { error: registeredError.message },
        { status: 500 }
      );
    }

    // 2. Buscar en tabla 'legacy_users' (usuarios de WordPress NO registrados)
    let legacyQuery = supabase.from('legacy_users').select(
      `
        id,
        email,
        full_name,
        customer_tier,
        total_lifetime_spent,
        purchase_count
      `
    );

    if (query && query.length >= 2) {
      legacyQuery = legacyQuery.or(
        `email.ilike.%${query}%,full_name.ilike.%${query}%`
      );
    }

    const { data: legacyUsers, error: legacyError } =
      await legacyQuery.limit(limit);

    if (legacyError) {
      console.error('Error buscando legacy users:', legacyError);
      // No fallo si legacy_users tiene error, solo continúo con registered
    }

    // 3. Combinar resultados: usuarios registrados + legacy
    const combinedUsers = [
      ...(registeredUsers || []).map((u) => ({
        ...u,
        tradingview_username: u.tradingview_username || null,
        customer_tier: u.customer_tier || 'free',
        is_legacy_user: u.is_legacy_user || false,
        total_lifetime_spent: u.total_lifetime_spent || 0,
        purchase_count: u.purchase_count || 0,
        source: 'registered' // Etiqueta para debug
      })),
      ...(legacyUsers || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        tradingview_username: null,
        customer_tier: u.customer_tier || 'free',
        is_legacy_user: true,
        total_lifetime_spent: u.total_lifetime_spent || 0,
        purchase_count: u.purchase_count || 0,
        source: 'legacy_table' // Etiqueta para debug
      }))
    ];

    // 4. Eliminar duplicados (si un legacy_user ya se registró, solo mostrar el de 'users')
    const uniqueUsers = Array.from(
      new Map(combinedUsers.map((u) => [u.email, u])).values()
    );

    return NextResponse.json({
      users: uniqueUsers.slice(0, limit)
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


