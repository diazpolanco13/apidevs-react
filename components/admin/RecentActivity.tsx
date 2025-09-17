import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function RecentActivity() {
  const supabase = createClient();

  const { data: recentPurchases, error } = await supabase
    .from('purchases')
    .select('order_number, customer_email, order_total_cents, order_date, order_status')
    .order('order_date', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching recent activity:', error);
    return <p className="text-red-500">Error al cargar actividad reciente.</p>;
  }

  return (
    <div className="bg-black/30 backdrop-blur-xl border border-apidevs-primary/20 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Actividad Reciente</h2>
      <ul className="divide-y divide-gray-700">
        {recentPurchases?.map((purchase) => (
          <li key={purchase.order_number} className="py-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-white">
                Orden #{purchase.order_number} de {purchase.customer_email}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(purchase.order_date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-apidevs-primary">
                ${(purchase.order_total_cents / 100).toFixed(2)} USD
              </p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  purchase.order_status === 'completed'
                    ? 'bg-green-500/20 text-green-400'
                    : purchase.order_status === 'refunded'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {purchase.order_status}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-center">
        <Link href="/admin/purchases" className="text-apidevs-primary hover:underline text-sm">
          Ver todas las compras →
        </Link>
      </div>
    </div>
  );
}