import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API para obtener datos de tendencias con comparación de períodos
 */
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

    // Calcular período anterior (misma duración)
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const durationMs = toDate.getTime() - fromDate.getTime();
    
    const previousFromDate = new Date(fromDate.getTime() - durationMs);
    const previousToDate = new Date(fromDate.getTime());

    // Obtener datos del período actual
    const { data: currentVisits } = await supabase
      .from('visitor_tracking')
      .select('*')
      .gte('created_at', from)
      .lte('created_at', to);

    // Obtener datos del período anterior
    const { data: previousVisits } = await supabase
      .from('visitor_tracking')
      .select('*')
      .gte('created_at', previousFromDate.toISOString())
      .lt('created_at', previousToDate.toISOString());

    // Calcular métricas del período actual
    const currentMetrics = calculateMetrics(currentVisits || []);
    
    // Calcular métricas del período anterior
    const previousMetrics = calculateMetrics(previousVisits || []);

    // Generar datos de tendencia diaria
    const dailyTrends = generateDailyTrends(currentVisits || [], previousVisits || [], fromDate, toDate, previousFromDate);

    return NextResponse.json({
      current: currentMetrics,
      previous: previousMetrics,
      trends: dailyTrends,
      comparison: {
        visits: calculateChangePercent(currentMetrics.visits, previousMetrics.visits),
        purchases: calculateChangePercent(currentMetrics.purchases, previousMetrics.purchases),
        revenue: calculateChangePercent(currentMetrics.revenue, previousMetrics.revenue),
        conversionRate: calculateChangePercent(currentMetrics.conversionRate, previousMetrics.conversionRate),
      },
      periodLabels: {
        current: `${formatDate(fromDate)} - ${formatDate(toDate)}`,
        previous: `${formatDate(previousFromDate)} - ${formatDate(new Date(previousToDate.getTime() - 86400000))}` // -1 día
      }
    });

  } catch (error) {
    console.error('Error in trends API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

function calculateMetrics(visits: any[]) {
  const totalVisits = visits.length;
  const totalPurchases = visits.filter(v => v.purchased).length;
  const totalRevenue = visits.reduce((sum, v) => sum + (v.purchase_amount_cents || 0), 0);
  const conversionRate = totalVisits > 0 ? (totalPurchases / totalVisits * 100) : 0;
  const avgTimeOnSite = totalVisits > 0 
    ? visits.reduce((sum, v) => sum + (v.time_on_site || 0), 0) / totalVisits 
    : 0;

  return {
    visits: totalVisits,
    purchases: totalPurchases,
    revenue: totalRevenue,
    conversionRate,
    avgTimeOnSite,
  };
}

function generateDailyTrends(
  currentVisits: any[], 
  previousVisits: any[], 
  fromDate: Date, 
  toDate: Date,
  previousFromDate: Date
) {
  // Agrupar visitas por día
  const currentByDay = new Map<string, any[]>();
  const previousByDay = new Map<string, any[]>();

  // Agrupar período actual
  currentVisits.forEach(visit => {
    const date = new Date(visit.created_at).toISOString().split('T')[0];
    if (!currentByDay.has(date)) {
      currentByDay.set(date, []);
    }
    currentByDay.get(date)!.push(visit);
  });

  // Agrupar período anterior
  previousVisits.forEach(visit => {
    const date = new Date(visit.created_at).toISOString().split('T')[0];
    if (!previousByDay.has(date)) {
      previousByDay.set(date, []);
    }
    previousByDay.get(date)!.push(visit);
  });

  // Generar array de tendencias
  const trends = {
    visits: [] as { date: string; value: number; comparisonValue?: number }[],
    conversions: [] as { date: string; value: number; comparisonValue?: number }[],
    revenue: [] as { date: string; value: number; comparisonValue?: number }[],
  };

  // Iterar por cada día del período actual
  const currentDate = new Date(fromDate);
  const previousDate = new Date(previousFromDate);
  
  while (currentDate <= toDate) {
    const currentDateStr = currentDate.toISOString().split('T')[0];
    const previousDateStr = previousDate.toISOString().split('T')[0];
    
    const currentDayVisits = currentByDay.get(currentDateStr) || [];
    const previousDayVisits = previousByDay.get(previousDateStr) || [];

    // Visitas
    trends.visits.push({
      date: formatDateShort(currentDate),
      value: currentDayVisits.length,
      comparisonValue: previousDayVisits.length
    });

    // Conversiones
    trends.conversions.push({
      date: formatDateShort(currentDate),
      value: currentDayVisits.filter(v => v.purchased).length,
      comparisonValue: previousDayVisits.filter(v => v.purchased).length
    });

    // Revenue
    trends.revenue.push({
      date: formatDateShort(currentDate),
      value: currentDayVisits.reduce((sum, v) => sum + (v.purchase_amount_cents || 0), 0),
      comparisonValue: previousDayVisits.reduce((sum, v) => sum + (v.purchase_amount_cents || 0), 0)
    });

    // Avanzar al siguiente día
    currentDate.setDate(currentDate.getDate() + 1);
    previousDate.setDate(previousDate.getDate() + 1);
  }

  return trends;
}

function calculateChangePercent(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'short' 
  });
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'numeric' 
  });
}

