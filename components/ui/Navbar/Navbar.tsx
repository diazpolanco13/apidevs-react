import { createClient } from '@/utils/supabase/server';
import s from './Navbar.module.css';
import Navlinks from './Navlinks';

export default async function Navbar() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Obtener avatar_url, user_status, unread_notifications y suscripción del perfil
  let avatarUrl = null;
  let userStatus = 'online';
  let unreadNotifications = 0;
  let subscriptionType = null;
  
  if (user?.id) {
    const { data: profile } = await (supabase as any)
      .from('users')
      .select('avatar_url, user_status, unread_notifications')
      .eq('id', user.id)
      .single();
    
    avatarUrl = profile?.avatar_url || null;
    userStatus = profile?.user_status || 'online';
    unreadNotifications = profile?.unread_notifications || 0;

    // PRIMERO: Verificar si tiene compra Lifetime (one-time payment)
    const { data: lifetimePurchase } = await (supabase as any)
      .from('purchases')
      .select('id, is_lifetime_purchase, product_name')
      .eq('customer_email', user.email)
      .eq('is_lifetime_purchase', true)
      .eq('payment_status', 'paid')
      .order('order_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (lifetimePurchase) {
      subscriptionType = 'lifetime';
    } else {
      // SEGUNDO: Si no tiene Lifetime, buscar suscripción activa (mensual/anual)
      const { data: subscription } = await (supabase as any)
        .from('subscriptions')
        .select(`
          id,
          status,
          prices (
            products (
              name,
              metadata
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (subscription?.prices?.products) {
        const productName = subscription.prices.products.name || '';
        const metadata = subscription.prices.products.metadata || {};
        
        // Detectar tipo de plan (solo existen: Free, Pro, Lifetime)
        if (metadata.type === 'lifetime' || productName.toLowerCase().includes('lifetime')) {
          subscriptionType = 'lifetime';
        } else if (productName.toLowerCase().includes('pro')) {
          subscriptionType = 'pro';
        }
        // Si no es lifetime ni pro, será null y mostrará "Usuario Free"
      }
    }
  }

  return (
    <nav className={s.root}>
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className="max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 mx-auto">
        <Navlinks 
          user={user} 
          avatarUrl={avatarUrl} 
          userStatus={userStatus}
          unreadNotifications={unreadNotifications}
          subscriptionType={subscriptionType}
        />
      </div>
    </nav>
  );
}
