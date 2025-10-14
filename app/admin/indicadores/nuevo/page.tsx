import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import NewIndicatorForm from '@/components/admin/indicators/NewIndicatorForm';

export const metadata = {
  title: 'Nuevo Indicador | Admin Dashboard',
  description: 'Agregar nuevo indicador de TradingView'
};

export default async function NewIndicatorPage() {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || user.email !== 'api@apidevs.io') {
    redirect('/');
  }

  return (
    <div className="min-h-screen">
      {/* Header con breadcrumb */}
      <div className="mb-8">
        <Link
          href="/admin/indicadores"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Volver a indicadores
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/20 p-2">
                <svg
                  className="h-6 w-6 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white">
                Agregar Nuevo Indicador
              </h1>
            </div>
            <p className="text-sm text-gray-400">
              Completa la información del indicador de TradingView
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-sm">
        <NewIndicatorForm />
      </div>
    </div>
  );
}

