'use client';

export default function GestionUsuariosTab() {
  return (
    <div className="space-y-6">
      {/* Placeholder mientras construimos esta sección */}
      <div className="flex min-h-[500px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-12 backdrop-blur-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10">
          <svg
            className="h-10 w-10 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <h3 className="mt-6 text-xl font-semibold text-white">
          Gestión de Usuarios
        </h3>
        <p className="mt-2 max-w-md text-center text-sm text-gray-400">
          En esta sección podrás gestionar los accesos de usuarios a los
          indicadores de forma masiva, asignar planes, ver históricos y más.
        </p>
        <div className="mt-8 rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
          <h4 className="mb-3 font-medium text-white">
            Funcionalidades Planificadas:
          </h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Búsqueda de usuarios por email o TradingView username
            </li>
            <li className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Vista de indicadores activos por usuario
            </li>
            <li className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Asignación masiva de indicadores a múltiples usuarios
            </li>
            <li className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Historial de accesos y revocaciones
            </li>
            <li className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Sincronización automática con suscripciones de Stripe
            </li>
          </ul>
        </div>
        <p className="mt-6 text-xs text-gray-500">
          Esta sección se construirá después de afinar los detalles del tab de
          Indicadores
        </p>
      </div>
    </div>
  );
}

