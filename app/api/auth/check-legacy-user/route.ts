import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Buscar en legacy_users
    const { data: legacyUser, error: legacyError } = await (supabase as any)
      .from('legacy_users')
      .select(`
        id,
        email,
        full_name,
        customer_type,
        legacy_customer,
        legacy_discount_percentage,
        wordpress_created_at
      `)
      .eq('email', email.toLowerCase().trim())
      .single();

    // Si no es legacy user
    if (legacyError || !legacyUser) {
      return NextResponse.json({
        isLegacy: false,
        message: 'New user - no legacy data found'
      });
    }

    // Calcular estadísticas de purchases
    const { data: purchases } = await (supabase as any)
      .from('purchases')
      .select('order_total_cents, order_date, is_lifetime_purchase')
      .eq('legacy_user_id', legacyUser.id)
      .eq('revenue_valid_for_metrics', true);

    const totalSpent = purchases?.reduce(
      (sum: number, p: any) => sum + (p.order_total_cents / 100),
      0
    ) || 0;
    
    const purchaseCount = purchases?.length || 0;
    
    const hasLifetime = purchases?.some((p: any) => p.is_lifetime_purchase) || false;

    // Calcular tier
    let tier = 'free';
    if (totalSpent >= 500) tier = 'diamond';
    else if (totalSpent >= 200) tier = 'gold';
    else if (totalSpent >= 100) tier = 'silver';
    else if (totalSpent >= 50) tier = 'bronze';
    else if (totalSpent > 0) tier = 'starter';

    // Determinar tipo de cliente
    const customerType = hasLifetime ? 'vip' : (totalSpent > 0 ? 'paid' : 'free');

    return NextResponse.json({
      isLegacy: true,
      legacyData: {
        full_name: legacyUser.full_name,
        customer_type: customerType,
        customer_since: legacyUser.wordpress_created_at,
        tier: tier,
        discount_percentage: legacyUser.legacy_discount_percentage || 0,
        purchase_count: purchaseCount,
        has_lifetime: hasLifetime
      },
      message: customerType === 'free' 
        ? 'Legacy free user detected' 
        : `Legacy ${tier} member detected - ${legacyUser.legacy_discount_percentage}% discount available`
    });

  } catch (error) {
    console.error('Error checking legacy user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

