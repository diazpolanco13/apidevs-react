# 📊 Sistema de Activity Tracker - Guía de Implementación

## 🎯 Objetivo

Registrar toda la actividad del usuario en la aplicación para:
- Analytics detallados
- Auditoría de seguridad
- Debugging de problemas de usuarios
- Mejora de UX basada en datos
- Timeline completo en el admin panel

---

## 🏗️ Arquitectura

### Componentes Creados:

1. **📁 `supabase/migrations/20251001120000_create_user_activity_log.sql`**
   - Tabla `user_activity_log` con todos los campos necesarios
   - Índices optimizados para búsquedas rápidas
   - RLS configurado

2. **🪝 `hooks/useActivityTracker.ts`**
   - Hook de React para trackear eventos
   - Funciones helper para eventos comunes
   - Auto-detección de dispositivo/navegador

3. **🔧 `utils/admin/activity-tracker-integration.ts`**
   - Integración con el Timeline del admin
   - Funciones de formateo y mapeo

---

## 📋 Pasos para Activar el Sistema

### 1️⃣ Aplicar la Migración a Supabase

```bash
# Opción A: Desde Supabase Dashboard
# Ir a SQL Editor y ejecutar el contenido de:
# supabase/migrations/20251001120000_create_user_activity_log.sql

# Opción B: Usando MCP
# Ya está en el archivo, solo ejecutar la migración
```

### 2️⃣ Instalar Dependencia (uuid)

```bash
npm install uuid
npm install --save-dev @types/uuid
```

### 3️⃣ Implementar en Páginas Clave

#### Ejemplo: Dashboard

```tsx
'use client';

import { useEffect } from 'react';
import { useActivityTracker } from '@/hooks/useActivityTracker';

export default function Dashboard() {
  const { trackPageView } = useActivityTracker();

  useEffect(() => {
    trackPageView('Dashboard Principal');
  }, []);

  return (
    <div>...</div>
  );
}
```

#### Ejemplo: Botón de Checkout

```tsx
'use client';

import { useActivityTracker } from '@/hooks/useActivityTracker';

export default function PricingCard({ price }) {
  const { trackCheckoutStart, trackButtonClick } = useActivityTracker();

  const handleCheckout = async () => {
    await trackCheckoutStart(price.product.name, price.unit_amount / 100);
    // ... lógica de checkout
  };

  return (
    <button onClick={handleCheckout}>
      Comprar Ahora
    </button>
  );
}
```

#### Ejemplo: Login

```tsx
'use client';

import { useActivityTracker } from '@/hooks/useActivityTracker';

export default function SignInPage() {
  const { trackLogin } = useActivityTracker();

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (!error) {
      await trackLogin('email');
    }
  };

  return (
    <form onSubmit={handleSignIn}>...</form>
  );
}
```

### 4️⃣ Integrar con el Timeline del Admin

En `components/admin/active-users/ActiveUserTimeline.tsx`:

```tsx
import { fetchUserActivityEvents } from '@/utils/admin/activity-tracker-integration';

const fetchTimelineEvents = async () => {
  // ... código existente ...

  // 🆕 Agregar eventos de activity tracker
  const activityEvents = await fetchUserActivityEvents(userId, filter);
  allEvents.push(...activityEvents);

  // ... ordenar y mostrar ...
};
```

---

## 🎨 Tipos de Eventos a Trackear

### 📍 Navegación
- `page_view` - Vista de página
- `tab_change` - Cambio de tab
- `menu_click` - Click en menú

### 🔐 Autenticación
- `login` - Inicio de sesión
- `logout` - Cierre de sesión
- `password_reset` - Reset de contraseña
- `email_verified` - Email verificado

### 💰 Comercio
- `checkout_start` - Inicio de checkout
- `payment_method_selected` - Método de pago elegido
- `purchase` - Compra completada
- `subscription_updated` - Suscripción actualizada

