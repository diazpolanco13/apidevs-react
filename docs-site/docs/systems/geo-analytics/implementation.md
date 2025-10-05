---
sidebar_position: 2
---

# 🔧 Implementación Técnica del Sistema Geo-Analytics

## 🎯 Integraciones Clave

### 1. **Conexión con Usuarios (`users` table)**

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

### 2. **Conexión con Suscripciones (`subscriptions` table)**

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

### 3. **Conexión con Payment Intents (`payment_intents` table)**

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

## 🏗️ Arquitectura Técnica Detallada

### **Middleware de Tracking**

**Ubicación:** `utils/supabase/middleware.ts`

**Funciones principales:**
1. **Auth Caching** - Cache de autenticación por 60 segundos
2. **Request Deduplication** - Evitar tracking duplicado
3. **Visitor Tracking** - Captura async no-bloqueante

```typescript
export async function middleware(request: NextRequest) {
  // 1. Auth caching (60s TTL)
  const authResult = await getCachedAuth(request);

  // 2. Request deduplication
  if (isDuplicateRequest(request)) {
    return NextResponse.next();
  }

  // 3. Visitor tracking (async, non-blocking)
  trackVisitor(request).catch(console.error);

  return NextResponse.next();
}
```

### **Visitor Tracker Core**

**Ubicación:** `lib/tracking/visitor-tracker.ts`

**Funcionalidades:**
- Session management con cookies persistentes
- Geolocalización via ipapi.co
- Device detection automática
- UTM parameter extraction
- DB insert/update optimizado

```typescript
export class VisitorTracker {
  async track(request: NextRequest) {
    // 1. Obtener o crear session ID
    const sessionId = this.getSessionId(request);

    // 2. Geolocation (cached)
    const geo = await this.getGeolocation(request.ip);

    // 3. Device detection
    const device = this.detectDevice(request.headers.get('user-agent'));

    // 4. UTM extraction
    const utm = this.extractUTM(request.url);

    // 5. DB upsert
    await this.saveToDatabase({
      sessionId, geo, device, utm, ...metadata
    });
  }
}
```

### **API Routes Implementadas**

#### **1. `/api/admin/geo-analytics/filter`**
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fromDate = searchParams.get('from');
  const toDate = searchParams.get('to');
  const country = searchParams.get('country');

  const { data, error } = await supabase
    .from('visitor_tracking')
    .select('*')
    .gte('created_at', fromDate)
    .lte('created_at', toDate)
    .eq(country ? 'country' : true, country || true);

  return Response.json({ data, error });
}
```

#### **2. `/api/admin/geo-analytics/trends`**
```typescript
export async function GET(request: Request) {
  // Lógica para calcular tendencias
  const currentPeriod = await getGeoData({ from: '2025-10-01', to: '2025-10-31' });
  const previousPeriod = await getGeoData({ from: '2025-09-01', to: '2025-09-30' });

  const trends = calculateTrends(currentPeriod, previousPeriod);

  return Response.json({ trends });
}
```

#### **3. `/api/admin/campaigns/filter`**
```typescript
export async function GET(request: Request) {
  const campaigns = await supabase
    .from('utm_campaigns')
    .select(`
      *,
      visitor_tracking(count)
    `)
    .eq('status', 'active');

  // Calcular métricas CAC, ROAS, etc.
  const enrichedCampaigns = campaigns.map(campaign => ({
    ...campaign,
    cac: calculateCAC(campaign),
    roas: calculateROAS(campaign)
  }));

  return Response.json({ campaigns: enrichedCampaigns });
}
```

#### **4. `/api/tracking/conversion`**
```typescript
export async function POST(request: Request) {
  const { sessionId, conversionType, metadata } = await request.json();

  await supabase
    .from('visitor_tracking')
    .update({
      conversion_events: supabase.sql`conversion_events || ${JSON.stringify({
        type: conversionType,
        timestamp: new Date().toISOString(),
        metadata
      })}`,
      last_conversion: new Date().toISOString()
    })
    .eq('session_id', sessionId);

  return Response.json({ success: true });
}
```

---

## 🗄️ Esquemas de Base de Datos Detallados

### **Tabla `visitor_tracking` - Esquema Completo**

```sql
CREATE TABLE visitor_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación de sesión
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),

  -- Geolocalización
  ip_address INET,
  country TEXT,
  city TEXT,
  coordinates POINT,
  timezone TEXT,

  -- Device & Browser
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  browser_name TEXT,
  browser_version TEXT,
  os_name TEXT,
  os_version TEXT,

  -- UTM Parameters
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,

  -- Comportamiento
  referrer TEXT,
  page_views INTEGER DEFAULT 1,
  time_on_site INTEGER DEFAULT 0, -- segundos
  pages_visited TEXT[], -- array de URLs

  -- Conversiones
  is_authenticated BOOLEAN DEFAULT FALSE,
  purchased BOOLEAN DEFAULT FALSE,
  purchase_id TEXT,
  purchase_amount_cents INTEGER,
  purchase_date TIMESTAMPTZ,

  -- Timestamps
  first_visit TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices críticos
