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

  // Calcular estadísticas
  const stats = {
    total: indicators?.length || 0,
    activos: indicators?.filter((i) => i.status === 'activo').length || 0,
    privados: indicators?.filter((i) => i.type === 'privado').length || 0,
    publicos: indicators?.filter((i) => i.type === 'publico').length || 0,
    indicadores: indicators?.filter((i) => i.category === 'indicador').length || 0,
    escaners: indicators?.filter((i) => i.category === 'escaner').length || 0,
    tools: indicators?.filter((i) => i.category === 'tools').length || 0
  };

  return (
    <IndicadoresMainView 
      initialIndicators={indicators || []} 
      stats={stats} 
    />
  );
}
