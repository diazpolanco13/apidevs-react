'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

type Access = {
  id: string;
  user_id: string;
  indicator_id: string;
  tradingview_username: string;
  status: string;
  users: {
    email: string;
    full_name: string | null;
  } | null;
};

type Indicator = {
  id: string;
  pine_id: string;
  name: string;
};

type Props = {
  access: Access;
  indicator: Indicator;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function RevokeAccessModal({
  access,
  indicator,
  isOpen,
  onClose,
  onSuccess
}: Props) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/indicators/${indicator.id}/revoke-access`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            access_id: access.id,
            tradingview_username: access.tradingview_username,
            reason
          })
        }
      );

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'No se pudo revocar el acceso'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al revocar el acceso');
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                      <svg
                        className="h-5 w-5 text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Revocar Acceso
                      </h3>
                      <p className="text-sm text-gray-400">
                        {access.users?.full_name || 'Usuario'}
                      </p>
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

                {/* Warning Box */}
                <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                  <div className="flex gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div className="text-sm text-red-300">
                      <p className="font-medium">¡Atención!</p>
                      <p className="mt-1 text-red-400">
                        Estás a punto de revocar el acceso de{' '}
                        <strong>{access.tradingview_username}</strong> al
                        indicador <strong>{indicator.name}</strong>. Esta acción
                        eliminará inmediatamente el acceso en TradingView.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Información del Usuario */}
                  <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Email:</span>
                        <span className="text-sm text-white">
                          {access.users?.email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">
                          TradingView:
                        </span>
                        <code className="rounded bg-zinc-900 px-2 py-0.5 text-xs text-cyan-400">
                          {access.tradingview_username}
                        </code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Indicador:</span>
                        <span className="text-sm text-white">
                          {indicator.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Razón (opcional) */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Razón de la revocación (opcional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ej: Suscripción cancelada, solicitud del usuario, etc."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Esta información se guardará en el registro de auditoría
                    </p>
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
                      className="flex-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5 font-medium text-white transition-all hover:from-red-600 hover:to-red-700 disabled:opacity-50"
                    >
                      {loading ? 'Revocando...' : 'Revocar Acceso'}
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

