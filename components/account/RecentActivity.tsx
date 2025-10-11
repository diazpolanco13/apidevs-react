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
  AlertTriangle,
  ChevronDown,
  ChevronUp
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
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const supabase = createClient();
        
        // Obtener compras/pagos recientes (excluir legacy) - más registros para paginación
        const { data: purchases } = await supabase
          .from('purchases')
          .select('id, order_number, order_date, order_total_cents, product_name, revenue_impact, order_status')
          .eq('customer_email', userEmail)
          .is('legacy_user_id', null)
          .order('order_date', { ascending: false })
          .limit(50); // Más registros para paginación

        // Obtener eventos de actividad del usuario - más registros para paginación
        const { data: activityEvents } = await supabase
          .from('user_activity_events')
          .select('id, event_type, event_data, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50); // Más registros para paginación

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
            const subscriptionId = eventData.stripe_subscription_id || eventData.subscription_id;
            const shortId = subscriptionId ? subscriptionId.split('_')[1].substring(0, 8) : 'N/A';
            
            activityList.push({
              id: event.id,
              type: 'subscription_cancelled',
              title: 'Suscripción cancelada',
              description: `${eventData.product_name} (${shortId}) - Acceso hasta ${new Date(eventData.access_until).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`,
              timestamp: event.created_at,
              icon: AlertTriangle,
              color: 'text-orange-400'
            });
          }
        });

        // Ordenar por fecha (más reciente primero)
        activityList.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Paginación
        const totalItems = activityList.length;
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedActivities = activityList.slice(startIndex, endIndex);
        
        setHasMore(endIndex < totalItems);
        setActivities(paginatedActivities);
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchActivities();
    }
  }, [userEmail, userId, currentPage]);

  const getFormattedTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Para eventos muy recientes (menos de 1 hora), mostrar tiempo relativo
    if (diffInSeconds < 3600) {
      if (diffInSeconds < 60) return 'Hace unos segundos';
      return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    }

    // Para eventos más antiguos, mostrar fecha y hora exacta
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

    if (isToday) {
      return `Hoy ${date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (isYesterday) {
      return `Ayer ${date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit'
      });
    }
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
    <div className="space-y-2">
      {activities.map((activity) => {
        const Icon = activity.icon;
        return (
          <div 
            key={activity.id}
            className="flex items-center gap-3 p-2 bg-gray-800/20 hover:bg-gray-800/40 rounded-lg transition-all group border border-transparent hover:border-gray-700/30"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-800/50 border border-gray-700/50 group-hover:border-gray-600/50 transition-colors flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${activity.color}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm truncate">{activity.title}</h4>
                  <p className="text-gray-400 text-xs truncate">
                    {activity.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {activity.amount && (
                    <span className={`text-sm font-semibold ${activity.type === 'refund' ? 'text-orange-400' : activity.type === 'subscription_cancelled' ? 'text-orange-400' : 'text-green-400'}`}>
                      {activity.type === 'refund' ? '-' : ''}${activity.amount.toFixed(2)}
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{getFormattedTime(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Paginación */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 hover:text-white rounded-lg transition-all text-sm font-medium border border-gray-700/50 hover:border-gray-600/50"
          >
            <ChevronDown className="w-4 h-4" />
            Ver más eventos
          </button>
        </div>
      )}
      
      {currentPage > 1 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 hover:text-white rounded-lg transition-all text-sm font-medium border border-gray-700/50 hover:border-gray-600/50"
          >
            <ChevronUp className="w-4 h-4" />
            Ver menos
          </button>
        </div>
      )}
    </div>
  );
}

