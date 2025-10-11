'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  CreditCard, 
  RefreshCw, 
  XCircle, 
  LogIn, 
  TrendingUp,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface Purchase {
  id: string;
  order_number: string;
  order_date: string;
  order_total_cents: number;
  product_name: string | null;
  revenue_impact: string | null;
  order_status: string | null;
}

interface ActivityEvent {
  id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

interface ActivityItem {
  id: string;
  type: 'purchase' | 'payment' | 'refund' | 'login' | 'subscription_cancelled';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  icon: any;
  color: string;
}

interface RecentActivityProps {
  userEmail: string;
  userId: string;
}

export default function RecentActivity({ userEmail, userId }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const supabase = createClient();
        
        // Obtener compras/pagos recientes (excluir legacy)
        const { data: purchases } = await supabase
          .from('purchases')
          .select('id, order_number, order_date, order_total_cents, product_name, revenue_impact, order_status')
          .eq('customer_email', userEmail)
          .is('legacy_user_id', null)
          .order('order_date', { ascending: false })
          .limit(10);

        // Obtener eventos de actividad del usuario
        const { data: activityEvents } = await supabase
          .from('user_activity_events')
          .select('id, event_type, event_data, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        const activityList: ActivityItem[] = [];

        // Mapear compras a actividades
        (purchases as Purchase[] | null)?.forEach((purchase) => {
          if (purchase.revenue_impact === 'negative') {
            // Devolución
            activityList.push({
              id: purchase.id,
              type: 'refund',
              title: 'Devolución procesada',
              description: `Reembolso de ${purchase.product_name?.substring(0, 40)}...`,
              amount: purchase.order_total_cents / 100,
              timestamp: purchase.order_date,
              icon: XCircle,
              color: 'text-orange-400'
            });
          } else if (purchase.order_number.startsWith('INV-')) {
            // Cobro automático (invoice/renovación)
            activityList.push({
              id: purchase.id,
              type: 'payment',
              title: 'Cobro automático realizado',
              description: `Renovación de suscripción - Factura ${purchase.order_number.slice(-8)}`,
              amount: purchase.order_total_cents / 100,
              timestamp: purchase.order_date,
              icon: RefreshCw,
              color: 'text-blue-400'
            });
          } else {
            // Compra nueva
            activityList.push({
              id: purchase.id,
              type: 'purchase',
              title: 'Compra realizada',
              description: `Suscripción activada - Orden #${purchase.order_number}`,
              amount: purchase.order_total_cents / 100,
              timestamp: purchase.order_date,
              icon: CreditCard,
              color: 'text-green-400'
            });
          }
        });

        // Mapear eventos de actividad
        (activityEvents as ActivityEvent[] | null)?.forEach((event) => {
          if (event.event_type === 'subscription_cancelled') {
            const eventData = event.event_data;
            activityList.push({
              id: event.id,
              type: 'subscription_cancelled',
              title: 'Suscripción cancelada',
              description: `${eventData.product_name} cancelada - Acceso hasta ${new Date(eventData.access_until).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`,
              timestamp: event.created_at,
              icon: AlertTriangle,
              color: 'text-orange-400'
            });
          }
        });

        // Ordenar por fecha
        activityList.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setActivities(activityList.slice(0, 8));
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchActivities();
    }
  }, [userEmail, userId]);

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace unos segundos';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 604800)} semanas`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-start gap-3 p-3 bg-gray-800/30 rounded-xl">
            <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4">
          <TrendingUp className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No hay actividad reciente</h3>
        <p className="text-gray-400 text-sm">
          Comienza a usar nuestros indicadores para ver tu actividad aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = activity.icon;
        return (
          <div 
            key={activity.id}
            className="flex items-start gap-3 p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl transition-all group border border-transparent hover:border-gray-700/50"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 border border-gray-700 group-hover:border-gray-600 transition-colors flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${activity.color}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-white font-medium text-sm">{activity.title}</h4>
                {activity.amount && (
                  <span className={`text-sm font-semibold ${activity.type === 'refund' ? 'text-orange-400' : 'text-green-400'} flex-shrink-0`}>
                    {activity.type === 'refund' ? '-' : ''}${activity.amount.toFixed(2)}
                  </span>
                )}
              </div>
              
              <p className="text-gray-400 text-xs mb-1 line-clamp-1">
                {activity.description}
              </p>
              
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Clock className="w-3 h-3" />
                <span>{getRelativeTime(activity.timestamp)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

