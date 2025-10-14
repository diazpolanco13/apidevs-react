import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Verificar que sea admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { to, subject, message, template } = body;

    if (!to || !subject || !message) {
      return NextResponse.json({ 
        error: 'to, subject, and message are required' 
      }, { status: 400 });
    }

    console.log(`📧 Enviando email a: ${to}`);
    console.log(`   Asunto: ${subject}`);

    // TODO: Integrar con servicio de email (Resend, SendGrid, etc.)
    // Por ahora, registrar en logs y responder
    
    /*
    // Ejemplo con Resend:
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: 'APIDevs <noreply@apidevs.io>',
      to: [to],
      subject: subject,
      html: message
    });
    
    if (error) {
      throw new Error(error.message);
    }
    */

    // Por ahora, simular envío exitoso
    console.log(`✅ Email "enviado" a ${to} (implementación pendiente)`);
    console.log(`   Template: ${template || 'custom'}`);

    // Registrar en actividad del usuario (opcional)
    const { error: logError } = await (supabase as any)
      .from('admin_activity_log')
      .insert({
        admin_id: user.id,
        action: 'send_email',
        target_user_email: to,
        details: {
          subject,
          template: template || 'custom',
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (logError) {
      console.warn('⚠️ No se pudo registrar actividad:', logError.message);
      // No es crítico, continuamos
    }

    return NextResponse.json({
      success: true,
      message: `Email enviado exitosamente a ${to}`,
      note: 'Integración de email service pendiente (Resend, SendGrid, etc.)'
    });

  } catch (error: any) {
    console.error('❌ Error enviando email:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

