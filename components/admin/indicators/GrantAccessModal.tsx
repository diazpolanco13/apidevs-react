'use client';

import { useState, useEffect } from 'react';
import { X, Lock, Calendar } from 'lucide-react';

type Indicator = {
  id: string;
  pine_id: string;
  name: string;
  description: string | null;
  category: string;
  access_tier: string;
  status: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  onSuccess: () => void;
};

export default function GrantAccessModal({
  isOpen,
  onClose,
  userId,
  userEmail,
  onSuccess
}: Props) {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState('');
  const [durationType, setDurationType] = useState<'7D' | '30D' | '1Y' | '1L'>('30D');
  const [loading, setLoading] = useState(false);
  const [loadingIndicators, setLoadingIndicators] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar indicadores activos
  useEffect(() => {
    if (isOpen) {
      loadIndicators();
    }
  }, [isOpen]);

  const loadIndicators = async () => {
    setLoadingIndicators(true);
    try {
      const response = await fetch('/api/admin/indicators');
      if (!response.ok) throw new Error('Error cargando indicadores');

      const data = await response.json();
      const activeIndicators = (data.indicators || []).filter((i: Indicator) => i.status === 'activo');
      setIndicators(activeIndicators);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingIndicators(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedIndicatorId) {
      setError('Selecciona un indicador');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}/grant-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          indicator_id: selectedIndicatorId,
          duration_type: durationType
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error concediendo acceso');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedIndicatorId('');
    setDurationType('30D');
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  const selectedIndicator = indicators.find((i) => i.id === selectedIndicatorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-6">
          <div>
            <h2 className="text-xl font-bold text-white">Conceder Acceso Individual</h2>
            <p className="text-sm text-gray-400">Usuario: {userEmail}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Seleccionar indicador */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Indicador <span className="text-red-400">*</span>
              </label>
              {loadingIndicators ? (
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 text-center text-gray-400">
                  Cargando indicadores...
                </div>
              ) : (
                <select
                  value={selectedIndicatorId}
                  onChange={(e) => setSelectedIndicatorId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                >
                  <option value="">-- Seleccionar indicador --</option>
                  {indicators.map((indicator) => (
                    <option key={indicator.id} value={indicator.id}>
                      {indicator.name} ({indicator.category}) [
                      {indicator.access_tier === 'premium' ? '💎 Premium' : '🎁 Free'}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Duración */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Duración <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setDurationType('7D')}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    durationType === '7D'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : 'border-zinc-700 bg-zinc-800/50 text-gray-400 hover:border-zinc-600'
                  }`}
                >
                  <p className="text-xs font-medium">7 Días</p>
                  <p className="mt-1 text-lg font-bold">7D</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDurationType('30D')}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    durationType === '30D'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : 'border-zinc-700 bg-zinc-800/50 text-gray-400 hover:border-zinc-600'
                  }`}
                >
                  <p className="text-xs font-medium">30 Días</p>
                  <p className="mt-1 text-lg font-bold">30D</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDurationType('1Y')}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    durationType === '1Y'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : 'border-zinc-700 bg-zinc-800/50 text-gray-400 hover:border-zinc-600'
                  }`}
                >
                  <p className="text-xs font-medium">1 Año</p>
                  <p className="mt-1 text-lg font-bold">1Y</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDurationType('1L')}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    durationType === '1L'
                      ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                      : 'border-zinc-700 bg-zinc-800/50 text-gray-400 hover:border-zinc-600'
                  }`}
                >
                  <p className="text-xs font-medium">Lifetime</p>
                  <p className="mt-1 text-lg font-bold">∞</p>
                </button>
              </div>
            </div>

            {/* Resumen */}
            {selectedIndicator && (
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-blue-400">
                  Resumen
                </p>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center justify-between">
                    <span className="text-gray-400">Indicador:</span>
                    <span className="font-medium text-white">
                      {selectedIndicator.name}
                    </span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-gray-400">Tipo:</span>
                    <span
                      className={
                        selectedIndicator.access_tier === 'premium'
                          ? 'font-medium text-amber-400'
                          : 'font-medium text-green-400'
                      }
                    >
                      {selectedIndicator.access_tier === 'premium'
                        ? '💎 Premium'
                        : '🎁 Free'}
                    </span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-gray-400">Duración:</span>
                    <span className="font-medium text-white">
                      {durationType === '7D' && '7 días'}
                      {durationType === '30D' && '30 días'}
                      {durationType === '1Y' && '1 año'}
                      {durationType === '1L' && '∞ Lifetime'}
                    </span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-gray-400">Expira:</span>
                    <span className="font-medium text-white">
                      {durationType === '1L'
                        ? 'Nunca'
                        : new Date(
                            Date.now() +
                              (durationType === '7D'
                                ? 7
                                : durationType === '30D'
                                  ? 30
                                  : 365) *
                                24 *
                                60 *
                                60 *
                                1000
                          ).toLocaleDateString('es-ES')}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="text-sm text-emerald-400">
                  ✅ Acceso concedido exitosamente! El usuario puede usar el
                  indicador en TradingView.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 font-medium text-gray-300 transition-colors hover:bg-zinc-800"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-emerald-500 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
              disabled={loading || loadingIndicators || !selectedIndicatorId}
            >
              {loading ? 'Concediendo...' : '✅ Conceder Acceso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
