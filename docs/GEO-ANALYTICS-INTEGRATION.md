# 🔗 GEO-ANALYTICS - INTEGRACIÓN CON EL SISTEMA APIDEVS

**Fecha:** 2 de Octubre 2025  
**Estado:** Base de datos lista - En desarrollo

---

## 🎯 INTEGRACIONES CLAVE

### 1. CONEXIÓN CON USUARIOS (`users` table)

**Campo agregado:** `visitor_tracking.user_id` → `auth.users.id`

**Flujo de integración:**

```
Visitante Anónimo (session_id: abc123)
  ↓ Navega la web
  ↓ utm_source=facebook, utm_campaign=spain_2025
  ↓ Visita: /precios, /indicadores, /checkout
  ↓
  [REGISTRO] → Crea cuenta (user_id: uuid-xyz)
  ↓
Middleware actualiza: visitor_tracking.user_id = uuid-xyz
  ↓
  [COMPRA] → Stripe checkout
  ↓
Webhook actualiza: visitor_tracking.purchased = TRUE
  ↓
Dashboard muestra: Journey completo del usuario
```

**Beneficios:**
- Ver qué páginas visitó ANTES de registrarse
- Saber de qué campaña vino originalmente
- Conectar visitas anónimas con compras futuras
- Analytics de comportamiento pre y post-registro

---

### 2. CONEXIÓN CON SUSCRIPCIONES (`subscriptions` table)

**Vínculo:** `visitor_tracking.user_id` → `subscriptions.user_id`

**Queries útiles:**

```sql
-- Usuarios que visitaron antes de suscribirse
SELECT 
  u.email,
  v.utm_campaign,
  v.first_visit_at,
  s.created as subscription_created,
  (s.created - v.first_visit_at) as time_to_conversion
FROM visitor_tracking v
JOIN users u ON u.id = v.user_id
JOIN subscriptions s ON s.user_id = v.user_id
WHERE v.is_authenticated = FALSE
ORDER BY time_to_conversion DESC;
```

**Métricas desbloqueadas:**
- Tiempo promedio entre primera visita y suscripción
- Qué campañas generan suscripciones más rápido
- Cuántas visitas se necesitan antes de suscribir
- País de origen de nuevos suscriptores

---

### 3. CONEXIÓN CON PAYMENT INTENTS (`payment_intents` table)

**Vínculo:** 
- `visitor_tracking.purchase_id` → `payment_intents.id`
- `visitor_tracking.user_id` → `payment_intents.user_id`

**Flujo de webhook Stripe:**

```javascript
// En /api/webhooks/route.ts
case 'checkout.session.completed':
  const { session_id, user_id } = metadata;
  
  // Actualizar visitor_tracking
  await supabase
    .from('visitor_tracking')
    .update({
      purchased: true,
      purchase_id: payment_intent_id,
      purchase_amount_cents: amount_total,
      purchase_date: new Date().toISOString(),
      user_id: user_id // CONECTAR USUARIO
    })
    .eq('session_id', visitor_session_id);
```

**Datos sincronizados:**
- Monto exacto de la compra
- Método de pago usado
- País del billing address (para validar geolocalización)
- Status del payment (succeeded, failed, refunded)

---

### 4. CONEXIÓN CON CAMPAÑAS UTM (`utm_campaigns` table)

**Vínculo:** `visitor_tracking.utm_campaign` → `utm_campaigns.utm_campaign`

**Dashboard de campañas mostrará:**

```
Campaña: "Spain Facebook 2025"
  ├─ Reach (Facebook): 10,000 usuarios
  ├─ Visitas (visitor_tracking): 3,245
  │   ├─ Anónimos: 2,890
  │   └─ Registrados: 355
  ├─ Registros: 355 (10.9% de visitas)
  ├─ Compras: 23 (6.5% de registros)
  └─ Revenue: $6,789
```

**Vista materializada:** `campaign_performance`
- Pre-calculada cada hora
- Incluye métricas CAC y ROAS
- Breakdown por país

---

### 5. NUEVA VISTA: USER JOURNEY STATS

**Tabla:** `user_journey_stats` (Materialized View)

**Qué muestra por cada usuario:**

| Campo | Descripción | Uso |
|-------|-------------|-----|
| `total_visits` | Total de visitas (anónimas + autenticadas) | Engagement general |
| `anonymous_visits` | Visitas antes de registrarse | Awareness phase |
| `authenticated_visits` | Visitas post-registro | Retention phase |
| `first_ever_visit` | Primera vez que llegó (anónimo) | Origen temporal |
| `avg_time_on_site` | Tiempo promedio en sitio | Interés |
| `traffic_sources` | Array de fuentes (facebook, google) | Attribution |
| `campaigns_interacted` | Campañas con las que interactuó | Multi-touch attribution |
| `countries_visited` | Países desde donde se conectó | Geolocalización multi-país |

**Ejemplo de query:**

```sql
-- Ver journey completo de un usuario
SELECT * FROM user_journey_stats 
WHERE email = 'carlos@example.com';

-- Resultado:
{
  "user_id": "uuid-123",
  "email": "carlos@example.com",
  "total_visits": 8,
  "anonymous_visits": 5,
  "authenticated_visits": 3,
  "first_ever_visit": "2025-09-15 10:30:00",
  "last_visit": "2025-10-02 14:20:00",
  "avg_time_on_site": 245, // segundos
  "total_pages_viewed": 42,
  "purchase_sessions": 1,
  "total_spent_cents": 39000, // $390
  "traffic_sources": ["facebook", "google"],
  "campaigns_interacted": ["spain_2025", "retargeting_oct"],
  "countries_visited": ["ES"],
  "mobile_visits": 3,
  "desktop_visits": 5
}
```

---

