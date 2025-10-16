import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { checkAdminPermission, PERMISSIONS } from '@/utils/admin/permissions';

// PUT - Actualizar indicador
// Next.js 15: Forzar renderizado dinámico porque usa cookies (Supabase)
export const dynamic = 'force-dynamic';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || !(await checkAdminPermission(user.id, PERMISSIONS.INDICATORS_EDIT))) {
      return NextResponse.json({ error: 'No autorizado - Requiere permisos de edición de indicadores' }, { status: 401 });
    }
    const body = await req.json();
    const {
      pine_id,
      name,
      description,
      category,
      status,
      type,
      access_tier,
      tradingview_url,
      public_script_url,
      embed_url,
      image_1,
      image_2,
      image_3,
      features,
      tags
    } = body;

    // Validaciones básicas
    if (!pine_id || !name || !category || !status || !type) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el indicador existe
    const { data: existing } = await supabase
      .from('indicators')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Indicador no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar indicador
    const { data: indicator, error } = await (supabase as any)
      .from('indicators')
      .update({
        pine_id,
        name,
        description: description || null,
        category,
        status,
        type,
        access_tier: access_tier || 'premium',
        tradingview_url: tradingview_url || null,
        public_script_url: public_script_url || null,
        embed_url: embed_url || null,
        image_1: image_1 || null,
        image_2: image_2 || null,
        image_3: image_3 || null,
        features: features || null,
        tags: tags || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating indicator:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(indicator);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar indicador
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || !(await checkAdminPermission(user.id, PERMISSIONS.INDICATORS_DELETE))) {
      return NextResponse.json({ error: 'No autorizado - Requiere permisos de eliminación de indicadores' }, { status: 401 });
    }


    // Verificar que el indicador existe
    const { data: existing } = await supabase
      .from('indicators')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Indicador no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar indicador
    const { error } = await supabase.from('indicators').delete().eq('id', id);

    if (error) {
      console.error('Error deleting indicator:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Indicador eliminado exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

