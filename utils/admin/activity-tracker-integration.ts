/**
 * INTEGRACIÓN DEL ACTIVITY TRACKER CON EL TIMELINE DEL ADMIN
 * 
 * Este archivo contiene las funciones para integrar los eventos del Activity Tracker
 * con el Timeline de Actividad del usuario en el panel de administración.
 * 
 * @TODO: Descomentar y activar cuando el sistema esté en producción
 */

import { createClient } from '@/utils/supabase/client';

/**
 * Obtiene los eventos de actividad del usuario desde user_activity_log
 * 
 * @param userId - ID del usuario
 * @param filter - Filtro de tiempo ('all', '7days', '30days', '90days')
 * @returns Array de eventos formateados para el timeline
 */
export async function fetchUserActivityEvents(
  userId: string,
  filter: 'all' | '7days' | '30days' | '90days' = 'all'
) {
  const supabase = createClient();
  
  // Calcular fecha de filtro
  let filterDate: Date | null = null;
  if (filter === '7days') filterDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  if (filter === '30days') filterDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  if (filter === '90days') filterDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  let query = supabase
    .from('user_activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (filterDate) {
    query = query.gte('created_at', filterDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching activity events:', error);
    return [];
  }

  // Formatear eventos para el timeline
  return data?.map((event: any) => ({
    id: `activity-${event.id}`,
    type: mapEventTypeToTimelineType(event.event_type),
    title: formatEventTitle(event),
    description: event.event_action,
    timestamp: event.created_at,
    icon: getIconForEventType(event.event_type),
    color: getColorForCategory(event.event_category),
    bgColor: getBgColorForCategory(event.event_category),
    borderColor: getBorderColorForCategory(event.event_category),
    metadata: {
      ...event,
      page_url: event.page_url,
      device_type: event.device_type,
      browser: event.browser,
      session_id: event.session_id
    }
  })) || [];
}

/**
 * Mapea el tipo de evento del tracker al tipo del timeline
 */
function mapEventTypeToTimelineType(eventType: string): string {
  const mapping: Record<string, string> = {
    'login': 'login',
    'logout': 'logout',
    'page_view': 'access',
    'button_click': 'access',
    'checkout_start': 'purchase',
    'purchase': 'purchase',
    // Agregar más mapeos según sea necesario
  };

  return mapping[eventType] || 'access';
}

/**
 * Formatea el título del evento para el timeline
 */
function formatEventTitle(event: any): string {
  const titles: Record<string, string> = {
    'login': 'Inicio de sesión',
    'logout': 'Cierre de sesión',
    'page_view': 'Visita a página',
    'button_click': 'Interacción',
    'checkout_start': 'Checkout iniciado',
    'purchase': 'Compra completada',
  };

  return titles[event.event_type] || event.event_action;
}

/**
 * Obtiene el icono para el tipo de evento
 * (Importar desde lucide-react)
 */
function getIconForEventType(eventType: string) {
  // @TODO: Importar iconos de lucide-react
  // Retornar el componente de icono apropiado
  return null; // Placeholder
}

/**
 * Obtiene el color para la categoría
 */
function getColorForCategory(category: string): string {
  const colors: Record<string, string> = {
    'navigation': 'text-blue-400',
    'auth': 'text-green-400',
    'commerce': 'text-purple-400',
    'interaction': 'text-cyan-400',
    'system': 'text-gray-400',
  };

  return colors[category] || 'text-gray-400';
}

/**
 * Obtiene el color de fondo para la categoría
 */
function getBgColorForCategory(category: string): string {
  const colors: Record<string, string> = {
    'navigation': 'bg-blue-500/10',
    'auth': 'bg-green-500/10',
    'commerce': 'bg-purple-500/10',
    'interaction': 'bg-cyan-500/10',
    'system': 'bg-gray-500/10',
  };

  return colors[category] || 'bg-gray-500/10';
}

/**
 * Obtiene el color del borde para la categoría
 */
function getBorderColorForCategory(category: string): string {
  const colors: Record<string, string> = {
    'navigation': 'border-blue-500/30',
    'auth': 'border-green-500/30',
    'commerce': 'border-purple-500/30',
    'interaction': 'border-cyan-500/30',
    'system': 'border-gray-500/30',
  };

  return colors[category] || 'border-gray-500/30';
}

/**
 * EJEMPLO DE INTEGRACIÓN EN ActiveUserTimeline.tsx:
 * 
 * import { fetchUserActivityEvents } from '@/utils/admin/activity-tracker-integration';
 * 
 * // Dentro de fetchTimelineEvents():
 * const activityEvents = await fetchUserActivityEvents(userId, filter);
 * allEvents.push(...activityEvents);
 */

