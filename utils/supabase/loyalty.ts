import { SupabaseClient } from '@supabase/supabase-js';
import { LoyaltyProfile, CustomerTier } from '@/types/loyalty';

/**
 * Obtiene el perfil de lealtad de un usuario
 */
export async function getUserLoyaltyProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<LoyaltyProfile | null> {
  try {
    const { data, error } = await (supabase as any)
      .from('users')
      .select(`
        is_legacy_user,
        legacy_customer_type,
        customer_tier,
        loyalty_discount_percentage,
        total_lifetime_spent,
        purchase_count,
        customer_since,
        first_purchase_date,
        last_purchase_date,
        tier_unlocked_at
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching loyalty profile:', error);
      return null;
    }

    return data as LoyaltyProfile;
  } catch (error) {
    console.error('Error in getUserLoyaltyProfile:', error);
    return null;
  }
}

/**
 * Actualiza el tier y descuento de un usuario basado en su gasto total
 */
export async function updateUserTier(
  supabase: SupabaseClient,
  userId: string,
  totalSpent: number
): Promise<{ tier: CustomerTier; discount: number } | null> {
  try {
    // Calcular nuevo tier
    let tier: CustomerTier = 'free';
    let discount = 0;

    if (totalSpent >= 500) {
      tier = 'diamond';
      discount = 30;
    } else if (totalSpent >= 200) {
      tier = 'gold';
      discount = 20;
    } else if (totalSpent >= 100) {
      tier = 'silver';
      discount = 15;
    } else if (totalSpent >= 50) {
      tier = 'bronze';
      discount = 10;
    } else if (totalSpent > 0) {
      tier = 'starter';
      discount = 5;
    }

    // Actualizar en base de datos
    const { error } = await (supabase as any)
      .from('users')
      .update({
        customer_tier: tier,
        loyalty_discount_percentage: discount,
        total_lifetime_spent: totalSpent,
        tier_unlocked_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user tier:', error);
      return null;
    }

    return { tier, discount };
  } catch (error) {
    console.error('Error in updateUserTier:', error);
    return null;
  }
}

/**
 * Sincroniza datos de legacy user al crear cuenta
 */
export async function syncLegacyUserData(
  supabase: SupabaseClient,
  userId: string,
  email: string
): Promise<boolean> {
  try {
    // Buscar en legacy_users
    const { data: legacyUser, error: legacyError } = await (supabase as any)
      .from('legacy_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (legacyError || !legacyUser) {
      return false; // No es legacy user
    }

    // Obtener purchases
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
    let tier: CustomerTier = 'free';
    let discount = 0;

    if (totalSpent >= 500) {
      tier = 'diamond';
      discount = 30;
    } else if (totalSpent >= 200) {
      tier = 'gold';
      discount = 20;
    } else if (totalSpent >= 100) {
      tier = 'silver';
      discount = 15;
    } else if (totalSpent >= 50) {
      tier = 'bronze';
      discount = 10;
    } else if (totalSpent > 0) {
      tier = 'starter';
      discount = 5;
    }

    const customerType = hasLifetime ? 'vip' : (totalSpent > 0 ? 'paid' : 'free');

    // Actualizar usuario con datos legacy
    const { error: updateError } = await (supabase as any)
      .from('users')
      .update({
        is_legacy_user: true,
        legacy_customer_type: customerType,
        customer_tier: tier,
        loyalty_discount_percentage: discount,
        total_lifetime_spent: totalSpent,
        purchase_count: purchaseCount,
        customer_since: legacyUser.wordpress_created_at || new Date().toISOString(),
        first_purchase_date: purchases?.[0]?.order_date,
        last_purchase_date: purchases?.[purchases.length - 1]?.order_date,
        tier_unlocked_at: new Date().toISOString(),
        legacy_imported_at: new Date().toISOString(),
        legacy_original_data: legacyUser
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error syncing legacy user data:', updateError);
      return false;
    }

    console.log(`✅ Legacy user synced: ${email} - Tier: ${tier} (${discount}% OFF)`);
    return true;

  } catch (error) {
    console.error('Error in syncLegacyUserData:', error);
    return false;
  }
}

