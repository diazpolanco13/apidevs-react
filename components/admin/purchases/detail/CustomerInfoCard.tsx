'use client';

import Link from 'next/link';
import { User, Mail, MapPin, ShoppingBag, DollarSign, ArrowRight, CheckCircle } from 'lucide-react';

interface CustomerInfoCardProps {
  purchase: any;
  customerInfo: any;
}

export default function CustomerInfoCard({ purchase, customerInfo }: CustomerInfoCardProps) {
  const customerEmail = purchase.customer_email || 'No disponible';
  const customerName = customerInfo?.email?.split('@')[0] || customerEmail.split('@')[0] || 'Cliente';
  
  // Iniciales para avatar
  const initials = customerName.substring(0, 2).toUpperCase();

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 sticky top-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-purple-500/20">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
          {initials}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-0.5">
            {customerName}
          </h3>
          {customerInfo && (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle className="w-3 h-3" />
              <span>Email verificado</span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-4">
        {/* Email */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            <Mail className="w-3 h-3" />
            Email
          </div>
          <div className="text-sm text-white break-all">
            {customerEmail}
          </div>
        </div>

        {/* Location */}
        {customerInfo && (customerInfo.city || customerInfo.country) && (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              <MapPin className="w-3 h-3" />
              Ubicación
            </div>
            <div className="text-sm text-white">
              {customerInfo.city && customerInfo.country 
                ? `${customerInfo.city}, ${customerInfo.country}`
                : customerInfo.country || customerInfo.city || 'No disponible'
              }
            </div>
          </div>
        )}

        {/* Purchase Stats */}
        {customerInfo && (
          <>
            <div className="pt-4 border-t border-purple-500/20">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                <ShoppingBag className="w-3 h-3" />
                Estadísticas de Compra
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Total Compras */}
                <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
                  <div className="text-xs text-gray-500 mb-1">Total Compras</div>
                  <div className="text-lg font-bold text-white">
                    {customerInfo.purchase_count || 1}
                  </div>
                </div>

                {/* Lifetime Value */}
                <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
                  <div className="text-xs text-gray-500 mb-1">LTV</div>
                  <div className="text-lg font-bold text-green-400">
                    ${((customerInfo.total_lifetime_spent || 0) / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Badge */}
            {customerInfo.purchase_count > 1 && (
              <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-xl p-3 text-center">
                <div className="text-xs text-orange-400 font-medium">
                  🎯 Esta es la compra #{customerInfo.purchase_count} de este cliente
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action */}
      {customerInfo && (
        <Link
          href={`/admin/users/active/${customerInfo.id}`}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-semibold transition-all group"
        >
          <User className="w-4 h-4" />
          Ver Perfil Completo
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

