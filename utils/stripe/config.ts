import Stripe from 'stripe';

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY ?? '',
  {
    // https://github.com/stripe/stripe-node#configuration
    // https://stripe.com/docs/api/versioning
    // Actualizado a la última versión estable
    apiVersion: '2024-11-20.acacia',
    // Register this as an official Stripe plugin.
    // https://stripe.com/docs/building-plugins#setappinfo
    appInfo: {
      name: 'APIDevs Trading Platform',
      version: '1.0.0',
      url: 'https://apidevs-react.vercel.app'
    }
  }
);
