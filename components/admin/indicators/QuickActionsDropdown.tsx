'use client';

import { useState } from 'react';
import { ChevronDown, Gift, Zap, RefreshCw, Ban } from 'lucide-react';

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
      description: 'Otorgar acceso (1 año) a todos los indicadores premium',
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
    setShowConfirmModal(true);
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
          duration_type: selectedAction.type === 'grant-all-premium' ? '1Y' : undefined
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error ejecutando acción');
      }

      alert(
        `✅ ${selectedAction.title}\n\n${result.message}\n\n` +
          `Exitosos: ${result.results?.successful || 0}\n` +
          `Fallidos: ${result.results?.failed || 0}`
      );

      onActionComplete();
      setShowConfirmModal(false);
      setSelectedAction(null);
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
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
    </>
  );
}

