# 🎯 Sistema de Tracking Automático

## Descripción General

El sistema de tracking automático captura datos de visitantes en tiempo real sin necesidad de configuración adicional. Cada visita a una página pública se registra automáticamente en la base de datos.

---

## ✨ Funcionalidades

### 1. **Tracking Automático de Visitantes**
- ✅ Captura automática de cada visita
- ✅ Sin configuración adicional requerida
- ✅ No afecta performance (async/non-blocking)

### 2. **Datos Capturados**

#### Red:
- IP Address (con privacy protections)
- Fingerprint único (hash de IP + UA)

#### Geolocalización (vía ipapi.co):
- País (código + nombre)
- Ciudad
- Región
- Coordenadas (lat/lon)
- Código postal

#### Dispositivo:
- Browser (Chrome, Firefox, Safari, etc.)
- OS (Windows, macOS, Linux, iOS, Android)
- Tipo (desktop, mobile, tablet)
- User Agent completo

#### Origen del Tráfico:
- Referer (de dónde viene)
- UTM Source (facebook, google, instagram)
- UTM Medium (cpc, email, social)
- UTM Campaign (nombre de campaña)
- UTM Term (palabras clave)
- UTM Content (variante del anuncio)

#### Navegación:
- Landing Page (primera página)
- Páginas visitadas (contador)
- Tiempo en sitio (segundos)
- First/Last seen (timestamps)

#### Conversión:
- Purchased (boolean)
- Purchase Amount (en centavos)
- Product ID
- Subscription ID
- User ID (al hacer login)

---

## 🔧 Funcionamiento Técnico

### Session Management

Cada visitante obtiene un `session_id` único almacenado en una cookie HTTP-only:

```typescript
session_id: "sess_a1b2c3d4e5f6g7h8i9j0_1234567890"
cookie_name: "apidevs_session_id"
duration: 1 año
```

### Flujo de Tracking

```
Usuario visita página
  ↓
Middleware intercepta request
  ↓
¿Tiene session_id?
  ├─ NO → Crear nuevo session
  │        ├─ Generar session_id
  │        ├─ Detectar IP
  │        ├─ Fetch geolocalización
  │        ├─ Detectar dispositivo
  │        ├─ Extraer UTMs
  │        └─ INSERT en visitor_tracking
  │
  └─ SÍ → Actualizar session existente
           ├─ Incrementar pages_visited
           ├─ Actualizar time_on_site
           └─ UPDATE visitor_tracking
```

### Rutas Trackeadas

**✅ SE TRACKEAN:**
- Páginas públicas: `/`, `/pricing`, `/indicadores/*`
- Páginas de contenido estático

**❌ NO SE TRACKEAN:**
- Admin dashboard: `/admin/*`
- Auth pages: `/auth/*`, `/signin`, `/signout`
- API routes: `/api/*`
- Assets estáticos: imágenes, CSS, JS
- Internals de Next.js: `/_next/*`, `/__nextjs*`

---

## 💰 Registrar Conversiones

### Opción 1: Desde Client Component

```typescript
import { trackConversion } from '@/lib/tracking/conversion-tracker';

// Después de compra exitosa
await trackConversion({
  user_id: user.id,
  purchase_amount_cents: 9900, // $99.00
  product_id: 'prod_abc123',
  subscription_id: 'sub_xyz789'
});
```

### Opción 2: Desde API Route

```typescript
const response = await fetch('/api/tracking/conversion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: userId,
    purchase_amount_cents: amount,
    product_id: productId,
    subscription_id: subId
  })
});
```

### Opción 3: Desde Webhook de Stripe

```typescript
// En tu webhook de Stripe
if (event.type === 'checkout.session.completed') {
  const session = event.data.object;

  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/tracking/conversion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: session.metadata.user_id,
      purchase_amount_cents: session.amount_total,
      subscription_id: session.subscription
    })
  });
}
```

---

## 🔍 Consultar Datos

### Query Básico

```sql
-- Ver últimas 10 visitas
SELECT
  session_id,
  country_name,
  city,
  device_type,
  utm_campaign,
  purchased,
  created_at
FROM visitor_tracking
ORDER BY created_at DESC
LIMIT 10;
```

