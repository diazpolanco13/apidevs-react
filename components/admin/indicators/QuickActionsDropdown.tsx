'use client';

import { useState } from 'react';
import { ChevronDown, Gift, Zap, RefreshCw, Ban, CheckCircle, XCircle } from 'lucide-react';

type Props = {
  userId: string;
  userEmail: string;
  onActionComplete: () => void;
};

export default function QuickActionsDropdown({
  userId,
  userEmail,
  onActionComplete
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<'7D' | '30D' | '1Y' | '1L'>('30D');
  const [actionResult, setActionResult] = useState<{
    success: boolean;
    message: string;
    results?: any;
  } | null>(null);
  const [selectedAction, setSelectedAction] = useState<{
    type: string;
    title: string;
    description: string;
    endpoint: string;
    color: string;
    icon: React.ReactNode;
  } | null>(null);

  const actions = [
    {
      type: 'grant-all-free',
      title: 'Conceder todos los Free',
      description: 'Otorgar acceso lifetime a todos los indicadores gratuitos',
      endpoint: `/api/admin/users/${userId}/grant-all-free`,
      color: 'green',
      icon: <Gift className="h-5 w-5" />
    },
    {
      type: 'grant-all-premium',
      title: 'Conceder todos los Premium',
      description: 'Otorgar acceso a todos los indicadores premium',
      endpoint: `/api/admin/users/${userId}/grant-all-premium`,
      color: 'amber',
      icon: <Zap className="h-5 w-5" />
    },
    {
      type: 'renew-all',
      title: 'Renovar todos los activos',
      description: 'Renovar accesos que están por expirar',
      endpoint: `/api/admin/users/${userId}/renew-all-active`,
      color: 'blue',
      icon: <RefreshCw className="h-5 w-5" />
    },
    {
      type: 'revoke-all',
      title: 'Revocar todos',
      description: 'Remover TODOS los accesos del usuario',
      endpoint: `/api/admin/users/${userId}/revoke-all`,
      color: 'red',
      icon: <Ban className="h-5 w-5" />
    }
  ];

  const handleActionClick = (action: typeof actions[0]) => {
    setSelectedAction(action);
    
    // Si es "Renovar todos activos" o "Conceder Premium", mostrar primero selector de duración
    if (action.type === 'renew-all' || action.type === 'grant-all-premium') {
      setShowDurationModal(true);
    } else {
      setShowConfirmModal(true);
    }
    
    setIsOpen(false);
  };

  const executeAction = async () => {
    if (!selectedAction) return;

    setLoading(true);
    try {
      const response = await fetch(selectedAction.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          duration_type: (selectedAction.type === 'grant-all-premium' || selectedAction.type === 'renew-all')
            ? selectedDuration 
            : undefined
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error ejecutando acción');
      }

      // Mostrar modal de resultados
      setActionResult({
        success: true,
        message: result.message || 'Operación completada',
        results: result.results
      });
      setShowResultModal(true);
      setShowConfirmModal(false);
      
      onActionComplete();
    } catch (error: any) {
      // Mostrar modal de error
      setActionResult({
        success: false,
        message: error.message || 'Error desconocido',
        results: null
      });
      setShowResultModal(true);
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Dropdown Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
        >
          <Zap className="h-4 w-4" />
          Acciones Rápidas
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-lg border border-zinc-700 bg-zinc-800 shadow-2xl">
              <div className="p-2">
                {actions.map((action) => (
                  <button
                    key={action.type}
                    onClick={() => handleActionClick(action)}
                    className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-zinc-700/50"
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-${action.color}-500/20 text-${action.color}-400`}
                    >
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{action.title}</p>
                      <p className="text-xs text-gray-400">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Selección de Duración */}
      {showDurationModal && selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-white">
              ⏰ Seleccionar Duración
            </h3>
            <p className="mb-6 text-sm text-gray-400">
              Elige por cuánto tiempo deseas renovar los accesos activos
            </p>

            <div className="mb-6 grid grid-cols-2 gap-3">
              {/* 7 Días */}
              <button
                onClick={() => setSelectedDuration('7D')}
                className={`group relative overflow-hidden rounded-xl border p-4 transition-all ${
                  selectedDuration === '7D'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    selectedDuration === '7D'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    <span className="text-lg font-bold">7</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">7 Días</p>
                    <p className="text-xs text-gray-400">Prueba corta</p>
                  </div>
                </div>
                {selectedDuration === '7D' && (
                  <div className="absolute right-2 top-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  </div>
                )}
              </button>

              {/* 30 Días */}
              <button
                onClick={() => setSelectedDuration('30D')}
                className={`group relative overflow-hidden rounded-xl border p-4 transition-all ${
                  selectedDuration === '30D'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    selectedDuration === '30D'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    <span className="text-lg font-bold">30</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">30 Días</p>
                    <p className="text-xs text-gray-400">Mensual</p>
                  </div>
                </div>
                {selectedDuration === '30D' && (
                  <div className="absolute right-2 top-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  </div>
                )}
              </button>

              {/* 1 Año */}
              <button
                onClick={() => setSelectedDuration('1Y')}
                className={`group relative overflow-hidden rounded-xl border p-4 transition-all ${
                  selectedDuration === '1Y'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    selectedDuration === '1Y'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    <span className="text-lg font-bold">1Y</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">1 Año</p>
                    <p className="text-xs text-gray-400">Anual</p>
                  </div>
                </div>
                {selectedDuration === '1Y' && (
                  <div className="absolute right-2 top-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  </div>
                )}
              </button>

              {/* Lifetime */}
              <button
                onClick={() => setSelectedDuration('1L')}
                className={`group relative overflow-hidden rounded-xl border p-4 transition-all ${
                  selectedDuration === '1L'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    selectedDuration === '1L'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    <span className="text-lg font-bold">∞</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">Lifetime</p>
                    <p className="text-xs text-gray-400">Permanente</p>
                  </div>
                </div>
                {selectedDuration === '1L' && (
                  <div className="absolute right-2 top-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  </div>
                )}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDurationModal(false);
                  setSelectedAction(null);
                  setSelectedDuration('30D');
                }}
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 font-medium text-gray-300 transition-colors hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowDurationModal(false);
                  setShowConfirmModal(true);
                }}
                className="flex-1 rounded-lg bg-emerald-500 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-600"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmModal && selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-bold text-white">
              ⚠️ Confirmar Acción
            </h3>

            <div className="mb-6 space-y-3">
              <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                <p className="mb-2 text-sm text-gray-400">Acción:</p>
                <p className="font-medium text-white">{selectedAction.title}</p>
              </div>

              <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                <p className="mb-2 text-sm text-gray-400">Usuario:</p>
                <p className="font-medium text-white">{userEmail}</p>
              </div>

              <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                <p className="text-sm text-gray-400">{selectedAction.description}</p>
              </div>

              {selectedAction.type === 'renew-all' && (
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                  <p className="mb-1 text-sm font-medium text-blue-400">
                    📅 Duración seleccionada:
                  </p>
                  <p className="text-lg font-bold text-white">
                    {selectedDuration === '7D' && '7 Días'}
                    {selectedDuration === '30D' && '30 Días (Mensual)'}
                    {selectedDuration === '1Y' && '1 Año'}
                    {selectedDuration === '1L' && 'Lifetime (Permanente)'}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    ℹ️ Solo se renovarán los indicadores que tengan fecha de expiración. Los indicadores Lifetime existentes se omitirán automáticamente.
                  </p>
                </div>
              )}

              {selectedAction.type === 'revoke-all' && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                  <p className="text-sm text-red-400">
                    ⚠️ Esta acción NO se puede deshacer. El usuario perderá acceso a
                    TODOS los indicadores inmediatamente.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedAction(null);
                  setSelectedDuration('30D');
                }}
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 font-medium text-gray-300 transition-colors hover:bg-zinc-800"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={executeAction}
                className={`flex-1 rounded-lg px-4 py-3 font-medium text-white transition-colors ${
                  selectedAction.color === 'red'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                } disabled:opacity-50`}
                disabled={loading}
              >
                {loading ? 'Ejecutando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resultados */}
      {showResultModal && actionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <div className="mb-6">
              {actionResult.success ? (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                    <CheckCircle className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">✅ Operación Exitosa</h3>
                    <p className="text-sm text-gray-400">{actionResult.message}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                    <XCircle className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">❌ Error</h3>
                    <p className="text-sm text-gray-400">{actionResult.message}</p>
                  </div>
                </div>
              )}

              {/* Estadísticas de resultados */}
              {actionResult.results && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-white">
                      {actionResult.results.total || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                    <p className="text-xs text-gray-400">Exitosos</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {actionResult.results.successful || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                    <p className="text-xs text-gray-400">Fallidos</p>
                    <p className="text-2xl font-bold text-red-400">
                      {actionResult.results.failed || 0}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setShowResultModal(false);
                setActionResult(null);
                setSelectedAction(null);
              }}
              className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-600"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

