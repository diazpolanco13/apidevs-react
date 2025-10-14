import Hero from '@/components/ui/Hero';
import IndicatorsShowcase from '@/components/ui/IndicatorsShowcase';
import AIBenefits from '@/components/ui/AIBenefits';
import WinningStrategyCard from '@/components/ui/WinningStrategyCard';
import ScannersCard from '@/components/ui/ScannersCard';
import CommunityCard from '@/components/ui/CommunityCard';
import Pricing from '@/components/ui/Pricing/Pricing';
import { createClient } from '@/utils/supabase/server';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';

export default async function HomePage() {
  const supabase = await createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  return (
    <main className="bg-apidevs-dark">
      <Hero />
      
      {/* Indicators Showcase - MATA-LUXALGO */}
      <IndicatorsShowcase />
      
      <AIBenefits />
      
      {/* Winning Strategy Card - CONVERSIÓN MÁXIMA (Imagen Izquierda) */}
      <WinningStrategyCard />
      
      {/* Scanners Card - DETECCIÓN IA (Imagen Derecha) */}
      <ScannersCard />
      
      {/* Community Card - NETWORKING VIP (Imagen Izquierda) */}
      <CommunityCard />
      
      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <Pricing
          user={user}
          products={products ?? []}
          subscription={subscription}
        />
      </section>
    </main>
  );
}
