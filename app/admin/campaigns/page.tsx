import { createClient } from '@/utils/supabase/server';
import CampaignsClient from '@/components/admin/campaigns/CampaignsClient';
import { Megaphone } from 'lucide-react';

export const metadata = {
  title: 'Campañas UTM - APIDevs Trading',
  description: 'Dashboard de campañas publicitarias con métricas de ROI, CAC y ROAS',
};

// Revalidar cada 5 minutos
export const revalidate = 300;

interface CampaignPerformance {
  campaign_id: string;
  campaign_name: string;
  utm_source: string;
  utm_campaign: string;
  status: 'active' | 'paused' | 'completed';
  budget_cents: number;
  external_reach: number;
  external_spend_cents: number;
  total_visits: number;
  total_purchases: number;
  total_revenue_cents: number;
  conversion_rate: number;
  ctr: number;
  cac_cents: number;
  roas: number;
  first_visit: string;
  last_visit: string;
}

export default async function CampaignsPage() {
  const supabase = await createClient();

  // Obtener datos de campaign_performance (vista materializada)
  const { data: campaigns, error } = await supabase
    .from('campaign_performance')
    .select('*')
    .order('total_visits', { ascending: false });

  if (error) {
    console.error('Error fetching campaigns:', error);
  }

  const typedCampaigns = campaigns as CampaignPerformance[] | null;

  // Calcular métricas globales
  const activeCampaigns = typedCampaigns?.filter(c => c.status === 'active') || [];
  const totalSpent = typedCampaigns?.reduce((sum, c) => sum + (c.external_spend_cents || 0), 0) || 0;
  const totalRevenue = typedCampaigns?.reduce((sum, c) => sum + (c.total_revenue_cents || 0), 0) || 0;
  const totalVisits = typedCampaigns?.reduce((sum, c) => sum + c.total_visits, 0) || 0;
  const totalPurchases = typedCampaigns?.reduce((sum, c) => sum + c.total_purchases, 0) || 0;
  const globalConversionRate = totalVisits > 0 ? (totalPurchases / totalVisits * 100) : 0;
  const globalROAS = totalSpent > 0 ? (totalRevenue / totalSpent * 100) : 0;
  const globalCAC = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

  return (
    <div className="space-y-6">
      <CampaignsClient
        initialCampaigns={typedCampaigns || []}
        activeCampaignsCount={activeCampaigns.length}
        totalSpent={totalSpent}
        totalRevenue={totalRevenue}
        totalVisits={totalVisits}
        totalPurchases={totalPurchases}
        globalConversionRate={globalConversionRate}
        globalROAS={globalROAS}
        globalCAC={globalCAC}
      />
    </div>
  );
}