### Conversiones por Campaña

```sql
-- Ver conversiones por campaña UTM
SELECT
  utm_campaign,
  COUNT(*) as total_visits,
  COUNT(*) FILTER (WHERE purchased = TRUE) as total_purchases,
  ROUND(COUNT(*) FILTER (WHERE purchased = TRUE)::numeric / COUNT(*) * 100, 2) as conversion_rate
FROM visitor_tracking
WHERE utm_campaign IS NOT NULL
GROUP BY utm_campaign
ORDER BY total_purchases DESC;
```

### Uso de Vistas Materializadas

```sql
-- Stats por país (pre-calculado)
SELECT * FROM country_stats
ORDER BY total_visits DESC;

-- Performance de campañas (pre-calculado)
SELECT * FROM campaign_performance
WHERE status = 'active'
ORDER BY roas DESC;

-- Journey del usuario
SELECT * FROM user_journey_stats
WHERE user_id = 'user_abc123';
```

---

## 🔄 Refrescar Vistas Materializadas

### Manual (SQL)

```sql
SELECT refresh_geo_analytics_views();
```

### Automático (después de conversión)

Las vistas se refrescan automáticamente cuando:
1. Se registra una conversión nueva
2. Cada hora (via cron job - opcional)
3. Al hacer query directo a visitor_tracking (fallback)

---

## 🛡️ Privacy & GDPR

### Datos Personales

- ✅ IPs se almacenan hasheadas como fingerprint
- ✅ No se captura información de login sin consentimiento
- ✅ Session IDs son aleatorios y no reveribles
- ✅ Geolocalización es aproximada (ciudad-nivel)

### Cumplimiento

Para cumplir con GDPR:

1. **Agregar Cookie Consent Banner:**
   ```typescript
   // Antes de trackear:
   if (!userHasConsented()) {
     return; // No trackear
   }
   ```

2. **Permitir Opt-Out:**
   ```typescript
   // Cookie para opt-out
   cookies().set('tracking_opt_out', 'true');
   ```

3. **Derecho al Olvido:**
   ```sql
   -- Eliminar datos de un usuario
   DELETE FROM visitor_tracking WHERE user_id = 'user_id_here';
   ```

---

## 📊 Performance

### Impacto en Latencia

- **Sin tracking:** Request ~50ms
- **Con tracking:** Request ~52ms (+2ms)
- **Tracking async:** No bloquea respuesta

### Rate Limits

- **ipapi.co:** 30,000 requests/mes gratis
- **Caché:** Geolocalización se cachea 24 horas
- **IPs locales:** Se saltan automáticamente

### Optimizaciones

- ✅ Tracking async (no bloquea)
- ✅ Cache de geolocalización (24h)
- ✅ Debounce de updates (10s mínimo)
- ✅ Batch inserts (si es necesario)

---

## 🐛 Debugging

### Logs de Desarrollo

```bash
# Ver tracking en tiempo real
npm run dev

# Outputs:
✅ Auth verified for /pricing - 50ms
🎯 Tracked visitor: sess_abc123... (New session)
📍 Geo: Spain, Madrid
📱 Device: desktop, Chrome, Windows
```

### Verificar Tracking

```typescript
// En browser console
document.cookie // Ver apidevs_session_id
```

### Errores Comunes

**"Session not found"**
- Cookie fue eliminada o expiró
- Usuario en modo incógnito

**"Geo location failed"**
- IP es local (192.168.x.x)
- Rate limit de ipapi.co alcanzado
- Network error

---

## 🚀 Próximos Pasos

1. ✅ **Sistema básico funcionando**
2. 🔄 **Agregar evento tracking** (clicks, scroll, etc.)
3. 🔄 **A/B Testing integration**
4. 🔄 **Real-time dashboard**
5. 🔄 **Heat maps & Session replay**

---

## 📞 Soporte

Para issues o preguntas:
- Ver logs en desarrollo
- Verificar queries directos en Supabase
- Revisar cookie `apidevs_session_id`

**Documentación actualizada:** Octubre 2025
