import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import UserProfileCard from '@/components/admin/UserProfileCard';
import UserPurchaseHistory from '@/components/admin/UserPurchaseHistory';
import UserStats from '@/components/admin/UserStats';

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch user details
  const { data: user, error: userError } = await supabase
    .from('legacy_users')
    .select('*')
    .eq('id', id)
    .single();

  if (userError || !user) {
    notFound();
  }

  // Fetch user purchases
  // ✅ Buscar por customer_email (para compras Stripe) Y legacy_user_id (para compras WordPress)
  const { data: purchases, error: purchasesError } = await supabase
    .from('purchases')
    .select('*')
    .or(`customer_email.eq.${(user as any).email},legacy_user_id.eq.${id}`)
    .order('order_date', { ascending: false });

  if (purchasesError) {
    console.error('Error fetching purchases:', purchasesError);
  }

  // Calculate user statistics
  const totalPurchases = purchases?.length || 0;
  const completedPurchases = purchases?.filter((p: any) => p.order_status === 'completed') || [];
  const totalSpentCents = completedPurchases.reduce((sum: number, purchase: any) => sum + (purchase.order_total_cents || 0), 0);
  const totalSpentUSD = (totalSpentCents / 100);
  const averageOrderValue = completedPurchases.length > 0 ? (totalSpentCents / completedPurchases.length / 100) : 0;
  
  // Product breakdown
  const productBreakdown = purchases?.reduce((acc: { [key: string]: number }, purchase: any) => {
    const productName = purchase.product_name || 'Producto desconocido';
    acc[productName] = (acc[productName] || 0) + 1;
    return acc;
  }, {}) || {};

  // Recent activity
  const recentPurchases = purchases?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="border-b border-gray-700 pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Volver a usuarios</span>
          </Link>
          <div className="h-6 w-px bg-gray-700"></div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {(user as any).full_name || 'Usuario sin nombre'}
            </h1>
            <p className="text-gray-400">
              Cliente legacy desde {new Date((user as any).wordpress_created_at).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left column - User profile */}
        <div className="xl:col-span-1">
          <UserProfileCard user={user as any} />
        </div>

        {/* Right column - Stats and purchases */}
        <div className="xl:col-span-3 space-y-6">
          {/* User statistics */}
          <UserStats 
            totalPurchases={totalPurchases}
            completedPurchases={completedPurchases.length}
            totalSpentUSD={totalSpentUSD}
            averageOrderValue={averageOrderValue}
            productBreakdown={productBreakdown}
          />

          {/* Purchase history */}
          <UserPurchaseHistory purchases={(purchases as any) || []} />
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Detalle de Usuario - Admin APIDevs',
  description: 'Vista detallada del usuario con historial de compras y estadísticas',
};
