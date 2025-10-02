'use client';

import { Package, Tag, DollarSign, Percent, Calendar, Infinity } from 'lucide-react';

interface ProductInfoCardProps {
  purchase: any;
}

export default function ProductInfoCard({ purchase }: ProductInfoCardProps) {
  const basePrice = purchase.order_total_cents / 100;
  const discountAmount = purchase.discount_amount_cents 
    ? purchase.discount_amount_cents / 100 
    : 0;
  const finalAmount = purchase.order_total_cents / 100;

  // Calcular porcentaje de descuento
  const discountPercent = discountAmount > 0 
    ? ((discountAmount / (basePrice + discountAmount)) * 100).toFixed(0)
    : 0;

  return (
    <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-700/50">
        <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
          <Package className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            Producto/Servicio
          </h3>
          <p className="text-sm text-gray-400">
            Detalles del producto adquirido
          </p>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Product Name */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            <Tag className="w-3 h-3" />
            Producto
          </div>
          <div className="text-lg font-semibold text-white">
            {purchase.product_name || 'Producto sin nombre'}
          </div>
          {purchase.is_lifetime_purchase && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-lg">
              <Infinity className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-semibold text-orange-400">Acceso Lifetime</span>
            </div>
          )}
        </div>

        {/* Pricing Breakdown */}
        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
          <div className="space-y-3">
            {/* Base Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <DollarSign className="w-4 h-4" />
                Precio Base
              </div>
              <div className="text-sm font-medium text-white">
                ${(basePrice + discountAmount).toFixed(2)}
              </div>
            </div>

            {/* Discount */}
            {discountAmount > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-orange-400">
                  <Percent className="w-4 h-4" />
                  Descuento ({discountPercent}%)
                </div>
                <div className="text-sm font-medium text-orange-400">
                  -${discountAmount.toFixed(2)}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-700/50"></div>

            {/* Final Amount */}
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-white">
                Monto Final
              </div>
              <div className="text-2xl font-bold text-green-400">
                ${finalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Duration / Type */}
        <div className="grid grid-cols-2 gap-4">
          {/* Type */}
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
            <div className="text-xs text-gray-500 mb-2">Tipo</div>
            <div className="text-sm font-semibold text-white">
              {purchase.is_lifetime_purchase ? 'Lifetime' : 'Suscripción'}
            </div>
          </div>

          {/* Duration */}
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
            <div className="text-xs text-gray-500 mb-2">Duración</div>
            <div className="text-sm font-semibold text-white flex items-center gap-1">
              {purchase.is_lifetime_purchase ? (
                <>
                  <Infinity className="w-4 h-4 text-orange-400" />
                  <span>Permanente</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>1 Año</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {purchase.product_description && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Descripción
            </div>
            <div className="text-sm text-gray-400">
              {purchase.product_description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

