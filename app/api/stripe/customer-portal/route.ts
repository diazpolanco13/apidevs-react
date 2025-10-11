import { stripe } from '@/utils/stripe/config';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { getURL } from '@/utils/helpers';

interface Customer {
  stripe_customer_id: string | null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const returnUrl = searchParams.get('return_url') || '/account/suscripcion';

    // Verificar autenticación
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(getURL('/signin'));
    }

    // Obtener customer de Supabase
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single() as { data: Customer | null; error: any };

    if (customerError || !customer?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No se encontró información del cliente en Stripe' },
        { status: 404 }
      );
    }

    // Crear sesión del portal de Stripe
    const { url } = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: getURL(returnUrl)
    });

    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear sesión del portal' },
      { status: 500 }
    );
  }
}

