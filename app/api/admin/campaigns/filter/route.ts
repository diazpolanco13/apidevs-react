import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { from, to } = await request.json();

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Se requieren fechas from y to' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    type Visit = {
      utm_campaign?: string;
      purchased?: boolean;
      purchase_amount_cents?: number;
      created_at?: string;
    };

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

    const typedVisits = visits as Visit[] | null;

    // Obtener todas las campañas
    const { data: allCampaigns, error: campaignsError } = await supabase
      .from('utm_campaigns')
      .select('*');

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
      return NextResponse.json(
        { error: 'Error al obtener campañas' },
        { status: 500 }
      );
    }

    type Campaign = {
      id: string;
      campaign_name: string;
      utm_source: string;
      utm_campaign: string;
      status: 'active' | 'paused' | 'completed';
      budget_cents: number;
      external_reach: number;
      external_spend_cents: number;
    };

    const typedCampaigns = allCampaigns as Campaign[] | null;

    // Agrupar visitas por campaña y calcular métricas
    const campaignMetrics = new Map<string, {
      campaign: Campaign;
      visits: any[];
      purchases: any[];
      revenue: number;
    }>();

    // Inicializar todas las campañas
    typedCampaigns?.forEach(campaign => {
      campaignMetrics.set(campaign.utm_campaign, {
        campaign,
        visits: [],
        purchases: [],
        revenue: 0
      });
    });

    // Agrupar visitas por campaña
    typedVisits?.forEach(visit => {
      if (!visit.utm_campaign) return;

      const metrics = campaignMetrics.get(visit.utm_campaign);
      if (metrics) {
        metrics.visits.push(visit);
        
        if (visit.purchased) {
          metrics.purchases.push(visit);
          metrics.revenue += visit.purchase_amount_cents || 0;
        }
      }
    });

    // Calcular métricas finales por campaña
    const campaigns = Array.from(campaignMetrics.values()).map(({ campaign, visits, purchases, revenue }) => {
      const totalVisits = visits.length;
      const totalPurchases = purchases.length;
      const totalRevenue = revenue;
      const conversionRate = totalVisits > 0 ? (totalPurchases / totalVisits * 100) : 0;
      
      const externalReach = campaign.external_reach || 0;
      const externalSpend = campaign.external_spend_cents || 0;
      const ctr = externalReach > 0 ? (totalVisits / externalReach * 100) : 0;
      const cac = totalPurchases > 0 ? externalSpend / totalPurchases : 0;
      const roas = externalSpend > 0 ? (totalRevenue / externalSpend * 100) : 0;

      return {
        campaign_id: campaign.id,
        campaign_name: campaign.campaign_name,
        utm_source: campaign.utm_source,
        utm_campaign: campaign.utm_campaign,
        status: campaign.status,
        budget_cents: campaign.budget_cents,
        external_reach: externalReach,
        external_spend_cents: externalSpend,
        total_visits: totalVisits,
        total_purchases: totalPurchases,
        total_revenue_cents: totalRevenue,
        conversion_rate: conversionRate,
        ctr: ctr,
        cac_cents: cac,
        roas: roas,
        first_visit: visits.length > 0 ? visits[0].created_at : null,
        last_visit: visits.length > 0 ? visits[visits.length - 1].created_at : null
      };
    });

    // Ordenar por visitas
    campaigns.sort((a, b) => b.total_visits - a.total_visits);

    // Calcular métricas globales
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const totalSpent = campaigns.reduce((sum, c) => sum + c.external_spend_cents, 0);
    const totalRevenue = campaigns.reduce((sum, c) => sum + c.total_revenue_cents, 0);
    const totalVisits = campaigns.reduce((sum, c) => sum + c.total_visits, 0);
    const totalPurchases = campaigns.reduce((sum, c) => sum + c.total_purchases, 0);
    const globalConversionRate = totalVisits > 0 ? (totalPurchases / totalVisits * 100) : 0;
    const globalROAS = totalSpent > 0 ? (totalRevenue / totalSpent * 100) : 0;
    const globalCAC = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

    return NextResponse.json({
      campaigns,
      activeCampaignsCount: activeCampaigns.length,
      totalSpent,
      totalRevenue,
      globalConversionRate,
      globalROAS,
      globalCAC,
      dateRange: { from, to }
    });

  } catch (error) {
    console.error('Error in campaigns filter API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

