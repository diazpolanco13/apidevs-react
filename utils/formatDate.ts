/**
 * Formatea fechas de Supabase correctamente.
 * 
 * ⚠️ PROBLEMA: Supabase guarda timestamps como "timestamp without time zone",
 * lo que significa que descarta la zona horaria ('Z') al guardar.
 * 
 * Ejemplo:
 * - Guardamos: "2025-10-10T22:58:04.000Z" (UTC)
 * - Supabase almacena: "2025-10-10 22:58:04" (sin 'Z')
 * - JavaScript interpreta: hora LOCAL en lugar de UTC
 * - Resultado: hora incorrecta (muestra 22:58 en lugar de 18:58 en UTC-4)
 * 
 * ✅ SOLUCIÓN: Agregar 'Z' manualmente si no la tiene, para forzar interpretación UTC.
 */

/**
 * Convierte un string de fecha de Supabase a objeto Date,
 * agregando 'Z' si es necesario para indicar que es UTC.
 */
export function parseSupabaseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  
  // Si ya tiene zona horaria ('Z' o '+'), usarlo directamente
  // Si no, agregar 'Z' para indicar que es UTC
  const dateString = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z';
  
  const date = new Date(dateString);
  
  // Validar que la fecha es válida
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', dateStr);
    return null;
  }
  
  return date;
}

/**
 * Formatea una fecha al estilo "10 oct 2025, 18:58"
 */
export function formatDateShort(dateStr: string | number | null | undefined): string {
  if (!dateStr) return 'Fecha no disponible';
  
  let date: Date;
  
  if (typeof dateStr === 'string') {
    const parsed = parseSupabaseDate(dateStr);
    if (!parsed) return 'Fecha inválida';
    date = parsed;
  } else {
    // UNIX timestamp en segundos
    date = new Date(dateStr * 1000);
  }
  
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatea una fecha al estilo "10 de octubre de 2025, 18:58"
 */
export function formatDateLong(dateStr: string | number | null | undefined): string {
  if (!dateStr) return 'Fecha no disponible';
  
  let date: Date;
  
  if (typeof dateStr === 'string') {
    const parsed = parseSupabaseDate(dateStr);
    if (!parsed) return 'Fecha inválida';
    date = parsed;
  } else {
    // UNIX timestamp en segundos
    date = new Date(dateStr * 1000);
  }
  
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

