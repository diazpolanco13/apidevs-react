import { createClient } from '@/utils/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import EditIndicatorForm from '@/components/admin/indicators/EditIndicatorForm';

export const metadata = {
  title: 'Editar Indicador | Admin Dashboard',
  description: 'Editar información del indicador'
};

type Params = {
  params: {
    id: string;
  };
};

export default async function EditIndicatorPage({ params }: Params) {
  const supabase = createClient();

  // Verificar autenticación
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || user.email !== 'api@apidevs.io') {
    redirect('/');
  }

  // Obtener indicador
  const { data: indicator, error } = await supabase
    .from('indicators')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !indicator) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Header con breadcrumb */}
      <div className="mb-8">
        <Link
          href={`/admin/indicadores/${params.id}`}
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
          Volver al indicador
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <svg
                  className="h-6 w-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white">
                Editar Indicador
              </h1>
            </div>
            <p className="text-sm text-gray-400">{indicator.name}</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-sm">
        <EditIndicatorForm indicator={indicator} />
      </div>
    </div>
  );
}