### 🎯 Interacción
- `button_click` - Click en botón
- `form_submit` - Envío de formulario
- `download` - Descarga de archivo
- `video_play` - Reproducción de video

### 🛠️ Sistema
- `error_occurred` - Error ocurrido
- `feature_used` - Feature utilizado
- `search_performed` - Búsqueda realizada

---

## 📊 Análisis de Datos

### Consultas Útiles

```sql
-- Páginas más visitadas
SELECT page_title, COUNT(*) as visits
FROM user_activity_log
WHERE event_type = 'page_view'
GROUP BY page_title
ORDER BY visits DESC
LIMIT 10;

-- Usuarios más activos
SELECT user_id, COUNT(*) as events
FROM user_activity_log
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY events DESC
LIMIT 10;

-- Tasa de conversión de checkout
SELECT 
  COUNT(DISTINCT CASE WHEN event_type = 'checkout_start' THEN session_id END) as checkouts_started,
  COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN session_id END) as purchases_completed,
  ROUND(
    COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN session_id END)::NUMERIC / 
    NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'checkout_start' THEN session_id END), 0) * 100,
    2
  ) as conversion_rate
FROM user_activity_log
WHERE created_at > NOW() - INTERVAL '30 days';

-- Actividad por hora del día
SELECT 
  EXTRACT(HOUR FROM created_at) as hour,
  COUNT(*) as events
FROM user_activity_log
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour;
```

---

## ⚠️ Consideraciones Importantes

### Privacidad y GDPR

1. **Información Personal**: No trackear información sensible en metadata
2. **Consentimiento**: Agregar banner de cookies si es requerido
3. **Retención**: Configurar política de retención de datos (ej: 90 días)
4. **Anonimización**: Considerar anonimizar IPs después de X tiempo

### Performance

1. **Batch Inserts**: Considerar agrupar eventos en el cliente antes de enviar
2. **Indexación**: Ya está optimizada en la migración
3. **Cleanup**: Implementar job para eliminar datos antiguos:

```sql
-- Job para limpiar datos antiguos (ejecutar periódicamente)
DELETE FROM user_activity_log
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Testing

Antes de activar en producción:
1. Probar en localhost con usuarios de prueba
2. Verificar que los eventos se registren correctamente
3. Revisar el impacto en performance
4. Monitorear el crecimiento de la tabla

---

## 🚀 Roadmap de Activación

- [ ] **Fase 1**: Aplicar migración a Supabase
- [ ] **Fase 2**: Instalar dependencias (uuid)
- [ ] **Fase 3**: Activar tracking en páginas principales (Dashboard, Pricing, Account)
- [ ] **Fase 4**: Activar tracking de autenticación (Login, Signup, Logout)
- [ ] **Fase 5**: Activar tracking de comercio (Checkout, Purchase)
- [ ] **Fase 6**: Integrar con Timeline del admin
- [ ] **Fase 7**: Crear dashboards de analytics
- [ ] **Fase 8**: Implementar alertas de actividad sospechosa

---

## 📝 Notas Adicionales

- El sistema está **LISTO** pero **DESACTIVADO** por defecto
- Todos los comentarios `@TODO` indican dónde activar el código
- El hook `useActivityTracker` está comentado para auto-tracking
- Descomentar líneas cuando esté listo para producción

---

## 🎯 Beneficios Esperados

1. **Analytics Detallados**: Entender cómo los usuarios usan la aplicación
2. **Debugging Mejorado**: Ver exactamente qué hizo un usuario antes de un error
3. **Seguridad**: Detectar patrones sospechosos de actividad
4. **UX Data-Driven**: Mejorar la experiencia basándose en datos reales
5. **Admin Completo**: Timeline visual de toda la actividad del usuario

---

## 📞 Contacto

Si tienes preguntas sobre la implementación, consulta:
- Este documento
- Los comentarios en el código
- La tabla en Supabase Dashboard

**¡El sistema está listo para activarse cuando lo decidas!** 🚀