CREATE INDEX idx_visitor_tracking_session ON visitor_tracking(session_id);
CREATE INDEX idx_visitor_tracking_country ON visitor_tracking(country);
CREATE INDEX idx_visitor_tracking_created_at ON visitor_tracking(created_at);
CREATE INDEX idx_visitor_tracking_user_id ON visitor_tracking(user_id);
CREATE INDEX idx_visitor_tracking_utm_campaign ON visitor_tracking(utm_campaign);
```

### **Tabla `utm_campaigns` - Esquema Completo**

```sql
CREATE TABLE utm_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación
  name TEXT NOT NULL,
  description TEXT,

  -- UTM Parameters
  utm_source TEXT NOT NULL,
  utm_medium TEXT NOT NULL,
  utm_campaign TEXT NOT NULL,

  -- Estado y configuración
  status TEXT CHECK (status IN ('active', 'paused', 'completed')) DEFAULT 'active',
  budget DECIMAL(10,2),
  target_audience TEXT,

  -- Fechas
  start_date DATE,
  end_date DATE,

  -- Métricas reales (actualizadas por scripts)
  actual_spend DECIMAL(10,2) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,

  -- Métricas calculadas
  cac DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE WHEN conversions > 0 THEN actual_spend / conversions ELSE 0 END
  ) STORED,

  roas DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN actual_spend > 0 THEN (revenue / actual_spend) * 100 ELSE 0 END
  ) STORED,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_utm_campaigns_status ON utm_campaigns(status);
CREATE INDEX idx_utm_campaigns_utm_source ON utm_campaigns(utm_source);
CREATE INDEX idx_utm_campaigns_date_range ON utm_campaigns(start_date, end_date);
```

### **Vistas Materializadas para Performance**

```sql
-- Resumen geográfico rápido
CREATE MATERIALIZED VIEW geo_analytics_summary AS
SELECT
  country,
  COUNT(DISTINCT session_id) as unique_visitors,
  COUNT(*) as total_page_views,
  AVG(time_on_site) as avg_time_on_site,
  COUNT(CASE WHEN purchased = true THEN 1 END) as conversions,
  SUM(purchase_amount_cents) / 100.0 as total_revenue
FROM visitor_tracking
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY country
ORDER BY unique_visitors DESC;

-- Rendimiento de campañas
CREATE MATERIALIZED VIEW campaign_performance AS
SELECT
  uc.*,
  COALESCE(vt.visitors, 0) as visitors,
  COALESCE(vt.conversions, 0) as conversions,
  COALESCE(vt.revenue, 0) as revenue
FROM utm_campaigns uc
LEFT JOIN (
  SELECT
    utm_campaign,
    COUNT(DISTINCT session_id) as visitors,
    COUNT(CASE WHEN purchased = true THEN 1 END) as conversions,
    SUM(purchase_amount_cents) / 100.0 as revenue
  FROM visitor_tracking
  WHERE utm_campaign IS NOT NULL
  GROUP BY utm_campaign
) vt ON uc.utm_campaign = vt.utm_campaign;

-- Refresh automático diario
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW geo_analytics_summary;
  REFRESH MATERIALIZED VIEW campaign_performance;
END;
$$ LANGUAGE plpgsql;

-- Job programado (se ejecutaría con pg_cron o similar)
-- SELECT cron.schedule('refresh-analytics', '0 2 * * *', 'SELECT refresh_analytics_views();');
```

---

## 🔄 Flujos de Datos Detallados

### **Flujo de Primera Visita**

```
1. Usuario llega a la web
   ↓
2. Middleware intercepta request
   ↓
3. VisitorTracker.track() se ejecuta
   ├── Session ID generado/verificado
   ├── Geolocation (ipapi.co con cache)
   ├── Device detection
   ├── UTM extraction
   └── DB upsert (visitor_tracking)
   ↓
4. Página se sirve normalmente
   ↓
5. Frontend registra eventos (page views, time on site)
```

### **Flujo de Conversión**

```
1. Usuario navega y muestra interés
   ↓
2. Visitor tracking actualiza page_views, time_on_site
   ↓
3. Usuario se registra → user_id asignado
   ↓
4. Middleware actualiza visitor_tracking.user_id
   ↓
5. Usuario hace compra → Stripe checkout
   ↓
6. Webhook 'checkout.session.completed'
   ├── Actualiza visitor_tracking.purchased = TRUE
   ├── Vincula purchase_id
   ├── Registra amount y fecha
   └── Actualiza user_id si no estaba
   ↓
7. Dashboard muestra journey completo
```

### **Flujo de Analytics Query**

```
1. Dashboard carga (/admin/geo-analytics)
   ↓
