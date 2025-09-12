import Hero from '@/components/ui/Hero';
import AIBenefits from '@/components/ui/AIBenefits';
import Pricing from '@/components/ui/Pricing/Pricing';
import { createClient } from '@/utils/supabase/server';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';

export default async function HomePage() {
  const supabase = createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  return (
    <main className="bg-apidevs-dark">
      <Hero />
      <AIBenefits />
      
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
