import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Next.js 15: Forzar renderizado dinámico porque usa cookies (Supabase)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { from, to } = await request.json();

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Se requieren fechas from y to' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Query visitor_tracking filtrado por rango de fechas
    const { data: visits, error: visitsError } = await supabase
      .from('visitor_tracking')
      .select('*')
      .gte('created_at', from)
      .lte('created_at', to);

    if (visitsError) {
      console.error('Error fetching visits:', visitsError);
      return NextResponse.json(
        { error: 'Error al obtener datos de visitas' },
        { status: 500 }
      );
    }

    // Calcular métricas globales
    type Visit = {
      purchased?: boolean | null;
      purchase_amount_cents?: number | null;
      country?: string | null;
    };

    const typedVisits: Visit[] = Array.isArray(visits) ? visits : [];

    const totalVisits = typedVisits.length;
    const totalPurchases = typedVisits.filter(v => !!v.purchased).length;
    const conversionRate = totalVisits > 0 ? (totalPurchases / totalVisits * 100) : 0;
    const totalRevenue = typedVisits.reduce((sum, v) => sum + (v.purchase_amount_cents || 0), 0);
    const uniqueCountries = new Set(typedVisits.map(v => v.country).filter(Boolean)).size;

    // Agrupar por país y calcular stats
    const countryMap = new Map<string, {
      country: string;
      country_name: string;
      visits: any[];
      purchases: any[];
      revenue: number;
      totalTimeOnSite: number;
      totalPagesVisited: number;
      latSum: number;
      lonSum: number;
      latCount: number;
      lonCount: number;
    }>();

    (visits as any[] | undefined)?.forEach((visit) => {
      if (!visit.country) return;

      if (!countryMap.has(visit.country)) {
        countryMap.set(visit.country, {
          country: visit.country,
          country_name: visit.country_name || visit.country,
          visits: [],
          purchases: [],
          revenue: 0,
          totalTimeOnSite: 0,
          totalPagesVisited: 0,
          latSum: 0,
          lonSum: 0,
          latCount: 0,
          lonCount: 0
        });
      }

      const countryData = countryMap.get(visit.country)!;
      countryData.visits.push(visit);

      if (visit.purchased) {
        countryData.purchases.push(visit);
        countryData.revenue += visit.purchase_amount_cents || 0;
      }

      if (visit.time_on_site) {
        countryData.totalTimeOnSite += visit.time_on_site;
      }

      if (visit.pages_visited) {
        countryData.totalPagesVisited += visit.pages_visited;
      }

      if (visit.latitude != null && visit.longitude != null) {
        countryData.latSum += visit.latitude;
        countryData.lonSum += visit.longitude;
        countryData.latCount++;
        countryData.lonCount++;
      }
    });

    // Convertir a array de country stats
    const countryStats = Array.from(countryMap.values()).map(country => ({
      country: country.country,
      country_name: country.country_name,
      total_visits: country.visits.length,
      total_purchases: country.purchases.length,
      total_revenue_cents: country.revenue,
      conversion_rate: country.visits.length > 0 
        ? (country.purchases.length / country.visits.length * 100) 
        : 0,
      avg_latitude: country.latCount > 0 ? country.latSum / country.latCount : 0,
      avg_longitude: country.lonCount > 0 ? country.lonSum / country.lonCount : 0,
      avg_time_on_site: country.visits.length > 0 
        ? country.totalTimeOnSite / country.visits.length 
        : 0,
      avg_pages_visited: country.visits.length > 0 
        ? country.totalPagesVisited / country.visits.length 
        : 0,
    }));

    // Ordenar por total de visitas
    countryStats.sort((a, b) => b.total_visits - a.total_visits);

    // Top país
    const topCountry = countryStats[0];

    return NextResponse.json({
      countryStats,
      totalVisits,
      totalPurchases,
      conversionRate,
      totalRevenue,
      uniqueCountries,
      topCountry,
      dateRange: { from, to }
    });

  } catch (error) {
    console.error('Error in geo-analytics filter API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

