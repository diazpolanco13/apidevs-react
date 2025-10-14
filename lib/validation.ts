import { z } from 'zod';

// Schemas comunes de validación

export const emailSchema = z
  .string()
  .email('Email inválido')
  .max(255, 'Email demasiado largo')
  .toLowerCase()
  .trim();

export const usernameSchema = z
  .string()
  .min(3, 'Username debe tener al menos 3 caracteres')
  .max(50, 'Username demasiado largo')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username solo puede contener letras, números, guiones y guiones bajos')
  .trim();

export const passwordSchema = z
  .string()
  .min(8, 'Contraseña debe tener al menos 8 caracteres')
  .max(100, 'Contraseña demasiado larga')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número');

export const uuidSchema = z
  .string()
  .uuid('ID inválido');

export const urlSchema = z
  .string()
  .url('URL inválida')
  .max(2048, 'URL demasiado larga');

// Schema para mensajes de chat
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z
    .string()
    .min(1, 'Mensaje no puede estar vacío')
    .max(10000, 'Mensaje demasiado largo')
    .trim()
});

export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, 'Debe enviar al menos un mensaje')
    .max(50, 'Demasiados mensajes en la conversación')
});

// Schema para operaciones de Stripe
export const subscriptionIdSchema = z
  .string()
  .min(1, 'ID de suscripción requerido')
  .regex(/^sub_[a-zA-Z0-9]+$/, 'ID de suscripción inválido');

// Schema para operaciones de indicadores
export const durationTypeSchema = z.enum(['7D', '30D', '1Y', '1L']);

export const indicatorAccessRequestSchema = z.object({
  duration_type: durationTypeSchema.optional().default('1Y')
});

// Función helper para validar y devolver errores formateados
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err: z.ZodIssue) => {
        const path = err.path.join('.');
        return path ? `${path}: ${err.message}` : err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: ['Error de validación desconocido'] };
  }
}

// Función para sanitizar HTML (básico)
export function sanitizeString(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validación de parámetros de paginación
export const paginationSchema = z.object({
  page: z
    .number()
    .int('Número de página debe ser entero')
    .positive('Número de página debe ser positivo')
    .max(1000, 'Número de página demasiado alto')
    .optional()
    .default(1),
  limit: z
    .number()
    .int('Límite debe ser entero')
    .positive('Límite debe ser positivo')
    .max(100, 'Límite máximo es 100')
    .optional()
    .default(10)
});
