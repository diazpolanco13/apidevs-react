import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    
    // Verificar que sea admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { userEmail } = body;

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail is required' }, { status: 400 });
    }

    console.log(`🔐 Enviando reset de contraseña a: ${userEmail}`);

    // Usar Supabase Admin para enviar email de reset
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/signin/update_password`
    });

    if (error) {
      console.error('❌ Error enviando email de reset:', error);
      return NextResponse.json({ 
        error: 'Failed to send reset email',
        details: error.message 
      }, { status: 500 });
    }

    console.log(`✅ Email de reset enviado a ${userEmail}`);

    return NextResponse.json({
      success: true,
      message: `Email de recuperación enviado a ${userEmail}`
    });

  } catch (error: any) {
    console.error('❌ Error en reset password:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

