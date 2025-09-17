import { Metadata } from 'next';
import IndicatorsHub from '@/components/ui/IndicatorsHub/IndicatorsHub';
import BackgroundEffects from '@/components/ui/BackgroundEffects';

export const metadata: Metadata = {
  title: 'Indicadores de Trading | APIDevs - Herramientas Profesionales',
  description: 'Descubre nuestra colección completa de indicadores de trading profesionales. Desde herramientas gratuitas hasta indicadores exclusivos con IA avanzada.',
  keywords: 'indicadores trading, TradingView, análisis técnico, señales trading, APIDevs',
};

export default function IndicadoresPage() {
  return (
    <div className="relative min-h-screen bg-black">
      {/* Background Effects */}
      <BackgroundEffects />
      
      {/* Main Content */}
      <div className="relative z-10">
        <IndicatorsHub />
      </div>
    </div>
  );
}
