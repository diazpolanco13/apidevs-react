'use server';

import Stripe from 'stripe';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@/utils/supabase/server';
import { createOrRetrieveCustomer } from '@/utils/supabase/admin';
import {
  getURL,
  getErrorRedirect,
  calculateTrialEndUnixTimestamp
} from '@/utils/helpers';
import { Tables } from '@/types_db';

type Price = Tables<'prices'>;

type CheckoutResponse = {
  errorRedirect?: string;
  sessionId?: string; // Deprecated - mantener por compatibilidad
  checkoutUrl?: string; // Stripe.js v8+ - URL directa de checkout
};

export async function checkoutWithStripe(
  price: Price,
  redirectPath: string = '/account/success'
): Promise<CheckoutResponse> {
  console.log('checkoutWithStripe called with price:', price);
  try {
    // Get the user from Supabase auth
    const supabase = await createClient();
    const {
      error,
      data: { user }
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error(error);
      throw new Error('Could not get user session.');
    }

    // Get user's loyalty discount percentage
    const { data: userData } = await (supabase as any)
      .from('users')
      .select('loyalty_discount_percentage, is_legacy_user, customer_tier')
      .eq('id', user.id)
      .single();

    const discountPercentage = userData?.loyalty_discount_percentage || 0;
    
    if (discountPercentage > 0) {
      console.log(`🎁 Applying ${discountPercentage}% loyalty discount for user ${user.email}`);
    }

    // Retrieve or create the customer in Stripe
    let customer: string;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user?.id || '',
        email: user?.email || ''
      });
    } catch (err) {
      console.error(err);
      throw new Error('Unable to access customer record.');
    }

    // Create or retrieve loyalty coupon if user has discount
    let couponId: string | undefined;
    if (discountPercentage > 0) {
      try {
        const couponIdName = `loyalty_${discountPercentage}_percent`;
        
        // Try to retrieve existing coupon
        let existingCoupon;
        try {
          existingCoupon = await stripe.coupons.retrieve(couponIdName);
        } catch (err) {
          // Coupon doesn't exist, create it
          existingCoupon = await stripe.coupons.create({
            id: couponIdName,
            name: `Loyalty Discount ${discountPercentage}%`,
            percent_off: discountPercentage,
            duration: 'forever',
            metadata: {
              type: 'loyalty_discount',
              auto_applied: 'true'
            }
          });
          console.log(`✅ Created loyalty coupon: ${couponIdName}`);
        }
        
        couponId = existingCoupon.id;
      } catch (err) {
        console.error('Error creating/retrieving coupon:', err);
        // Continue without discount if coupon creation fails
      }
    }

    let params: Stripe.Checkout.SessionCreateParams = {
      billing_address_collection: 'required',
      customer,
      customer_update: {
        address: 'auto'
      },
      line_items: [
        {
          price: price.id,
          quantity: 1
        }
      ],
      cancel_url: getURL(),
      success_url: getURL(redirectPath)
    };

    // Apply discount if available, otherwise allow manual promotion codes
    if (couponId) {
      params.discounts = [{
        coupon: couponId
      }];
      // NO incluir allow_promotion_codes cuando hay cupón aplicado
    } else {
      params.allow_promotion_codes = true; // Permitir códigos manuales si no hay descuento automático
    }

    console.log(
      'Trial end:',
      calculateTrialEndUnixTimestamp(price.trial_period_days)
    );
    if (price.type === 'recurring') {
      params = {
        ...params,
        mode: 'subscription',
        subscription_data: {
          trial_end: calculateTrialEndUnixTimestamp(price.trial_period_days)
        }
      };
    } else if (price.type === 'one_time') {
      params = {
        ...params,
        mode: 'payment'
      };
    }

    // Create a checkout session in Stripe
    console.log('Creating Stripe session with params:', JSON.stringify(params, null, 2));
    let session;
    try {
      session = await stripe.checkout.sessions.create(params);
    } catch (err) {
      console.error('Stripe checkout session error:', err);
      throw new Error('Unable to create checkout session.');
    }

    // Instead of returning a Response, just return the data or error.
    if (session) {
      return {
        sessionId: session.id, // Deprecated - mantener por compatibilidad
        checkoutUrl: session.url || undefined // Stripe.js v8+ - URL directa
      };
    } else {
      throw new Error('Unable to create checkout session.');
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          error.message,
          'Please try again later or contact a system administrator.'
        )
      };
    } else {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      };
    }
  }
}

export async function createStripePortal(currentPath: string) {
  try {
    const supabase = await createClient();
    const {
      error,
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      if (error) {
        console.error(error);
      }
      throw new Error('Could not get user session.');
    }

    let customer;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user.id || '',
        email: user.email || ''
      });
    } catch (err) {
      console.error(err);
      throw new Error('Unable to access customer record.');
    }

    if (!customer) {
      throw new Error('Could not get customer.');
    }

    try {
      const { url } = await stripe.billingPortal.sessions.create({
        customer,
        return_url: getURL('/account')
      });
      if (!url) {
        throw new Error('Could not create billing portal');
      }
      return url;
    } catch (err) {
      console.error(err);
      throw new Error('Could not create billing portal');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return getErrorRedirect(
        currentPath,
        error.message,
        'Please try again later or contact a system administrator.'
      );
    } else {
      return getErrorRedirect(
        currentPath,
        'An unknown error occurred.',
        'Please try again later or contact a system administrator.'
      );
    }
  }
}