### 6. CONEXIÓN CON TRADINGVIEW SESSIONS

**Tablas existentes:** `tradingview_sessions`, `tradingview_operation_logs`

**Oportunidad de integración futura:**

```sql
-- Correlacionar visitas con acceso a indicadores
SELECT 
  u.email,
  v.utm_campaign,
  COUNT(DISTINCT tol.id) as indicator_operations,
  COUNT(DISTINCT v.session_id) as web_visits
FROM visitor_tracking v
JOIN users u ON u.id = v.user_id
LEFT JOIN tradingview_operation_logs tol ON tol.user_id = v.user_id
GROUP BY u.email, v.utm_campaign;
```

**Métricas desbloqueadas:**
- Usuarios que visitan pero no usan indicadores
- Correlación entre campañas y uso real del producto
- Churn predictivo (visitas sin actividad en TradingView)

---

### 7. INTEGRACIÓN CON PURCHASES (WordPress Legacy)

**Tabla:** `purchases` (compras migradas de WordPress)

**Conexión:** `purchases.legacy_user_id` → `legacy_users.id`

**Caso de uso:**

Ver si usuarios legacy que compraron en WordPress vuelven después de ver campañas nuevas:

```sql
SELECT 
  lu.email,
  lu.wordpress_created_at,
  p.order_total_cents as legacy_spent,
  v.utm_campaign as new_campaign,
  v.created_at as recent_visit
FROM legacy_users lu
JOIN purchases p ON p.legacy_user_id = lu.id
JOIN visitor_tracking v ON v.ip_address = lu.billing_ip -- aproximado
WHERE v.created_at > '2025-09-01'
  AND lu.reactivation_status = 'pending';
```

**Objetivo:** Campañas de reactivación para legacy customers.

---

## 📊 DASHBOARDS POSIBLES

### Dashboard 1: Analytics Global (Ya planificado)
- Mapa mundial con países
- Tabla de países con conversion rate
- Top 5 países
- Métricas globales

### Dashboard 2: User Journey Individual
- Timeline de visitas de un usuario
- Mapa de su navegación (páginas visitadas)
- Fuentes de tráfico que usó
- Conversión final (si compró)

### Dashboard 3: Campaign Performance
- Lista de campañas activas
- Funnel: Reach → Visits → Signups → Purchases
- CAC, ROAS, Conversion Rate
- Breakdown por país

### Dashboard 4: Real-Time Analytics (Futuro)
- Visitantes en línea ahora
- Página que están viendo
- País de origen
- Si están autenticados

---

## 🔧 FUNCIONES AUXILIARES

### Refrescar todas las vistas materializadas:

```sql
SELECT refresh_geo_analytics_views();
```

**Ejecutar cada hora vía cron job:**

```javascript
// app/api/cron/refresh-analytics/route.ts
export async function GET() {
  const supabase = createClient();
  await supabase.rpc('refresh_geo_analytics_views');
  return Response.json({ success: true });
}
```

### Obtener journey de un usuario:

```javascript
const { data } = await supabase
  .from('user_journey_stats')
  .select('*')
  .eq('user_id', userId)
  .single();
```

### Ver todas las visitas de un usuario:

```javascript
const { data } = await supabase
  .from('visitor_tracking')
  .select('*')
  .eq('user_id', userId)
  .order('first_visit_at', { ascending: true });
```

---

## 🎨 COMPONENTES UI A CREAR

### 1. `GeoAnalyticsMap` (Fase 3)
- Mapa Leaflet con markers por país
- Colores según conversion rate
- Click para ver detalles

### 2. `CountryStatsTable` (Fase 3)
- Tabla ordenable por cualquier columna
- Búsqueda por país
- Export a CSV

### 3. `CampaignCard` (Fase 5)
- Funnel visual
- Métricas CAC/ROAS
- Gráfico de tendencia

### 4. `UserJourneyTimeline` (Futuro)
- Timeline vertical de visitas
- Icons por tipo de página
- Destacar conversión

---

## ⚠️ CONSIDERACIONES DE PRIVACIDAD

### GDPR Compliance:

1. **IP Anonymization:**
   - No mostrar IPs completas en UI
   - Solo usar para geolocalización
   - Borrar IPs después de 30 días:

```sql
-- Ejecutar diariamente
DELETE FROM visitor_tracking 
WHERE created_at < NOW() - INTERVAL '30 days';
```

2. **Cookie Consent:**
   - Session tracking requiere cookie `visitor_session_id`
   - Mostrar banner de cookies
   - Opción opt-out disponible

3. **RLS Policies:**
   - ✅ Solo admin puede ver TODAS las visitas
   - ✅ Usuarios pueden ver SOLO sus propias visitas
   - ✅ Service role puede insertar (middleware)

---

## 🚀 PRÓXIMOS PASOS

1. ✅ **FASE 1 COMPLETADA:** Esquema de base de datos
2. **FASE 2:** Middleware de tracking (siguiente)
3. **FASE 3:** UI con mapa y tabla
4. **FASE 4:** Métricas avanzadas
5. **FASE 5:** Campañas y UTM
6. **FASE 6:** Testing y docs

---

## 📝 NOTAS TÉCNICAS

### Performance:
- Vistas materializadas refrescadas cada hora (no en tiempo real)
- Índices en todos los campos de filtrado
- Queries optimizadas con FILTER clause

### Escalabilidad:
- Con 100K visitas/mes → ~1.2M registros/año
- Tamaño estimado: ~200-300MB/año
- PostgreSQL maneja sin problemas hasta 10M+ registros

### Backup:
- Incluir visitor_tracking en backups diarios
- Política de retención: 1 año de datos
- Archive a S3 después de 1 año (opcional)

---

**FIN DEL DOCUMENTO**

