'use client';

import { useState, useEffect } from 'react';
import { Tables } from '@/types_db';
import { createClient } from '@/utils/supabase/client';
import { ChevronDown, ChevronUp, Clock, CheckCircle, Crown } from 'lucide-react';

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

interface Purchase {
  id: string;
  order_number: string;
  order_total_cents: number;
  product_name: string;
  order_date: string;
  order_status: string;
  is_lifetime_purchase: boolean;
  product_category: string;
  legacy_user_id: string | null;
}

interface Props {
  subscription: SubscriptionWithPriceAndProduct | null;
  userEmail: string;
  actualPricePaid?: number | null;
  lastPaymentDate?: string | null;
}

// Función para mapear nombres técnicos a nombres amigables
const mapProductName = (productName: string, interval?: string): string => {
  if (productName === 'APIDevs Trading Indicators') {
    if (interval === 'year') return 'Plan PRO Anual';
    if (interval === 'month') return 'Plan PRO Mensual';
    return 'Plan PRO';
  }
  if (productName.toLowerCase().includes('lifetime')) {
    return 'Plan Lifetime Access';
  }
  return productName;
};

export default function PaymentHistory({ subscription, userEmail, actualPricePaid, lastPaymentDate }: Props) {
  const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  
  const INITIAL_DISPLAY_COUNT = 5;

  useEffect(() => {
    const fetchAllPurchases = async () => {
      try {
        const supabase = createClient();
        // ✅ Obtener TODAS las compras del usuario
        const { data, error } = await supabase
          .from('purchases')
          .select('id, order_number, order_total_cents, product_name, order_date, order_status, is_lifetime_purchase, product_category, legacy_user_id')
          .eq('customer_email', userEmail)
          .eq('order_status', 'completed')
          .is('legacy_user_id', null)
          .order('order_date', { ascending: false });

        if (error) {
          console.error('Error fetching purchases:', error);
        } else {
          setAllPurchases(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchAllPurchases();
    }
  }, [userEmail]);

  const displayedPurchases = showAll ? allPurchases : allPurchases.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = allPurchases.length > INITIAL_DISPLAY_COUNT;
  const lastPurchase = allPurchases[0]; // Último pago (más reciente)

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(cents / 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  return (
    <div className="space-y-4">
      {/* Resumen: Último Pago y Próximo Pago */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Último Pago */}
        {lastPurchase && (
          <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-semibold text-gray-400">Último Pago</h3>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">
                {formatCurrency(lastPurchase.order_total_cents)}
              </div>
              <div className="text-sm text-gray-400">
                {formatDate(lastPurchase.order_date)}
              </div>
              <div className="text-xs text-gray-500">
                #{lastPurchase.order_number}
              </div>
            </div>
          </div>
        )}

        {/* Próximo Pago */}
        {subscription && !subscription.cancel_at_period_end && (
          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-semibold text-gray-400">Próximo Pago</h3>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">
                {formatCurrency((actualPricePaid || subscription.prices?.unit_amount || 0))}
              </div>
              <div className="text-sm text-gray-400">
                {new Date(subscription.current_period_end).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'UTC'
                })}
              </div>
              <div className="text-xs text-blue-400 font-medium">
                • Renovación automática
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Historial Completo */}
      <div className="bg-black/30 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Historial de Pagos</h3>
          <span className="text-sm text-gray-400">{allPurchases.length} total</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse p-3 bg-gray-800/50 rounded-xl">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : allPurchases.length > 0 ? (
          <>
            {/* Lista de Pagos (Compacta) */}
            <div className="space-y-2">
              {displayedPurchases.map((purchase) => {
                const isLifetime = purchase.is_lifetime_purchase;
                const isFree = purchase.order_total_cents === 0;

                return (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl transition-colors"
                  >
                    {/* Izquierda: Icono + Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Icono */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isLifetime
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : isFree
                            ? 'bg-gray-500/20 text-gray-400'
                            : 'bg-green-500/20 text-green-400'
                      }`}>
                        {isLifetime ? (
                          <Crown className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {mapProductName(purchase.product_name)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{formatDate(purchase.order_date)}</span>
                          <span>•</span>
                          <span className="truncate">#{purchase.order_number}</span>
                        </div>
                      </div>
                    </div>

                    {/* Derecha: Monto + Badge */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-base font-bold text-white">
                          {formatCurrency(purchase.order_total_cents)}
                        </div>
                        {isLifetime && (
                          <div className="text-xs text-yellow-400 font-medium">
                            Lifetime
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Botón Ver Más / Ver Menos */}
            {hasMore && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-4 py-3 text-sm font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {showAll ? (
                  <>
                    Ver menos
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Ver {allPurchases.length - INITIAL_DISPLAY_COUNT} más
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <div className="p-6 text-center text-gray-400">
            No hay compras registradas
          </div>
        )}
      </div>
    </div>
  );
}
