import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar autenticación
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verificar permisos de admin
    const { data: admin } = await (supabaseAdmin as any)
      .from('admin_users')
      .select('id, email, admin_roles(slug)')
      .eq('email', user.email)
      .eq('status', 'active')
      .single();

    if (!admin) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    // Eliminar el item de la cola
    const { error: deleteError } = await (supabaseAdmin as any)
      .from('ai_content_queue')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting queue item:', deleteError);
      return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

