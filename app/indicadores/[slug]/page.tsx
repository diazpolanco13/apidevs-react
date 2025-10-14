import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import { 
  INDICATOR_BY_SLUG_QUERY, 
  INDICATOR_SLUGS_QUERY,
  type IndicatorDetail 
} from '@/sanity/lib/queries';
import IndicatorDetailView from '@/components/ui/IndicatorDetail/IndicatorDetailView';
import BackgroundEffects from '@/components/ui/BackgroundEffects';
import { createClient } from '@/utils/supabase/server';
import { getUser, getSubscription } from '@/utils/supabase/queries';

// Generate static params for all indicators
export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(INDICATOR_SLUGS_QUERY);
  
  return slugs.map((slug) => ({
    slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const indicator = await client.fetch<IndicatorDetail>(
    INDICATOR_BY_SLUG_QUERY,
    { slug }
  );

  if (!indicator) {
    return {
      title: 'Indicador no encontrado | APIDevs',
    };
  }

  const metaTitle = indicator.seo?.metaTitle || indicator.title;
  const metaDescription = indicator.seo?.metaDescription || indicator.shortDescription;
  const keywords = indicator.seo?.keywords || indicator.tags || [];

  return {
    title: `${metaTitle} | APIDevs`,
    description: metaDescription,
    keywords: keywords.join(', '),
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'website',
      images: indicator.mainImage?.asset?.url ? [indicator.mainImage.asset.url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: indicator.mainImage?.asset?.url ? [indicator.mainImage.asset.url] : [],
    },
  };
}

// Revalidate every hour
export const revalidate = 3600;

export default async function IndicatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  
  const [indicator, user, subscription] = await Promise.all([
    client.fetch<IndicatorDetail>(
      INDICATOR_BY_SLUG_QUERY,
      { slug },
      {
        next: {
          revalidate: 3600,
          tags: ['indicators', `indicator-${slug}`],
        },
      }
    ),
    getUser(supabase),
    getSubscription(supabase),
  ]);

  if (!indicator) {
    notFound();
  }

  // Verificar si tiene compras Lifetime (igual que en el dashboard)
  let hasLifetimeAccess = false;
  if (user) {
    const { data: lifetimePurchases } = await (supabase as any)
      .from('purchases')
      .select('id, is_lifetime_purchase, order_total_cents, payment_method')
      .eq('customer_email', user.email)
      .eq('is_lifetime_purchase', true)
      .eq('payment_status', 'paid')
      .gt('order_total_cents', 0);
    
    // Filtrar compras REALMENTE pagadas (excluir FREE)
    const paidLifetimePurchases = (lifetimePurchases || []).filter(
      (p: any) => p.order_total_cents > 0 && p.payment_method !== 'free'
    );
    
    hasLifetimeAccess = paidLifetimePurchases.length > 0;
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Background Effects */}
      <BackgroundEffects />
      
      {/* Main Content */}
      <div className="relative z-10">
        <IndicatorDetailView 
          indicator={indicator} 
          user={user}
          subscription={subscription}
          hasLifetimeAccess={hasLifetimeAccess}
        />
      </div>
    </div>
  );
}
