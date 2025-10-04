'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import UserSelectionStep from './UserSelectionStep';
import IndicatorSelectionStep from './IndicatorSelectionStep';
import ConfigurationStep from './ConfigurationStep';
import BulkOperationResultModal from './BulkOperationResultModal';
import BulkOperationProgressModal from './BulkOperationProgressModal';

type User = {
  id: string;
  email: string;
  full_name: string | null;
  tradingview_username: string | null;
  customer_tier: string | null;
  is_legacy_user: boolean;
  total_lifetime_spent: number;
  purchase_count: number;
};

type Indicator = {
  id: string;
  pine_id: string;
  name: string;
  category: string;
  access_tier: string;
  status: string;
};

type WizardStep = 1 | 2 | 3;
type OperationType = 'grant' | 'revoke';

export default function BulkAssignmentTab() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<Indicator[]>([]);
  const [durationType, setDurationType] = useState<'7D' | '30D' | '1Y' | '1L'>('1Y');
  const [operationType, setOperationType] = useState<OperationType>('grant');
  const [executing, setExecuting] = useState(false);
  
  // Modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [operationSuccess, setOperationSuccess] = useState(false);
  const [operationSummary, setOperationSummary] = useState<any>(null);
  const [operationError, setOperationError] = useState<string | undefined>(undefined);

  const steps = [
    { number: 1, title: 'Seleccionar Usuarios', description: 'Filtrar y elegir usuarios' },
    { number: 2, title: 'Seleccionar Indicadores', description: 'Elegir indicadores a asignar' },
    { number: 3, title: 'Configurar y Ejecutar', description: 'Revisar y confirmar' }
  ];

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep((currentStep + 1) as WizardStep);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as WizardStep);
  };

  const canProceedToStep2 = selectedUsers.length > 0;
  const canProceedToStep3 = selectedIndicators.length > 0;

  const handleExecute = async (durationType: '7D' | '30D' | '1Y' | '1L') => {
    setExecuting(true);

    try {
      // Llamar al endpoint de ejecución masiva
      const response = await fetch('/api/admin/bulk-operations/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_ids: selectedUsers.map((u) => u.id),
          indicator_ids: selectedIndicators.map((i) => i.id),
          duration: durationType,
          operation_type: operationType
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Mostrar modal de éxito
        setOperationSuccess(true);
        setOperationSummary(result.summary);
        setOperationError(undefined);
        setShowResultModal(true);

        // Reset wizard después de cerrar modal
        setTimeout(() => {
          setCurrentStep(1);
          setSelectedUsers([]);
          setSelectedIndicators([]);
        }, 500);
      } else {
        // Mostrar modal de error
        setOperationSuccess(false);
        setOperationSummary(null);
        setOperationError(result.error || 'Error desconocido');
        setShowResultModal(true);
      }
    } catch (error: any) {
      console.error('Error ejecutando operación masiva:', error);
      // Mostrar modal de error de conexión
      setOperationSuccess(false);
      setOperationSummary(null);
      setOperationError('Error de conexión. Por favor, intenta de nuevo.');
      setShowResultModal(true);
    } finally {
      setExecuting(false);
    }
  };

  const totalOperations = selectedUsers.length * selectedIndicators.length;

  return (
    <>
      {/* Modal de progreso durante la ejecución */}
      <BulkOperationProgressModal
        isOpen={executing}
        totalOperations={totalOperations}
        usersCount={selectedUsers.length}
        indicatorsCount={selectedIndicators.length}
      />

      {/* Result Modal */}
      <BulkOperationResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        summary={operationSummary}
        isSuccess={operationSuccess}
        errorMessage={operationError}
      />

      <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <svg
              className="h-7 w-7 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Asignación Masiva</h2>
            <p className="text-sm text-gray-400">
              Concede acceso a múltiples usuarios simultáneamente
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="relative">
          {/* Progress Bar Background */}
          <div className="absolute left-0 top-5 h-0.5 w-full bg-zinc-700" />
          {/* Progress Bar Fill */}
          <div
            className="absolute left-0 top-5 h-0.5 bg-emerald-500 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      isCompleted
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : isActive
                          ? 'border-emerald-500 bg-zinc-900 text-emerald-400'
                          : 'border-zinc-700 bg-zinc-900 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="font-semibold">{step.number}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${
                        isActive ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Operation Type Selector */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-400">Tipo de Operación:</span>
          </div>
          <div className="flex gap-2 rounded-lg bg-zinc-800 p-1">
            <button
              onClick={() => setOperationType('grant')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                operationType === 'grant'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <span className="text-lg">✨</span>
              Conceder Acceso
            </button>
            <button
              onClick={() => setOperationType('revoke')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                operationType === 'revoke'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <span className="text-lg">🗑️</span>
              Revocar Acceso
            </button>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[500px] rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        {currentStep === 1 && (
          <UserSelectionStep
            selectedUsers={selectedUsers}
            onSelectionChange={setSelectedUsers}
          />
        )}

        {currentStep === 2 && (
          <IndicatorSelectionStep
            selectedIndicators={selectedIndicators}
            onSelectionChange={setSelectedIndicators}
          />
        )}

        {currentStep === 3 && (
          <ConfigurationStep
            selectedUsers={selectedUsers}
            selectedIndicators={selectedIndicators}
            onExecute={handleExecute}
            executing={executing}
            durationType={durationType}
            onDurationChange={setDurationType}
            operationType={operationType}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-6 py-3 font-medium text-gray-300 transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Anterior
        </button>

        <div className="text-sm text-gray-400">
          Paso {currentStep} de 3
        </div>

        {currentStep < 3 ? (
          <button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !canProceedToStep2) ||
              (currentStep === 2 && !canProceedToStep3)
            }
            className="rounded-lg bg-emerald-500 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={() => handleExecute(durationType)}
            disabled={executing}
            className="rounded-lg bg-purple-500 px-6 py-3 font-medium text-white transition-colors hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {executing ? 'Ejecutando...' : '⚡ Ejecutar Asignación'}
          </button>
        )}
      </div>
    </div>
    </>
  );
}

