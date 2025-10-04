'use client';

import { CheckCircle, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface BulkOperationSummary {
  total: number;
  successful: number;
  failed: number;
  new_accesses?: number;
  updated_accesses?: number;
  users_processed: number;
  users_skipped: number;
  indicators_processed: number;
  errors?: Array<{ user_id: string; indicator_id: string; error: string }>;
}

interface BulkOperationResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: BulkOperationSummary | null;
  isSuccess: boolean;
  errorMessage?: string;
}

export default function BulkOperationResultModal({
  isOpen,
  onClose,
  summary,
  isSuccess,
  errorMessage
}: BulkOperationResultModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const successRate = summary ? Math.round((summary.successful / summary.total) * 100) : 0;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`
          relative w-full max-w-lg
          bg-gradient-to-br ${isSuccess ? 'from-emerald-500/10 to-green-500/10' : 'from-red-500/10 to-pink-500/10'}
          backdrop-blur-xl border ${isSuccess ? 'border-emerald-500/30' : 'border-red-500/30'}
          rounded-2xl shadow-2xl
          animate-slide-up
        `}
      >
        {/* Icon */}
        <div className="flex justify-center pt-8">
          <div className={`p-4 rounded-full ${isSuccess ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
            {isSuccess ? (
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            ) : (
              <XCircle className="w-12 h-12 text-red-400" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            {isSuccess ? '¡Operación Completada!' : 'Error en la Operación'}
          </h3>

          {!isSuccess && errorMessage ? (
            <div className="text-red-300 text-sm leading-relaxed mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              {errorMessage}
            </div>
          ) : null}

          {isSuccess && summary ? (
            <>
              {/* Progress Circle */}
              <div className="flex justify-center mb-6">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(successRate / 100) * 351.86} 351.86`}
                      className="text-emerald-400 transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-3xl font-bold text-white">{successRate}%</div>
                    <div className="text-xs text-gray-400">Éxito</div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">Exitosas</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{summary.successful}</div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-blue-400 font-medium">Total</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{summary.total}</div>
                </div>
              </div>

              {/* Errores solo si hay */}
              {summary.failed > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400 font-medium">Operaciones Fallidas</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{summary.failed}</div>
                </div>
              )}

              {/* Details */}
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Usuarios procesados:</span>
                  <span className="text-white font-medium">{summary.users_processed}</span>
                </div>
                {summary.users_skipped > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Usuarios omitidos:</span>
                    <span className="text-orange-400 font-medium">
                      {summary.users_skipped}
                      <span className="text-xs ml-1">(sin TradingView)</span>
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Indicadores asignados:</span>
                  <span className="text-white font-medium">{summary.indicators_processed}</span>
                </div>
              </div>

            </>
          ) : null}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className={`w-full px-4 py-3 ${isSuccess ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'} text-white rounded-xl transition-all font-medium shadow-lg`}
          >
            {isSuccess ? 'Cerrar' : 'Entendido'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

