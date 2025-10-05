# 📊 Guía Completa del Sistema Geo-Analytics

## 🎯 Resumen Ejecutivo

Sistema completo de análisis geográfico y tracking de marketing para APIDevs Trading Platform. Captura automáticamente datos de visitantes, analiza conversiones por país, tracked UTM campaigns, y genera visualizaciones interactivas para tomar decisiones basadas en datos.

---

## ✨ Funcionalidades Implementadas

### 1. **Tracking Automático de Visitantes**
✅ Captura automática en tiempo real  
✅ Geolocalización por IP (país, ciudad, coordenadas)  
✅ Device detection (browser, OS, mobile/desktop)  
✅ UTM parameters tracking (source, medium, campaign)  
✅ Session management con cookies persistentes  
✅ Tracking de páginas visitadas y tiempo en sitio  

### 2. **Dashboard Interactivo de Geo-Analytics** (`/admin/geo-analytics`)
✅ Mapa mundial interactivo (Plotly.js bubble map)  
✅ Visualización de conversiones por país  
✅ Tabla sorteable con estadísticas detalladas  
✅ Filtros por rango de fechas  
✅ **NUEVO: Gráficos de tendencias temporales**  
✅ **NUEVO: Comparación automática vs período anterior**  
✅ KPIs en tiempo real (visitas, conversiones, revenue)  

### 3. **Dashboard de Campañas UTM** (`/admin/campaigns`)
✅ Performance de campañas publicitarias  
✅ Métricas clave: CAC, ROAS, Conversion Rate  
✅ Filtros por fuente, estado, búsqueda  
✅ Tabla con indicadores visuales de salud de campañas  

### 4. **Análisis de Tendencias (FASE 4 COMPLETADA)**
✅ Gráficos de líneas temporales  
✅ Comparación período actual vs anterior  
✅ Tendencias de visitas, conversiones y revenue  
✅ Visualización de cambios porcentuales  
✅ Métricas de crecimiento/decrecimiento  

### 5. **Base de Datos Optimizada**
✅ Tabla `visitor_tracking` con todos los datos de sesión  
✅ Tabla `utm_campaigns` para gestión de campañas  
✅ Vistas materializadas para queries rápidas  
✅ RLS (Row Level Security) configurado  
✅ Integración con sistema de usuarios  

### 6. **API Routes Completas**
✅ `/api/admin/geo-analytics/filter` - Datos filtrados por fecha  
✅ `/api/admin/geo-analytics/trends` - Análisis de tendencias  
✅ `/api/admin/campaigns/filter` - Performance de campañas  
✅ `/api/tracking/conversion` - Registro de conversiones  

---

## 📐 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Geo-Analytics│  │  Campaigns   │  │  Trend Charts   │   │
│  │   Dashboard  │  │   Dashboard  │  │  + Comparison   │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────┐
│                     API ROUTES                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  /api/admin/geo-analytics/filter  (filtrado)         │ │
│  │  /api/admin/geo-analytics/trends  (tendencias)       │ │
│  │  /api/admin/campaigns/filter      (campañas)         │ │
│  │  /api/tracking/conversion         (conversiones)     │ │
│  └───────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────┐
│                      MIDDLEWARE                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  utils/supabase/middleware.ts                        │  │
│  │   ├─ Auth caching (60s TTL)                          │  │
│  │   ├─ Request deduplication                           │  │
│  │   └─ Visitor tracking (async, non-blocking)         │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────┐
│                   TRACKING LAYER                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  lib/tracking/visitor-tracker.ts                     │  │
│  │   ├─ Session management                              │  │
│  │   ├─ Geolocation (ipapi.co)                          │  │
│  │   ├─ Device detection                                │  │
│  │   ├─ UTM extraction                                  │  │
│  │   └─ DB insert/update                                │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────┐
│                   SUPABASE DATABASE                         │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ visitor_tracking │  │  utm_campaigns   │               │
│  │  (sesiones)      │  │  (campañas)      │               │
│  └──────────────────┘  └──────────────────┘               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │            MATERIALIZED VIEWS                         │ │
│  │  ├─ campaign_performance (pre-calculada)             │ │
│  │  ├─ country_stats (agregada por país)                │ │
│  │  └─ user_journey_stats (journey del usuario)         │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Cómo Usar el Sistema

### 1. **Visualizar Geo-Analytics**

**Acceso**: `https://tudominio.com/admin/geo-analytics`

