import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET - Buscar usuarios por email o tradingview_username
export async function GET(req: Request) {
  try {
    const supabase = createClient();

    // Verificar autenticación admin
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || user.email !== 'api@apidevs.io') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener query param
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }

    // Buscar usuarios (case insensitive)
    const { data: users, error } = await supabase
      .from('users')
      .select(
        `
        id,
        email,
        full_name,
        tradingview_username,
        avatar_url,
        customer_tier,
        is_legacy_user,
        onboarding_completed,
        total_lifetime_spent,
        purchase_count
      `
      )
      .or(
        `email.ilike.%${query}%,tradingview_username.ilike.%${query}%,full_name.ilike.%${query}%`
      )
      .limit(20)
      .order('customer_since', { ascending: false });

    if (error) {
      console.error('Error searching users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(users || []);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


