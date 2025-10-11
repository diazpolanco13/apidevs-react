import { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { INDICATORS_QUERY } from '@/sanity/lib/queries';
import type { IndicatorListItem } from '@/sanity/lib/queries';
import IndicatorsHub from '@/components/ui/IndicatorsHub/IndicatorsHub';
import BackgroundEffects from '@/components/ui/BackgroundEffects';

export const metadata: Metadata = {
  title: 'Indicadores de Trading | APIDevs - Herramientas Profesionales',
  description: 'Descubre nuestra colección completa de indicadores de trading profesionales. Desde herramientas gratuitas hasta indicadores exclusivos con IA avanzada.',
  keywords: 'indicadores trading, TradingView, análisis técnico, señales trading, APIDevs',
};

// Revalidar cada hora
export const revalidate = 3600;

export default async function IndicadoresPage() {
  // Fetch indicators from Sanity
  const indicators = await client.fetch<IndicatorListItem[]>(
    INDICATORS_QUERY,
    {},
    {
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ['indicators'],
      },
    }
  );

  return (
    <div className="relative min-h-screen bg-black">
      {/* Background Effects */}
      <BackgroundEffects />
      
      {/* Main Content */}
      <div className="relative z-10">
        <IndicatorsHub initialIndicators={indicators} />
      </div>
    </div>
  );
}
