import { createClient } from '@/utils/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import IndicatorDetailsTabs from '@/components/admin/indicators/IndicatorDetailsTabs';

export const metadata = {
  title: 'Detalle Indicador | Admin Dashboard',
  description: 'Información completa del indicador'
};

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export default async function IndicatorDetailPage({ params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

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
    .eq('id', id)
    .single();

  if (error || !indicator) {
    notFound();
  }

  // Obtener accesos del indicador (sin join - lo haremos manualmente)
  const { data: accessesRaw, error: accessesError } = await supabase
    .from('indicator_access')
    .select('*')
    .eq('indicator_id', id)
    .order('granted_at', { ascending: false });

  if (accessesError) {
    console.error('Error fetching accesses:', accessesError);
  }

  console.log('📊 Accesos RAW encontrados:', accessesRaw?.length || 0);

  // Obtener información de usuarios para cada acceso
  const validAccesses = await Promise.all(
    (accessesRaw || []).map(async (access: any) => {
      const { data: user } = await supabase
        .from('users')
        .select('id, email, full_name, tradingview_username, avatar_url')
        .eq('id', access.user_id)
        .single();

      return {
        ...access,
        users: user
      };
    })
  );

  const validIndicator = indicator as any;

  console.log('📊 Accesos con usuarios:', validAccesses.length);
  console.log('📊 Primer acceso:', validAccesses[0]);

  // Calcular estadísticas (incluir Lifetime en activos)
  const stats = {
    total_accesses: validAccesses.length,
    active_accesses: validAccesses.filter((a) => {
      if (a.status !== 'active') return false;
      // Lifetime siempre está activo
      if (a.duration_type === '1L') return true;
      // Sin expiración está activo
      if (!a.expires_at) return true;
      // Con expiración futura está activo
      return new Date(a.expires_at) > new Date();
    }).length,
    pending_accesses: validAccesses.filter((a) => a.status === 'pending').length,
    expired_accesses: validAccesses.filter((a) => a.status === 'expired').length,
    revoked_accesses: validAccesses.filter((a) => a.status === 'revoked').length,
    failed_accesses: validAccesses.filter((a) => a.status === 'failed').length
  };

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
              <h1 className="text-3xl font-bold text-white">{validIndicator.name}</h1>
              {/* Badge de categoría */}
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                  validIndicator.category === 'indicador'
                    ? 'border-blue-500/30 bg-blue-500/20 text-blue-400'
                    : validIndicator.category === 'escaner'
                      ? 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400'
                      : 'border-purple-500/30 bg-purple-500/20 text-purple-400'
                }`}
              >
                {validIndicator.category}
              </span>
              {/* Badge de status */}
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                  validIndicator.status === 'activo'
                    ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                    : validIndicator.status === 'desactivado'
                      ? 'border-red-500/30 bg-red-500/20 text-red-400'
                      : 'border-yellow-500/30 bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {validIndicator.status}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Pine ID:{' '}
              <code className="rounded bg-zinc-800 px-2 py-1 text-xs text-emerald-400">
                {validIndicator.pine_id}
              </code>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Accesos Totales</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {stats.total_accesses}
              </p>
            </div>
            <div className="rounded-lg bg-blue-500/20 p-3">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Accesos Activos</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {stats.active_accesses}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/20 p-3">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pendientes</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {stats.pending_accesses}
              </p>
            </div>
            <div className="rounded-lg bg-yellow-500/20 p-3">
              <svg
                className="h-6 w-6 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-600/5 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Revocados</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {stats.revoked_accesses}
              </p>
            </div>
            <div className="rounded-lg bg-red-500/20 p-3">
              <svg
                className="h-6 w-6 text-red-400"
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
          </div>
        </div>
      </div>

      {/* Tabs de contenido */}
      <IndicatorDetailsTabs
        indicator={validIndicator}
        accesses={validAccesses}
        stats={stats}
      />
    </div>
  );
}