1. Login con cuenta de admin
2. Por defecto muestra todos los datos históricos
3. **Usa el filtro de fecha** para analizar períodos específicos:
   - Hoy
   - Esta semana
   - Este mes
   - Último mes
   - Último trimestre
   - Rango personalizado

4. **Al aplicar filtro de fecha, verás automáticamente**:
   - Comparación de métricas vs período anterior
   - Gráficos de tendencias temporales
   - Mapa actualizado con datos filtrados
   - Tabla de países actualizada

**Interacciones**:
- **Mapa**: Pasa el cursor sobre países para ver detalles
- **Tabla**: Click en columnas para ordenar
- **Gráficos**: Hover para ver valores exactos

### 2. **Visualizar Campañas UTM**

**Acceso**: `https://tudominio.com/admin/campaigns`

1. Ve todas tus campañas activas/pausadas
2. Filtra por:
   - Fuente (Facebook, Google, Instagram, etc.)
   - Estado (activa, pausada, completada)
   - Búsqueda por nombre

3. **Métricas mostradas**:
   - **ROAS** (Return on Ad Spend): >1 = rentable
   - **CAC** (Cost Acquisition Cost): cuánto cuesta adquirir un cliente
   - **Conversion Rate**: % de visitantes que compran
   - **Spend/Revenue**: gasto vs ingreso

### 3. **Crear Campañas Trackeadas**

**Genera URLs con UTM parameters**:

```
https://tudominio.com/?utm_source=facebook&utm_medium=cpc&utm_campaign=promo_octubre&utm_content=banner_principal
```

**Parámetros UTM**:
- `utm_source`: facebook, google, instagram, linkedin, email
- `utm_medium`: cpc, social, email, referral, organic
- `utm_campaign`: nombre de tu campaña (ej: promo_octubre)
- `utm_term`: palabras clave (opcional)
- `utm_content`: variante del anuncio (opcional)

**Registrar campaña en base de datos**:

```sql
INSERT INTO utm_campaigns (name, source, medium, status, budget, target_audience)
VALUES (
  'Promo Octubre 2025',
  'facebook',
  'cpc',
  'active',
  500000, -- $5000 en centavos
  'Traders principiantes interesados en forex'
);
```

### 4. **Registrar Conversiones**

**Opción A: Desde componente cliente** (recomendado)

```typescript
import { trackConversion } from '@/lib/tracking/conversion-tracker';

// Después de compra exitosa en Stripe
await trackConversion({
  user_id: user.id,
  purchase_amount_cents: session.amount_total,
  product_id: product.id,
  subscription_id: subscription.id
});
```

**Opción B: Desde webhook de Stripe**

```typescript
// En tu webhook handler
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

## 📊 Interpretando los Datos

### KPIs Principales

**Visitas Totales**
- Total de sesiones únicas
- Incluye visitantes anónimos
- Mayor = mejor alcance

**Tasa de Conversión**
- `(Compras / Visitas) × 100`
- Industria promedio: 2-5%
- >5% = excelente
- <1% = revisar estrategia

**Revenue Total**
- Suma de todas las compras en el período
- En centavos en BD, mostrado en $

**ROAS (Return on Ad Spend)**
- `Revenue / Gasto en Ads`
- >1 = rentable
- >3 = muy rentable
- <1 = perdiendo dinero

**CAC (Customer Acquisition Cost)**
- `Gasto en Ads / Número de Clientes`
- Menor = mejor
- Debe ser < 30% del LTV (Lifetime Value)

### Análisis de Tendencias

**Gráficos de líneas**:
- **Línea sólida** = Período actual
- **Línea punteada** = Período anterior
- **Verde encima de morado** = mejora
- **Verde debajo de morado** = decrecimiento

**Comparación de períodos**:
- **Flecha verde ↑** = aumento positivo
- **Flecha roja ↓** = disminución
- **Línea gris —** = sin cambios (<0.1%)

### Análisis Geográfico

**Mapa de calor**:
- **Verde oscuro** = alta conversión
- **Amarillo** = conversión media
- **Rojo** = baja conversión
- **Tamaño del círculo** = volumen de visitas

**Insights clave**:
- Países con alta conversión pero pocas visitas = oportunidad de expansión
- Países con muchas visitas pero baja conversión = optimizar landing page
- Países con tiempo en sitio alto = buen engagement

---

## 🔧 Mantenimiento y Optimización

### Refrescar Vistas Materializadas

**Manual** (desde Supabase SQL Editor):

```sql
SELECT refresh_geo_analytics_views();
```

**Automático**:
- Se refrescan automáticamente al registrar conversiones
- Opcional: configurar cron job para refrescar cada hora

### Limpiar Datos Antiguos

```sql
-- Eliminar sesiones de hace más de 1 año
DELETE FROM visitor_tracking
WHERE created_at < NOW() - INTERVAL '1 year';
```

### Optimizar Performance

1. **Indexes ya creados** en la migración
2. **Vistas materializadas** pre-calculan queries pesadas
3. **Cache de sesiones** (60s) reduce llamadas a Supabase
4. **Server-side caching** (5 min) en páginas de admin

### Monitoreo

**Verificar tracking funciona**:

```bash
# En desarrollo
npm run dev

