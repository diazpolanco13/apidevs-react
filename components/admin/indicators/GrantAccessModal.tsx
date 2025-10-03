'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

type Indicator = {
  id: string;
  pine_id: string;
  name: string;
};

type Props = {
  indicator: Indicator;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function GrantAccessModal({
  indicator,
  isOpen,
  onClose,
  onSuccess
}: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tradingview_username: '',
    duration_type: '30D' as '7D' | '30D' | '1Y' | '1L'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/indicators/${indicator.id}/grant-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess();
        setFormData({
          tradingview_username: '',
          duration_type: '30D'
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'No se pudo conceder el acceso'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al conceder el acceso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl transition-all">
                {/* Header */}
                <Dialog.Title className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                      <svg
                        className="h-5 w-5 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Conceder Acceso
                      </h3>
                      <p className="text-sm text-gray-400">{indicator.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-zinc-800 hover:text-white"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </Dialog.Title>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* TradingView Username */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      TradingView Username <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="diazpolanco13"
                      value={formData.tradingview_username}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tradingview_username: e.target.value
                        })
                      }
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 font-mono text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Usuario de TradingView al que se le concederá acceso
                    </p>
                  </div>

                  {/* Duración */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Duración del Acceso <span className="text-red-400">*</span>
                    </label>
                    <select
                      required
                      value={formData.duration_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration_type: e.target.value as any
                        })
                      }
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="7D">7 días (Trial)</option>
                      <option value="30D">30 días (Mensual)</option>
                      <option value="1Y">1 año (Anual)</option>
                      <option value="1L">Lifetime (Permanente)</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-400">
                      Selecciona la duración del acceso al indicador
                    </p>
                  </div>

                  {/* Info Box */}
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                    <div className="flex gap-3">
                      <svg
                        className="h-5 w-5 flex-shrink-0 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="text-sm text-blue-300">
                        <p className="font-medium">¿Cómo funciona?</p>
                        <p className="mt-1 text-blue-400">
                          Al conceder acceso, se enviará una solicitud al
                          microservicio de TradingView para dar acceso al
                          indicador <strong>{indicator.name}</strong> (Pine ID:{' '}
                          <code className="rounded bg-blue-900/50 px-1 py-0.5">
                            {indicator.pine_id}
                          </code>
                          ) al usuario especificado.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 font-medium text-white transition-all hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50"
                    >
                      {loading ? 'Concediendo acceso...' : 'Conceder Acceso'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

