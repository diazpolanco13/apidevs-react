'use client';

import { Loader2, Users, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface BulkOperationProgressModalProps {
  isOpen: boolean;
  totalOperations: number;
  usersCount: number;
  indicatorsCount: number;
}

export default function BulkOperationProgressModal({
  isOpen,
  totalOperations,
  usersCount,
  indicatorsCount
}: BulkOperationProgressModalProps) {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState(0);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Simular progreso estimado
  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCurrentOperation(0);
      return;
    }

    // Tiempo estimado por operación: ~2.5 segundos
    const timePerOperation = 2500;
    const totalTime = totalOperations * timePerOperation;
    const updateInterval = 100; // Actualizar cada 100ms
    const incrementPerUpdate = (100 / (totalTime / updateInterval));

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + incrementPerUpdate;
        // No pasar del 95% (esperamos la respuesta real del servidor)
        return Math.min(newProgress, 95);
      });

      setCurrentOperation((prev) => {
        const estimated = Math.floor((progress / 100) * totalOperations);
        return Math.min(estimated, totalOperations);
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isOpen, totalOperations, progress]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl p-8">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xs font-bold text-white">{Math.round(progress)}%</div>
            </div>
          </div>
        </div>

        {/* Título */}
        <h3 className="text-2xl font-bold text-white text-center mb-2">
          Procesando Operación Masiva
        </h3>
        <p className="text-gray-400 text-center text-sm mb-6">
          Por favor espera mientras procesamos todos los accesos...
        </p>

        {/* Barra de progreso */}
        <div className="mb-6">
          <div className="w-full h-3 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/50">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Procesando: {currentOperation} / {totalOperations}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Usuarios</span>
            </div>
            <div className="text-xl font-bold text-white">{usersCount}</div>
          </div>

          <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Indicadores</span>
            </div>
            <div className="text-xl font-bold text-white">{indicatorsCount}</div>
          </div>
        </div>

        {/* Mensaje de espera */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            ⏱️ Tiempo estimado: ~{Math.round((totalOperations * 2.5) / 60)} minutos
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