# Visita tu home
# Verifica en consola:
✅ Auth verified for / - 50ms
🎯 Tracked visitor: sess_abc123...
```

**Queries útiles**:

```sql
-- Visitas de hoy
SELECT COUNT(*) FROM visitor_tracking
WHERE DATE(created_at) = CURRENT_DATE;

-- Conversiones de esta semana
SELECT COUNT(*) FROM visitor_tracking
WHERE purchased = TRUE
AND created_at >= DATE_TRUNC('week', CURRENT_DATE);

-- Top 5 países por conversión
SELECT country_name, total_purchases, conversion_rate
FROM country_stats
ORDER BY conversion_rate DESC
LIMIT 5;
```

---

## 🎓 Best Practices

### 1. **Naming de Campañas**

✅ **Bueno**: `facebook_cpc_promo_navidad_2025`  
❌ **Malo**: `campaña1`

**Formato recomendado**:
`{source}_{medium}_{nombre_descriptivo}_{mes_año}`

### 2. **Testing de Campañas**

- Crear 2-3 variantes de anuncios (utm_content diferente)
- Medir ROAS de cada variante después de 1 semana
- Pausar las de ROAS <1, duplicar presupuesto en las >3

### 3. **Análisis Regular**

- **Diario**: Revisar visitas y conversiones del día
- **Semanal**: Analizar tendencias, pausar campañas no rentables
- **Mensual**: Comparar vs mes anterior, ajustar estrategia

### 4. **Decisiones Basadas en Datos**

**Si ves**:
- ROAS <1 → Pausar campaña o cambiar creatividades
- Conversion rate <1% → Optimizar landing page
- Tiempo en sitio <30s → Mejorar contenido
- Alto rebote de ciertos países → Traducir sitio

---

## 🐛 Troubleshooting

### Problema: No se trackean visitas

**Solución**:
1. Verifica que el servidor esté corriendo
2. Abre consola del navegador (F12)
3. Busca errores en Network tab
4. Verifica que la cookie `apidevs_session_id` se cree

### Problema: Geolocalización no funciona

**Causas comunes**:
- IP es local (192.168.x.x) → Se skipea automáticamente
- Rate limit de ipapi.co alcanzado → Esperar 1 día
- Network error → Verificar conectividad

### Problema: Gráficos no aparecen

**Solución**:
1. Aplicar un filtro de fecha (botón arriba a la derecha)
2. Esperar unos segundos a que carguen
3. Si persiste, abrir consola y buscar errores

### Problema: ROAS incorrectos

**Verificar**:
1. Que el campo `budget` en `utm_campaigns` esté en centavos
2. Que las conversiones se registren correctamente
3. Refrescar vistas materializadas manualmente

---

## 📈 Roadmap Futuro (Opcional)

- [ ] A/B Testing integrado
- [ ] Heatmaps & Session replay
- [ ] Real-time dashboard (WebSockets)
- [ ] Export a CSV/Excel
- [ ] Notificaciones de bajo ROAS
- [ ] Predicción de conversiones (ML)
- [ ] Integración con Google Analytics
- [ ] Multi-currency support

---

## 📞 Soporte

**Documentación relacionada**:
- `PLAN-GEO-ANALYTICS.md` - Plan original
- `GEO-ANALYTICS-INTEGRATION.md` - Integración con sistema existente
- `TRACKING-SYSTEM.md` - Detalles técnicos del tracking

**Logs**:
- Desarrollo: Ver consola de terminal
- Producción: Supabase logs o servicio de monitoring

**Base de datos**:
- Acceso: Supabase Dashboard
- Tablas: `visitor_tracking`, `utm_campaigns`
- Vistas: `campaign_performance`, `country_stats`, `user_journey_stats`

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0.0 COMPLETA ✅  
**Status**: PRODUCCIÓN READY 🚀