import { createClient } from '@/utils/supabase/server';
import GeoAnalyticsClient from '@/components/admin/geo-analytics/GeoAnalyticsClient';

export const metadata = {
  title: 'Geo-Analytics - APIDevs Trading',
  description: 'Análisis geográfico de tráfico y conversiones por país',
};

interface VisitorStats {
  purchased: boolean;
  purchase_amount_cents: number | null;
  country: string | null;
}

interface CountryStats {
  country: string;
  country_name: string;
  total_visits: number;
  total_purchases: number;
  total_revenue_cents: number;
  conversion_rate: number;
  avg_latitude: number;
  avg_longitude: number;
  avg_time_on_site: number;
  avg_pages_visited: number;
}

// Revalidar caché cada 5 minutos para evitar spam a Supabase
export const revalidate = 300;

export default async function GeoAnalyticsPage() {
  const supabase = createClient();

  // Obtener estadísticas globales
  const { data: globalStats } = await supabase
    .from('visitor_tracking')
    .select('*', { count: 'exact' }) as { data: VisitorStats[] | null };

  const totalVisits = globalStats?.length || 0;
  const totalPurchases = globalStats?.filter(v => v.purchased).length || 0;
  const conversionRate = totalVisits > 0 ? (totalPurchases / totalVisits * 100) : 0;
  const totalRevenue = globalStats?.reduce((sum, v) => sum + (v.purchase_amount_cents || 0), 0) || 0;
  const uniqueCountries = new Set(globalStats?.map(v => v.country).filter(Boolean)).size;

  // Obtener stats por país desde la vista materializada
  const { data: countryStats } = await supabase
    .from('country_stats')
    .select('*')
    .order('total_visits', { ascending: false }) as { data: CountryStats[] | null };

  // Top país
  const topCountry = countryStats?.[0];

  return (
    <div className="space-y-6">
      <GeoAnalyticsClient
        initialCountryStats={countryStats || []}
        initialTotalVisits={totalVisits}
        initialTotalPurchases={totalPurchases}
        initialConversionRate={conversionRate}
        initialTotalRevenue={totalRevenue}
        initialUniqueCountries={uniqueCountries}
        initialTopCountry={topCountry}
      />
    </div>
  );
}

