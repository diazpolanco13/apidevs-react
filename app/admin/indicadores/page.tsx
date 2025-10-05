import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import IndicadoresMainView from '@/components/admin/indicators/IndicadoresMainView';

export const metadata = {
  title: 'Indicadores | Admin Dashboard',
  description: 'Gestión de indicadores de TradingView'
};

export default async function IndicadoresAdminPage() {
  const supabase = createClient();

  // Verificar autenticación y permisos admin
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || user.email !== 'api@apidevs.io') {
    redirect('/');
  }

  // Obtener todos los indicadores
  const { data: indicators, error } = await supabase
    .from('indicators')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching indicators:', error);
  }

  // Para cada indicador, contar usuarios activos con acceso válido
  const indicatorsWithCounts = await Promise.all(
    (indicators || []).map(async (indicator: any) => {
      // Contar usuarios activos con acceso válido (status = 'active' y no expirado)
      const { count: activeUsersCount } = await supabase
        .from('indicator_access')
        .select('*', { count: 'exact', head: true })
        .eq('indicator_id', indicator.id)
        .eq('status', 'active')
        .or(`duration_type.eq.1L,expires_at.gt.${new Date().toISOString()}`);

      return {
        ...indicator,
        active_users: activeUsersCount || 0,
        total_users: activeUsersCount || 0 // Por ahora igual, pero podríamos contar histórico
      };
    })
  );

  // Type assertion for indicators
  const validIndicators = indicatorsWithCounts as any[];

  // Calcular estadísticas
  const stats = {
    total: validIndicators.length,
    activos: validIndicators.filter((i) => i.status === 'activo').length,
    indicadores: validIndicators.filter((i) => i.category === 'indicador').length,
    escaners: validIndicators.filter((i) => i.category === 'escaner').length,
    tools: validIndicators.filter((i) => i.category === 'tools').length,
    free: validIndicators.filter((i) => i.access_tier === 'free').length,
    premium: validIndicators.filter((i) => i.access_tier === 'premium').length
  };

  return (
    <IndicadoresMainView 
      initialIndicators={validIndicators} 
      stats={stats} 
    />
  );
}
