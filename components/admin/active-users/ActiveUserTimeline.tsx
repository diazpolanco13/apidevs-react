'use client';

import { useEffect, useState } from 'react';
import { 
  Activity, 
  Clock, 
  Calendar,
  LogIn,
  LogOut,
  CreditCard,
  ShoppingCart,
  Zap,
  UserCheck,
  RefreshCw,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Mail,
  Key,
  Crown,
  TrendingUp
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface ActiveUserTimelineProps {
  userId: string;
}

interface TimelineEvent {
  id: string;
  type: 'login' | 'payment' | 'subscription' | 'refund' | 'purchase' | 'access' | 'email_verified' | 'password_reset' | 'profile_update';
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  metadata?: any;
}

export default function ActiveUserTimeline({
  userId
}: ActiveUserTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '7days' | '30days' | '90days'>('all');

  useEffect(() => {
    fetchTimelineEvents();
  }, [userId, filter]);

  const fetchTimelineEvents = async () => {
    setLoading(true);
    const supabase = createClient();
    const allEvents: TimelineEvent[] = [];

    try {
      // Calcular fecha de filtro
      let filterDate: Date | null = null;
      if (filter === '7days') filterDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (filter === '30days') filterDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (filter === '90days') filterDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      // 1. Eventos de Payment Intents
      const { data: paymentIntents } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('user_id', userId)
        .order('created', { ascending: false });

      if (paymentIntents) {
        paymentIntents.forEach((pi) => {
          const eventDate = new Date(pi.created);
          if (!filterDate || eventDate >= filterDate) {
            // Evento de pago
            if (pi.status === 'succeeded') {
              allEvents.push({
                id: `payment-${pi.id}`,
                type: 'payment',
                title: 'Pago exitoso',
                description: `Pago de $${(pi.amount / 100).toFixed(2)} ${pi.currency.toUpperCase()}`,
                timestamp: pi.created,
                icon: CheckCircle,
                color: 'text-green-400',
                bgColor: 'bg-green-500/10',
                borderColor: 'border-green-500/30',
                metadata: pi
              });
            } else if (pi.status === 'failed') {
              allEvents.push({
                id: `payment-${pi.id}`,
                type: 'payment',
                title: 'Pago fallido',
                description: `Intento de pago de $${(pi.amount / 100).toFixed(2)} falló`,
                timestamp: pi.created,
                icon: XCircle,
                color: 'text-red-400',
                bgColor: 'bg-red-500/10',
                borderColor: 'border-red-500/30',
                metadata: pi
              });
            }

            // Evento de reembolso si existe
            if (pi.refunded && pi.last_refund_at) {
              allEvents.push({
                id: `refund-${pi.id}`,
                type: 'refund',
                title: 'Reembolso procesado',
                description: `Reembolso de $${(pi.amount_refunded / 100).toFixed(2)}`,
                timestamp: pi.last_refund_at,
                icon: RefreshCw,
                color: 'text-orange-400',
                bgColor: 'bg-orange-500/10',
                borderColor: 'border-orange-500/30',
                metadata: pi
              });
            }
          }
        });
      }

      // 2. Eventos de Suscripciones
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select(`
          *,
          prices (
            *,
            products (*)
          )
        `)
        .eq('user_id', userId)
        .order('created', { ascending: false });

      if (subscriptions) {
        subscriptions.forEach((sub: any) => {
          const eventDate = new Date(sub.created);
          if (!filterDate || eventDate >= filterDate) {
            allEvents.push({
              id: `subscription-created-${sub.id}`,
              type: 'subscription',
              title: 'Suscripción activada',
              description: `Plan ${sub.prices?.products?.name || 'Premium'} activado`,
              timestamp: sub.created,
              icon: Crown,
              color: 'text-purple-400',
              bgColor: 'bg-purple-500/10',
              borderColor: 'border-purple-500/30',
              metadata: sub
            });
          }

          // Cancelación
          if (sub.canceled_at) {
            const cancelDate = new Date(sub.canceled_at);
            if (!filterDate || cancelDate >= filterDate) {
              allEvents.push({
                id: `subscription-canceled-${sub.id}`,
                type: 'subscription',
                title: 'Suscripción cancelada',
                description: sub.cancel_at_period_end 
                  ? 'Cancelada al final del período'
                  : 'Cancelación inmediata',
                timestamp: sub.canceled_at,
                icon: XCircle,
                color: 'text-red-400',
                bgColor: 'bg-red-500/10',
                borderColor: 'border-red-500/30',
                metadata: sub
              });
            }
          }
        });
      }

      // 3. Eventos de Compras (Purchases)
      const { data: purchases } = await supabase
        .from('purchases')
        .select('*')
        .eq('customer_email', (await supabase.from('users').select('email').eq('id', userId).single()).data?.email || '')
        .order('order_date', { ascending: false });

      if (purchases) {
        purchases.forEach((purchase: any) => {
          const eventDate = new Date(purchase.order_date);
          if (!filterDate || eventDate >= filterDate) {
            allEvents.push({
              id: `purchase-${purchase.id}`,
              type: 'purchase',
              title: purchase.is_lifetime_purchase ? 'Compra Lifetime' : 'Compra realizada',
              description: `${purchase.product_name} - $${(purchase.order_total_cents / 100).toFixed(2)}`,
              timestamp: purchase.order_date,
              icon: purchase.is_lifetime_purchase ? Crown : ShoppingCart,
              color: purchase.is_lifetime_purchase ? 'text-yellow-400' : 'text-blue-400',
              bgColor: purchase.is_lifetime_purchase ? 'bg-yellow-500/10' : 'bg-blue-500/10',
              borderColor: purchase.is_lifetime_purchase ? 'border-yellow-500/30' : 'border-blue-500/30',
              metadata: purchase
            });
          }
        });
      }

      // 4. Eventos de acceso a indicadores
      const { data: indicatorAccess } = await supabase
        .from('user_indicator_access')
        .select(`
          *,
          tradingview_indicators (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (indicatorAccess) {
        indicatorAccess.forEach((access: any) => {
          const eventDate = new Date(access.created_at);
          if (!filterDate || eventDate >= filterDate) {
            allEvents.push({
              id: `access-${access.id}`,
              type: 'access',
              title: 'Acceso a indicador',
              description: `Acceso otorgado a ${access.tradingview_indicators?.name || 'indicador'}`,
              timestamp: access.created_at,
              icon: TrendingUp,
              color: 'text-cyan-400',
              bgColor: 'bg-cyan-500/10',
              borderColor: 'border-cyan-500/30',
              metadata: access
            });
          }
        });
      }

      // Ordenar todos los eventos por fecha (más reciente primero)
      allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching timeline events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getEventStats = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const eventsThisWeek = events.filter(e => new Date(e.timestamp) >= weekAgo).length;
    const lastEvent = events[0];

    return {
      total: events.length,
      thisWeek: eventsThisWeek,
      lastActivity: lastEvent ? formatDate(lastEvent.timestamp) : '-'
    };
  };

  const stats = getEventStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Timeline de Actividad</h2>
          </div>
          
          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Todo
            </button>
            <button
              onClick={() => setFilter('7days')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === '7days'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              7 días
            </button>
            <button
              onClick={() => setFilter('30days')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === '30days'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              30 días
            </button>
            <button
              onClick={() => setFilter('90days')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === '90days'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              90 días
            </button>
          </div>
        </div>
        <p className="text-gray-400 text-sm">
          Historial completo de acciones, eventos y cambios del usuario
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/30 rounded-xl p-5">
          <Clock className="w-8 h-8 text-blue-400 mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
          <div className="text-sm text-gray-400">Eventos Totales</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-xl p-5">
          <Activity className="w-8 h-8 text-green-400 mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{stats.lastActivity}</div>
          <div className="text-sm text-gray-400">Última Actividad</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-xl p-5">
          <Calendar className="w-8 h-8 text-purple-400 mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{stats.thisWeek}</div>
          <div className="text-sm text-gray-400">Eventos Esta Semana</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Cargando timeline...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay eventos en el período seleccionado</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 via-purple-500/50 to-transparent"></div>

            {/* Events */}
            <div className="space-y-4">
              {events.map((event, index) => {
                const Icon = event.icon;
                return (
                  <div
                    key={event.id}
                    className="relative pl-20 pb-4 group"
                  >
                    {/* Icon */}
                    <div className={`absolute left-0 w-16 h-16 rounded-xl border ${event.borderColor} ${event.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-7 h-7 ${event.color}`} />
                    </div>

                    {/* Content */}
                    <div className={`border ${event.borderColor} ${event.bgColor} rounded-xl p-4 hover:bg-white/5 transition-all`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className={`font-semibold ${event.color} mb-1`}>
                            {event.title}
                          </h4>
                          <p className="text-gray-300 text-sm">
                            {event.description}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      
                      {/* Metadata opcional */}
                      {event.metadata && event.type === 'payment' && (
                        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-4 text-xs">
                          <span className="text-gray-500">ID: <span className="text-gray-400 font-mono">{event.metadata.id.slice(-12)}</span></span>
                          <span className="text-gray-500">Estado: <span className={`font-medium ${event.metadata.status === 'succeeded' ? 'text-green-400' : 'text-red-400'}`}>{event.metadata.status}</span></span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
