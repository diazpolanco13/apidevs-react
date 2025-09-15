'use client';

import { Tables } from '@/types_db';

type Subscription = Tables<'subscriptions'>;
type Price = Tables<'prices'>;
type Product = Tables<'products'>;

type SubscriptionWithPriceAndProduct = Subscription & {
  prices:
    | (Price & {
        products: Product | null;
      })
    | null;
};

interface Props {
  subscription: SubscriptionWithPriceAndProduct;
}

export default function PaymentHistory({ subscription }: Props) {
  const handleViewFullHistory = () => {
    window.open('https://billing.stripe.com/p/login/test_5kQ3cxghCbkbgcge1e97G00', '_blank');
  };

  return (
    <div className="bg-black/30 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Historial de Pagos</h3>
        <span className="text-sm text-gray-400">Últimos pagos</span>
      </div>
      
      <div className="space-y-3">
        {/* Latest Payment Entry */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-xl border border-gray-700/50 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center border border-green-500/30 flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white font-semibold text-sm sm:text-base truncate">{subscription.prices?.products?.name}</div>
              <div className="text-gray-400 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                <span>15 de septiembre de 2025</span>
                <span className="hidden sm:block w-1 h-1 bg-gray-500 rounded-full"></span>
                <span>Factura #{subscription.id.slice(-8)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end sm:text-right space-x-2">
            <div className="text-white font-bold text-lg sm:text-xl">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: subscription.prices?.currency || 'USD',
                minimumFractionDigits: 0
              }).format((subscription.prices?.unit_amount || 0) / 100)}
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400 text-sm font-medium">Pagado</span>
            </div>
          </div>
        </div>

        {/* Upcoming Payment (if not canceled) */}
        {!subscription.cancel_at_period_end && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gradient-to-r from-blue-900/20 to-blue-800/10 rounded-xl border border-blue-700/30 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-white font-semibold text-sm sm:text-base">Próximo Pago</div>
                <div className="text-gray-400 text-xs sm:text-sm">
                  {new Date(subscription.current_period_end).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end sm:text-right space-x-2">
              <div className="text-white font-bold text-lg sm:text-xl">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: subscription.prices?.currency || 'USD',
                  minimumFractionDigits: 0
                }).format((subscription.prices?.unit_amount || 0) / 100)}
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-blue-400 text-sm font-medium">Pendiente</span>
              </div>
            </div>
          </div>
        )}

        {/* View More Button */}
        <button
          onClick={handleViewFullHistory}
          className="w-full py-3 text-gray-400 hover:text-white text-sm border border-gray-700 hover:border-gray-600 rounded-xl transition-all"
        >
          Ver historial completo →
        </button>
      </div>
    </div>
  );
}
