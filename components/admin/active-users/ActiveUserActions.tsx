'use client';

import { Shield, Lock, Ban, DollarSign, Mail, AlertTriangle } from 'lucide-react';

interface ActiveUserActionsProps {
  userId: string;
  userEmail: string;
  userName: string;
}

export default function ActiveUserActions({
  userId,
  userEmail,
  userName
}: ActiveUserActionsProps) {
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-red-400" />
          <h2 className="text-xl font-bold text-white">Acciones Administrativas</h2>
        </div>
        <p className="text-gray-400 text-sm">
          Gestión de cuenta, suscripciones y acciones críticas del usuario
        </p>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reset Password */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/30 rounded-xl p-5 hover:scale-105 transition-all cursor-pointer">
          <Lock className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Restablecer Contraseña</h3>
          <p className="text-sm text-gray-400 mb-4">
            Enviar email de recuperación al usuario
          </p>
          <button 
            disabled
            className="w-full px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 text-sm opacity-50 cursor-not-allowed"
          >
            Próximamente
          </button>
        </div>

        {/* Cancel Subscription */}
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/30 rounded-xl p-5 hover:scale-105 transition-all cursor-pointer">
          <Ban className="w-8 h-8 text-orange-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Cancelar Suscripción</h3>
          <p className="text-sm text-gray-400 mb-4">
            Cancelar la suscripción activa del usuario
          </p>
          <button 
            disabled
            className="w-full px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/30 text-sm opacity-50 cursor-not-allowed"
          >
            Próximamente
          </button>
        </div>

        {/* Process Refund */}
        <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-xl border border-red-500/30 rounded-xl p-5 hover:scale-105 transition-all cursor-pointer">
          <DollarSign className="w-8 h-8 text-red-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Procesar Reembolso</h3>
          <p className="text-sm text-gray-400 mb-4">
            Reembolsar pagos a través de Stripe
          </p>
          <button 
            disabled
            className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 text-sm opacity-50 cursor-not-allowed"
          >
            Próximamente
          </button>
        </div>

        {/* Send Email */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-xl p-5 hover:scale-105 transition-all cursor-pointer">
          <Mail className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Enviar Email</h3>
          <p className="text-sm text-gray-400 mb-4">
            Comunicación directa con el usuario
          </p>
          <button 
            disabled
            className="w-full px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 text-sm opacity-50 cursor-not-allowed"
          >
            Próximamente
          </button>
        </div>
      </div>

      {/* Warning Message */}
      <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              🚧 FASE 5 - Acciones Críticas (En Desarrollo)
            </h3>
            <p className="text-gray-400 text-sm">
              Estas acciones administrativas requieren confirmación y permisos especiales. 
              Incluirán: reset de contraseña, cancelación de suscripciones, procesamiento de reembolsos, 
              envío de emails personalizados y gestión avanzada de cuentas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

