import { stripe } from '@/utils/stripe/config';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { getURL } from '@/utils/helpers';

interface Customer {
  stripe_customer_id: string | null;
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const returnUrl = searchParams.get('return_url') || '/account/suscripcion';
    const isAjax = req.headers.get('accept')?.includes('application/json');

    // Verificar autenticación
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      if (isAjax) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
      }
      return NextResponse.redirect(getURL('/signin'));
    }

    console.log('Authenticated user:', user.id, user.email);

    // Obtener customer de Supabase
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single() as { data: Customer | null; error: any };

    if (customerError || !customer?.stripe_customer_id) {
      console.error('Customer error:', customerError);
      console.error('Customer data:', customer);
      if (isAjax) {
        return NextResponse.json({ error: 'No se encontró información del cliente en Stripe' }, { status: 404 });
      }
      return NextResponse.redirect(getURL('/account/suscripcion?error=customer_not_found'));
    }

    // Crear sesión del portal de Stripe
    const { url } = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: getURL(returnUrl)
    });

    if (isAjax) {
      return NextResponse.json({ url });
    }
    
    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear sesión del portal' },
      { status: 500 }
    );
  }
}

