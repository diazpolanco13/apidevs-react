/**
 * Helper client-side para registrar conversiones
 * Llamar cuando un usuario completa una compra exitosa
 */

interface ConversionData {
  user_id: string;
  purchase_amount_cents: number;
  product_id?: string;
  subscription_id?: string;
}

export async function trackConversion(data: ConversionData): Promise<boolean> {
  try {
    const response = await fetch('/api/tracking/conversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('Error tracking conversion:', await response.text());
      return false;
    }

    const result = await response.json();
    return result.success || false;
  } catch (error) {
    console.error('Error tracking conversion:', error);
    return false;
  }
}

/**
 * Ejemplo de uso:
 * 
 * // En tu página de checkout success o después de confirmar pago:
 * import { trackConversion } from '@/lib/tracking/conversion-tracker';
 * 
 * await trackConversion({
 *   user_id: user.id,
 *   purchase_amount_cents: 9900, // $99.00
 *   product_id: 'prod_abc123',
 *   subscription_id: 'sub_xyz789'
 * });
 */

