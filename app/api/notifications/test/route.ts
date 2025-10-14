import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// API Route para probar el sistema de notificaciones
// Solo para desarrollo - agregar el número de notificaciones deseado
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { count = 1, action = 'add' } = body;

    if (action === 'add') {
      // Agregar notificaciones - usar update directo
      const { data: currentData } = await (supabase as any)
        .from('users')
        .select('unread_notifications')
        .eq('id', user.id)
        .single();

      const currentCount = currentData?.unread_notifications || 0;
      
      const { error: updateError } = await (supabase as any)
        .from('users')
        .update({ unread_notifications: currentCount + count })
        .eq('id', user.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: `Se agregaron ${count} notificaciones`,
        new_count: currentCount + count 
      });
    }

    if (action === 'clear') {
      // Limpiar notificaciones
      const { error } = await (supabase as any)
        .from('users')
        .update({ unread_notifications: 0 })
        .eq('id', user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Notificaciones limpiadas' });
    }

    if (action === 'set') {
      // Establecer número específico
      const { error } = await (supabase as any)
        .from('users')
        .update({ unread_notifications: count })
        .eq('id', user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: `Notificaciones establecidas a ${count}`,
        new_count: count 
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET para obtener el contador actual
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { data, error } = await (supabase as any)
      .from('users')
      .select('unread_notifications')
      .eq('id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      unread_notifications: data.unread_notifications || 0 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
