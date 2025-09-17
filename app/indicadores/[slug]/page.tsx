import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import IndicatorDetail from '@/components/ui/IndicatorDetail/IndicatorDetail';
import { mockIndicators } from '@/components/ui/IndicatorsHub/data';
import BackgroundEffects from '@/components/ui/BackgroundEffects';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const indicator = mockIndicators.find(i => i.slug === params.slug);
  
  if (!indicator) {
    return {
      title: 'Indicador no encontrado | APIDevs',
    };
  }

  return {
    title: `${indicator.title} | APIDevs Trading`,
    description: indicator.description,
    keywords: `${indicator.title}, ${indicator.tags.join(', ')}, TradingView, APIDevs`,
  };
}

export async function generateStaticParams() {
  return mockIndicators.map((indicator) => ({
    slug: indicator.slug,
  }));
}

export default function IndicatorPage({ params }: Props) {
  const indicator = mockIndicators.find(i => i.slug === params.slug);

  if (!indicator) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Background Effects */}
      <BackgroundEffects />
      
      {/* Main Content */}
      <div className="relative z-10">
        <IndicatorDetail indicator={indicator} />
      </div>
    </div>
  );
}
