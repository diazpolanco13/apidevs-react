import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

export const getUser = cache(async (supabase: SupabaseClient<any, "public", any>) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export const getSubscription = async (supabase: SupabaseClient<any, "public", any>) => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('❌ No user found in getSubscription');
    return null;
  }

  console.log('🔍 Fetching subscription for user:', user.id);

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .eq('user_id', user.id)  // Explicit user_id filter
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  if (error) {
    console.error('❌ Error fetching subscription:', error);
    return null;
  }

  console.log('✅ Subscription found:', subscription ? `${subscription.status} - ${subscription.id}` : 'null');

  return subscription;
};

export const getProducts = cache(async (supabase: SupabaseClient<any, "public", any>) => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Filter products to only include active prices on the client side
  const productsWithActivePrices = products?.map(product => ({
    ...product,
    prices: product.prices?.filter((price: any) => price.active) || []
  })) || [];

  return productsWithActivePrices;
});

export const getUserDetails = cache(async (supabase: SupabaseClient<any, "public", any>) => {
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();
  return userDetails;
});
