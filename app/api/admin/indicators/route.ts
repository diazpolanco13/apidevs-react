import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { checkAdminPermission, PERMISSIONS } from '@/utils/admin/permissions';

// GET - Obtener todos los indicadores
// Next.js 15: Forzar renderizado dinámico porque usa cookies (Supabase)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || !(await checkAdminPermission(user.id, PERMISSIONS.INDICATORS_VIEW))) {
      return NextResponse.json({ error: 'No autorizado - Requiere permisos de indicadores' }, { status: 401 });
    }

    // Obtener indicadores
    const { data: indicators, error } = await supabase
      .from('indicators')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching indicators:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calcular estadísticas
    const stats = {
      total: indicators?.length || 0,
      activos: indicators?.filter((i: any) => i.status === 'activo').length || 0,
      indicadores: indicators?.filter((i: any) => i.category === 'indicador').length || 0,
      escaners: indicators?.filter((i: any) => i.category === 'escaner').length || 0,
      tools: indicators?.filter((i: any) => i.category === 'tools').length || 0,
      free: indicators?.filter((i: any) => i.access_tier === 'free').length || 0,
      premium: indicators?.filter((i: any) => i.access_tier === 'premium').length || 0
    };

    return NextResponse.json({ 
      indicators: indicators || [],
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

// POST - Crear nuevo indicador
export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || !(await checkAdminPermission(user.id, PERMISSIONS.INDICATORS_CREATE))) {
      return NextResponse.json({ error: 'No autorizado - Requiere permisos de creación de indicadores' }, { status: 401 });
    }

    // Obtener datos del body
    const body = await req.json();
    const {
      pine_id,
      name,
      description,
      category,
      status,
      type,
      image_1,
      image_2,
      image_3
    } = body;

    // Validaciones básicas
    if (!pine_id || !name || !category || !status || !type) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de pine_id
    if (!pine_id.startsWith('PUB;')) {
      return NextResponse.json(
        { error: 'Pine ID debe empezar con "PUB;"' },
        { status: 400 }
      );
    }

    // Verificar que el pine_id no exista
    const { data: existing } = await supabase
      .from('indicators')
      .select('id')
      .eq('pine_id', pine_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Este Pine ID ya existe' },
        { status: 400 }
      );
    }

    // Insertar indicador
    const { data: indicator, error } = await (supabase as any)
      .from('indicators')
      .insert({
        pine_id,
        name,
        description: description || null,
        category,
        status,
        type,
        image_1: image_1 || null,
        image_2: image_2 || null,
        image_3: image_3 || null,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating indicator:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(indicator, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

