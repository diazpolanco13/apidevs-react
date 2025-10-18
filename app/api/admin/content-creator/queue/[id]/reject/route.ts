import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { reason } = await request.json();

    // Verificar autenticación
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Obtener admin
    const { data: admin } = await (supabaseAdmin as any)
      .from('admin_users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Actualizar el item en la cola
    const { data, error } = await (supabaseAdmin as any)
      .from('ai_content_queue')
      .update({
        status: 'rejected',
        reviewed_by_admin_id: admin.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error rejecting content:', error);
      return NextResponse.json({ error: 'Failed to reject content' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