2. API call: /api/admin/geo-analytics/filter
   ├── Parámetros: date range, country filter
   ├── Query a visitor_tracking
   ├── Join con users (opcional)
   └── Return data agrupada
   ↓
3. Frontend procesa datos
   ├── Mapa: Plotly.js bubble map
   ├── Tabla: DataTable sorteable
   ├── Gráficos: Trends con comparación
   └── KPIs: Cards en tiempo real
```

---

## ⚡ Optimizaciones de Performance

### **1. Caching Estratégico**

```typescript
// Cache de geolocalización (24h TTL)
const geoCache = new Map<string, GeoData>();
const GEO_CACHE_TTL = 24 * 60 * 60 * 1000;

async function getCachedGeolocation(ip: string): Promise<GeoData> {
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.timestamp < GEO_CACHE_TTL) {
    return cached.data;
  }

  const freshData = await fetchGeoData(ip);
  geoCache.set(ip, { data: freshData, timestamp: Date.now() });
  return freshData;
}
```

### **2. Queries Optimizadas**

```sql
-- Query optimizada con índices
SELECT
  country,
  COUNT(*) as visitors,
  AVG(time_on_site) as avg_time
FROM visitor_tracking
WHERE created_at >= $1 AND created_at <= $2
  AND country = COALESCE($3, country)
GROUP BY country
ORDER BY visitors DESC
LIMIT 100;
```

### **3. Lazy Loading en Frontend**

```typescript
// Carga diferida de datos pesados
const [mapData, setMapData] = useState(null);

useEffect(() => {
  // Cargar datos del mapa solo cuando sea visible
  const loadMapData = async () => {
    const data = await fetch('/api/geo-analytics/map-data');
    setMapData(data);
  };

  if (isMapVisible) {
    loadMapData();
  }
}, [isMapVisible]);
```

---

## 🔧 Scripts de Mantenimiento

### **Limpieza de Datos Antiguos**

```bash
#!/bin/bash
# Limpiar datos de más de 2 años
psql $DATABASE_URL -c "
DELETE FROM visitor_tracking
WHERE created_at < NOW() - INTERVAL '2 years'
  AND user_id IS NULL; -- Solo visitantes no registrados
"
```

### **Recálculo de Métricas**

```typescript
// script/refresh-analytics.ts
import { createClient } from '@supabase/supabase-js';

async function refreshAnalytics() {
  const supabase = createClient(url, key);

  // Refresh materialized views
  await supabase.rpc('refresh_materialized_views');

  // Recalculate campaign metrics
  const campaigns = await supabase.from('utm_campaigns').select('*');
  for (const campaign of campaigns) {
    await updateCampaignMetrics(campaign.id);
  }
}
```

### **Backup de Datos Críticos**

```bash
#!/bin/bash
# Backup semanal de analytics
pg_dump -t visitor_tracking -t utm_campaigns > analytics_backup_$(date +%Y%m%d).sql
```

---

## 🔍 Debugging y Troubleshooting

### **Problemas Comunes**

#### **1. Datos de geolocalización faltantes**
```sql
-- Verificar IPs sin geolocalización
SELECT ip_address, COUNT(*)
FROM visitor_tracking
WHERE country IS NULL
GROUP BY ip_address
ORDER BY count DESC;
```

#### **2. Sessions duplicadas**
```sql
-- Encontrar sessions con múltiples registros
SELECT session_id, COUNT(*)
FROM visitor_tracking
GROUP BY session_id
HAVING COUNT(*) > 1;
```

#### **3. UTM parameters mal capturados**
```sql
-- Revisar calidad de UTM tracking
SELECT
  utm_source,
  COUNT(*) as visits,
  COUNT(CASE WHEN purchased THEN 1 END) as conversions
FROM visitor_tracking
WHERE utm_source IS NOT NULL
GROUP BY utm_source
ORDER BY visits DESC;
```

### **Monitoreo de Performance**

```sql
-- Queries más lentas
SELECT
  query,
  total_time / 1000 as total_seconds,
  calls,
  mean_time / 1000 as mean_seconds
FROM pg_stat_statements
WHERE query LIKE '%visitor_tracking%'
ORDER BY total_time DESC
LIMIT 10;
```

---

## 🚀 Escalabilidad y Futuras Mejoras

### **Horizontal Scaling**
- **Database sharding** por fecha/rango geográfico
- **Redis caching** para queries frecuentes
- **CDN** para assets estáticos de mapas

### **Real-time Analytics**
- **WebSocket connections** para dashboards live
- **Event streaming** con Kafka/RabbitMQ
- **In-memory aggregation** para métricas en tiempo real

### **Advanced Analytics**
- **Machine Learning** para predicción de conversiones
- **Cohort analysis** automática
- **Attribution modeling** multi-touch

---

**Esta implementación proporciona una base sólida y escalable para analytics geográficos avanzados, con integración perfecta al ecosistema APIDevs.**
