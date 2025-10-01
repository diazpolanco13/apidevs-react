import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/utils/stripe/config';
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
    const { paymentIntentId, amount, reason } = body;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'paymentIntentId is required' }, { status: 400 });
    }

    console.log(`💸 Procesando reembolso para payment intent: ${paymentIntentId}`);
    if (amount) {
      console.log(`   Monto: $${(amount / 100).toFixed(2)}`);
    }
    console.log(`   Razón: ${reason || 'No especificada'}`);

    // Crear reembolso en Stripe
    const refundData: any = {
      payment_intent: paymentIntentId
    };

    if (amount) {
      refundData.amount = amount; // Amount in cents
    }

    if (reason) {
      refundData.reason = reason; // 'duplicate', 'fraudulent', 'requested_by_customer'
    }

    const refund = await stripe.refunds.create(refundData);

    console.log(`✅ Reembolso creado: ${refund.id} - Status: ${refund.status}`);

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason
      },
      message: `Reembolso de $${(refund.amount / 100).toFixed(2)} ${refund.currency.toUpperCase()} procesado exitosamente`
    });

  } catch (error: any) {
    console.error('❌ Error procesando reembolso:', error);
    
    // Mensajes de error más amigables
    let errorMessage = error.message;
    if (error.code === 'charge_already_refunded') {
      errorMessage = 'Este pago ya fue reembolsado completamente';
    } else if (error.code === 'insufficient_funds') {
      errorMessage = 'Fondos insuficientes para procesar el reembolso';
    }

    return NextResponse.json({ 
      error: errorMessage,
      code: error.code
    }, { status: 500 });
  }
}

