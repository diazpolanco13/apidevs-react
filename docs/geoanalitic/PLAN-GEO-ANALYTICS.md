# 🌍 PLAN DE IMPLEMENTACIÓN: Geo-Analytics Dashboard

**Fecha de Creación:** 2 de Octubre 2025  
**Objetivo:** Sistema de tracking geográfico de visitantes y análisis de conversión por país  
**Tiempo Estimado Total:** 12-15 horas  
**Nivel de Calidad:** Enterprise Premium (consistente con Dashboard de Compras)

---

## 📋 ÍNDICE DE FASES

```
INFRAESTRUCTURA (Fases 1-2) → 4-5 horas  → Base de datos + Middleware [⏳ Pendiente]
VISUALIZACIÓN (Fases 3-4)   → 5-6 horas  → Tab + Mapa + Métricas [⏳ Pendiente]
AVANZADO (Fase 5)           → 2-3 horas  → Campañas + UTM Tracking [⏳ Pendiente]
FINALIZACIÓN (Fase 6)       → 1-2 horas  → Testing + Docs [⏳ Pendiente]
```

**PROGRESO GLOBAL: 0% (0 de 6 fases completadas)**

---

## 🎯 VISIÓN GENERAL

### Problema a Resolver:

**"Facebook dice que envió el contenido a 10,000 usuarios españoles, ¿cuántos de esos 10,000 se conectaron a mi web y cuántos compraron?"**

### Contexto del Negocio:

Actualmente, cuando pagas publicidad en Facebook, Google Ads o Instagram, recibes métricas de la plataforma (reach, impressions, clicks), pero **NO tienes visibilidad de:**

1. ¿Cuántos de esos "clicks" realmente llegaron a tu web?
2. ¿De qué países vinieron exactamente?
3. ¿Cuánto tiempo permanecieron?
4. ¿Qué páginas visitaron?
5. ¿Cuántos compraron al final?

### Solución Propuesta:

Sistema híbrido de tracking que combina **3 fuentes de datos**:

1. **Tracking en tu servidor (Next.js Middleware)**
   - Captura IP de cada visitante
   - Obtiene geolocalización precisa (país, ciudad, coordenadas)
   - Guarda UTM parameters de las campañas
   - No depende de cookies bloqueables

2. **Datos de Stripe**
   - Confirma qué visitantes compraron
   - Valida país con billing address
   - Calcula revenue por país/campaña

3. **Cookies de sesión**
   - Vincula múltiples visitas del mismo usuario
   - Rastrea navegación completa (landing → exit)
   - Calcula tiempo en sitio

### Flujo Completo del Sistema:

```
Usuario ve anuncio Facebook (España)
         ↓
[CLICK] utm_source=facebook&utm_campaign=spain_2025
         ↓
Tu Middleware captura:
  • IP: 89.116.30.133
  • País: España (ES)
  • Ciudad: Madrid
  • UTM params guardados
  • Session ID generado
         ↓
Usuario navega tu web
  • Páginas visitadas: 5
  • Tiempo en sitio: 3min 45s
  • Producto visto: "Pro Anual"
         ↓
Usuario compra (Stripe Checkout)
         ↓
Webhook de Stripe actualiza:
  • visitor_tracking.purchased = TRUE
  • Vincula purchase_id
  • Confirma país con billing_address
         ↓
Dashboard muestra:
  ✅ Facebook Reach: 10,000
  ✅ Visitas reales: 3,245 (32.45% CTR)
  ✅ Compras: 23 (0.71% conversion)
  ✅ Revenue España: $6,789
```

---

## 📊 MÉTRICAS CLAVE QUE RESOLVERÁS

### Pregunta 1: "¿Cuántos visitantes recibo por país?"
**Respuesta:** Tabla con países ordenados por visitas, mapa interactivo con pins.

### Pregunta 2: "¿Qué países compran más?"
**Respuesta:** Conversion rate por país, colores en mapa (verde/amarillo/rojo).

### Pregunta 3: "¿Mi campaña de Facebook España funciona?"
**Respuesta:** 
- Facebook dice: 10,000 reach
- Tu web registra: 3,245 visitas (32.45% CTR)
- Compras: 23 (0.71% conversion)
- CAC: $12.50
- ROAS: 2.8x

### Pregunta 4: "¿Vale la pena publicidad en México?"
**Respuesta:**
- Visitas México: 1,567
- Compras: 12
- Conversion: 0.77%
- Revenue: $3,456
- Comparativa con otros países

---

## 🔧 FASE 1: BASE DE DATOS Y ESQUEMA

**Tiempo:** 1-2 horas  
**Estado:** ⏳ Pendiente  
**Prioridad:** CRÍTICA

### Objetivo:
Crear la infraestructura de base de datos para almacenar y consultar eficientemente millones de visitas.

### Tabla 1: `visitor_tracking`

**Propósito:** Registrar CADA visita a tu web con máxima información.

**Campos principales:**
- **Identificación:** session_id único, fingerprint opcional
- **Red:** ip_address
- **Geolocalización:** country (ISO code), country_name, city, region, latitude, longitude, postal_code
- **Dispositivo:** user_agent, browser, os, device_type (desktop/mobile/tablet)
- **Origen:** referer, utm_source, utm_medium, utm_campaign, utm_term, utm_content
- **Navegación:** landing_page, exit_page, pages_visited, time_on_site (segundos)
- **Conversión:** purchased (boolean), purchase_id (FK), purchase_amount_cents, purchase_date
- **Timestamps:** first_visit_at, last_visit_at, created_at, updated_at

**Índices críticos para performance:**
- Por país (queries "mostrar España")
- Por purchased (queries "solo compradores")
- Por utm_campaign (queries "campaña X")
- Índice compuesto: (utm_source, utm_campaign, country, purchased) para analytics de campañas
- Por fecha para filtros de rango

**Volumen esperado:** 
- Sitio pequeño: ~1,000 visitas/mes = 12K/año
- Sitio mediano: ~10,000 visitas/mes = 120K/año
- Sitio grande: ~100,000 visitas/mes = 1.2M/año

### Tabla 2: `utm_campaigns`

**Propósito:** Gestionar campañas publicitarias y sus metas.

**Campos principales:**
- **Identificación:** campaign_name, utm_source, utm_medium, utm_campaign
- **Targeting:** target_countries (array de códigos ISO)
- **Budget:** budget_cents, status (active/paused/completed)
- **Metas:** reach_goal, visits_goal, purchases_goal
- **Datos externos:** external_reach (del dashboard de FB/Google), external_impressions, external_clicks, external_spend_cents
- **Metadata:** notes, created_by, start_date, end_date

**Uso:**
Cuando creas una campaña en Facebook "Spain Targeting 2025":
1. Creas registro en `utm_campaigns`
2. Defines: target_countries = ["ES"], reach_goal = 10,000, budget = $500
3. Facebook te da: external_reach = 10,000, external_clicks = 3,500
4. Tu sistema calcula automáticamente: visitas reales, compras, CAC, ROAS

### Vista Materializada 1: `campaign_performance`

**Propósito:** Pre-calcular métricas complejas de campañas para dashboards rápidos.

**Métricas calculadas:**
- **Funnel completo:** external_reach → total_visits → total_purchases
- **Tasas:** reach_to_visit_rate (CTR real), visit_to_purchase_rate (conversion)
- **Financieras:** cac_cents (costo por cliente), roas (retorno sobre inversión)
- **Cobertura:** countries_reached, total_revenue_cents

**Beneficio:** En lugar de calcular estas métricas en cada request (lento), se pre-calculan y se refrescan cada hora o manualmente.

### Vista Materializada 2: `country_stats`

**Propósito:** Estadísticas agregadas por país para el mapa y la tabla.

**Métricas calculadas:**
- **Volumen:** total_visits, total_purchases
- **Revenue:** total_revenue_cents
- **Engagement:** conversion_rate, avg_time_on_site, avg_pages_visited
- **Frescura:** last_visit

**Uso en UI:**
- Mapa: colorear países según conversion_rate
- Tabla: ordenar países por cualquier métrica
- Cards: "Top 5 países por revenue"

### Triggers y Funciones:

**Trigger 1: `update_updated_at_column`**
- Actualiza automáticamente el campo `updated_at` en cada UPDATE
- Beneficio: No tener que recordar hacerlo manualmente

**Función: `refresh_campaign_performance()`**
- Refresca la vista materializada bajo demanda
- Se puede ejecutar manualmente o con un cron job cada hora

---

## 🚀 FASE 2: MIDDLEWARE Y TRACKING

**Tiempo:** 2-3 horas  
**Estado:** ⏳ Pendiente  
**Dependencias:** Fase 1

### Objetivo:
Capturar automáticamente datos de CADA visitante sin afectar la velocidad del sitio.

### Componente 1: Next.js Middleware

**Qué es:** Un interceptor que se ejecuta ANTES de que se sirva cualquier página.

**Dónde vive:** Archivo `middleware.ts` en la raíz del proyecto.

**Qué captura:**

1. **IP del visitante:**
   - Usar función `ipAddress()` de `@vercel/functions`
   - Ejemplo: "89.116.30.133"

2. **Geolocalización automática:**
   - Usar función `geolocation()` de `@vercel/functions`
   - Vercel/Cloudflare ya saben la ubicación por la IP
   - Sin latencia adicional (headers ya incluyen esta info)
   - Precisión: país 99%, ciudad ~80%

3. **UTM Parameters:**
   - Leer de la URL: `?utm_source=facebook&utm_campaign=spain_2025`
   - Guardar TODOS los UTM (source, medium, campaign, term, content)

4. **User Agent:**
   - String completo del navegador
   - Parsear para obtener: browser, OS, device type

5. **Referer:**
   - URL de donde vino (si existe)
   - Ejemplo: "https://www.facebook.com/"

6. **Landing Page:**
   - Primera página que visitó
   - Ejemplo: "/precios"

**Session ID Management:**

Generar o reusar session_id con cookie:
- Si NO existe cookie `visitor_session_id` → Generar nuevo UUID
- Si SÍ existe → Reusar mismo session_id
- Cookie dura 30 días
- Permite rastrear múltiples visitas del mismo usuario

**Performance crítica:**

El middleware NO debe bloquear la carga de la página. Solución:
- Guardar datos de tracking en **background** (fire-and-forget)
- Si el INSERT a Supabase falla, no importa (no fallar el request del usuario)
- Timeout de 100ms máximo para tracking

**Rutas excluidas:**

NO trackear:
- `/api/*` (rutas de API)
- `/admin/*` (panel de admin)
- `/_next/*` (assets de Next.js)
- `/static/*` (archivos estáticos)

Solo trackear rutas públicas donde realmente hay usuarios navegando.

### Componente 2: Visitor Tracker

**Función:** `trackVisitor(data)`

**Lógica:**

1. **Primera visita:**
   - No existe el session_id en la tabla
   - INSERT nuevo registro con todos los datos
   - pages_visited = 1

2. **Visita subsecuente (mismo usuario):**
   - Ya existe el session_id
   - UPDATE registro:
     - pages_visited += 1
     - last_visit_at = NOW()
     - exit_page = página actual
     - time_on_site = diferencia entre first_visit_at y NOW()

**Beneficio:** Puedes ver:
- "Usuario de España visitó 8 páginas en 12 minutos"
- "Landing page: /precios, Exit page: /checkout"

### Componente 3: Webhook de Stripe

**Propósito:** Vincular visitas con compras.

**Flujo:**

1. Usuario completa compra en Stripe Checkout
2. Stripe envía webhook `checkout.session.completed`
3. Tu endpoint recibe el evento
4. Extrae `session_id` de metadata de Stripe
5. UPDATE en `visitor_tracking`:
   - purchased = TRUE
   - purchase_id = payment_intent_id
   - purchase_amount_cents = amount_total
   - purchase_date = NOW()

**Requisito previo:**

Cuando crees el Stripe Checkout Session, debes pasar el `visitor_session_id` en metadata:

```
metadata: {
  visitor_session_id: cookieValue
}
```

Esto permite vincular la compra con la visita original.

### Librería recomendada: `ua-parser-js`

Para parsear User Agent strings de forma precisa:
- Detecta correctamente: Chrome, Safari, Firefox, Edge, etc.
- Detecta OS: Windows, macOS, iOS, Android, Linux
- Detecta device: desktop, mobile, tablet

Alternativa: Implementar parsing manual con regex (más simple pero menos preciso).

---

## 🗺️ FASE 3: COMPONENTE GEO-ANALYTICS TAB

**Tiempo:** 3-4 horas  
**Estado:** ⏳ Pendiente  
**Dependencias:** Fase 1, 2

### Objetivo:
Crear un nuevo tab en el Dashboard de Admin con visualización geográfica.

### Estructura de Navegación:

Actualmente tienes:
```
/admin/dashboard
/admin/usuarios
/admin/compras
```

Agregar:
```
/admin/geo-analytics  ← NUEVO
```

### Layout del Tab:

**Sección 1: Header con título y filtros de fecha**

- Título: "Geo-Analytics" con ícono de globo
- Subtítulo: "Análisis geográfico de tráfico y conversiones por país"
- Filtros de rango: "7 días", "30 días", "90 días" (botones toggle)
- Diseño glassmorphism consistente con Dashboard de Compras

**Sección 2: 4 Cards de Métricas Globales**

Grid de 2x2 o 4 columnas, cada card con:

1. **Card "Visitas Totales"**
   - Ícono: Users (👥)
   - Valor: Número total de visitas en el período
   - Cambio: "+12.5%" vs período anterior
   - Color: Azul
   - Tooltip: "Total de sesiones únicas registradas"

2. **Card "Compras"**
   - Ícono: ShoppingCart (🛒)
   - Valor: Número de compras
   - Cambio: "+8.3%" vs período anterior
   - Color: Verde
   - Tooltip: "Visitantes que completaron una compra"

3. **Card "Conversion Rate"**
   - Ícono: TrendingUp (📈)
   - Valor: Porcentaje de conversión global
   - Cambio: "-0.2%" vs período anterior
   - Color: Morado
   - Tooltip: "Compras / Visitas * 100"

4. **Card "Países Alcanzados"**
   - Ícono: Globe (🌍)
   - Valor: Número de países únicos
   - Info extra: "Top: España" (país con más visitas)
   - Color: Naranja
   - Tooltip: "Países desde donde se conectaron"

**Sección 3: Mapa Interactivo**

Título: "Mapa de Conversiones Global"

Características del mapa:
- Librería: Leaflet (open-source) o Mapbox (premium)
- Tema: Dark mode (consistente con tu diseño)
- Tiles: CartoDB Dark Matter (gratuito, se ve profesional)
- Vista inicial: Centrado en el mundo, zoom para ver todos los países

**Markers por país:**
- **Forma:** Círculos (no pins tradicionales)
- **Tamaño:** Proporcional al número de visitas
  - Fórmula: `radio = min(max(visitas / 100, 5), 30)`
  - Mínimo 5px, máximo 30px
- **Color:** Según conversion rate
  - Verde (🟢): ≥2% conversion (excelente)
  - Amarillo (🟡): 1-2% conversion (promedio)
  - Rojo (🔴): <1% conversion (mejorable)
- **Borde:** Blanco, 2px, para contraste

**Interactividad:**
- **Hover:** Highlight del marker
- **Click:** Selecciona el país y actualiza la tabla de abajo
- **Popup:** Al hacer click, mostrar tooltip con:
  - Nombre del país
  - Visitas: X,XXX
  - Compras: XX
  - Conv. Rate: X.XX%

**Leyenda del mapa:**
Posición: Esquina inferior derecha
Contenido:
- "Tasa de Conversión"
- 🟢 ≥ 2% (Alta)
- 🟡 1-2% (Media)
- 🔴 < 1% (Baja)
- Fondo semi-transparente

**Sección 4: Tabla de Países**

Título: "Estadísticas por País"

Columnas:
1. **Bandera + País**
   - Emoji de bandera (🇪🇸, 🇺🇸, 🇲🇽)
   - Nombre completo del país
   
2. **Visitas**
   - Número formateado (3,245)
   
3. **Compras**
   - Número simple (23)
   
4. **Conversion Rate**
   - Porcentaje con color:
     - Verde si ≥2%
     - Amarillo si 1-2%
     - Rojo si <1%
   - Flecha de tendencia (↑/↓/→)

5. **Revenue**
   - Monto en USD: $6,789.00
   
6. **Avg. Time**
   - Tiempo promedio en sitio: "3m 45s"

**Funcionalidades de la tabla:**
- Ordenamiento por cualquier columna (click en header)
- Búsqueda por nombre de país
- Paginación si hay >20 países
- Highlight del país seleccionado en mapa
- Export a CSV (bonus)

**Sincronización Mapa ↔ Tabla:**
- Click en país en mapa → Scroll automático a ese país en tabla + highlight
- Click en fila de tabla → Zoom del mapa a ese país

---

## 📊 FASE 4: MÉTRICAS Y TABLAS AVANZADAS

**Tiempo:** 2 horas  
**Estado:** ⏳ Pendiente  
**Dependencias:** Fase 3

### Objetivo:
Añadir visualizaciones adicionales y comparativas.

### Sección 5: Top 5 Países

**Formato:** Cards horizontales con ranking

Cada card muestra:
1. **Medalla:** 🥇 🥈 🥉 (top 3) o número (4, 5)
2. **Bandera + País**
3. **Barra de progreso horizontal**
   - Ancho proporcional al % del total
   - Color según posición (degradado)
4. **Métricas:**
   - Visitas: X,XXX (XX% del total)
   - Revenue: $X,XXX

**Ordenamiento:** Por defecto por visitas, opción de cambiar a revenue o conversion rate.

### Sección 6: Gráfico de Tendencias

**Tipo:** Line Chart (Recharts)

**Datos:**
- Eje X: Últimos 30 días
- Eje Y: Número de visitas
- Líneas:
  - Total de visitas (azul)
  - Visitas que compraron (verde)
  - Gap entre líneas muestra la conversión

**Interactividad:**
- Tooltip al hacer hover mostrando fecha y valores exactos
- Zoom en rango de fechas
- Toggle para mostrar/ocultar líneas

### Sección 7: Breakdown por Dispositivo

**Formato:** 3 Cards pequeñas

1. **Desktop**
   - Ícono: Monitor
   - Visitas: X,XXX (XX%)
   - Conversion: X.XX%

2. **Mobile**
   - Ícono: Smartphone
   - Visitas: X,XXX (XX%)
   - Conversion: X.XX%

3. **Tablet**
   - Ícono: Tablet
   - Visitas: X,XXX (XX%)
   - Conversion: X.XX%

**Insight automático:**
Ejemplo: "⚠️ Mobile tiene 60% de tráfico pero solo 0.5% conversion. Revisar UX móvil."

---

## 🎯 FASE 5: CAMPAÑAS Y UTM TRACKING

**Tiempo:** 2-3 horas  
**Estado:** ⏳ Pendiente  
**Dependencias:** Fase 4

### Objetivo:
Responder: "¿Mi campaña de Facebook funciona?"

### Sección 8: Vista de Campañas

**Layout:** Lista de cards expandibles

Cada card de campaña muestra:

**Header de la campaña:**
- Nombre: "Spain Targeting 2025"
- Source: Facebook
- Status: 🟢 Active / ⏸️ Paused / ✅ Completed
- Fechas: 1 Oct - 31 Oct 2025

**Funnel Visual (3 columnas):**

```
┌─────────────────────────────────────────┐
│  REACH (Facebook)                       │
│  10,000 usuarios                        │
│  Según dashboard de Facebook            │
└─────────────────────────────────────────┘
         ↓ CTR: 32.45%
┌─────────────────────────────────────────┐
│  VISITAS (Tu web)                       │
│  3,245 visitantes                       │
│  Tracking real de tu servidor           │
└─────────────────────────────────────────┘
         ↓ Conversion: 0.71%
┌─────────────────────────────────────────┐
│  COMPRAS (Stripe)                       │
│  23 compras                             │
│  Revenue: $6,789                        │
└─────────────────────────────────────────┘
```

**Métricas Financieras (4 columnas):**

1. **Gastado**
   - $500.00
   - (external_spend_cents de Facebook)

2. **Revenue**
   - $6,789.00
   - (suma de todas las compras de esta campaña)

3. **CAC** (Customer Acquisition Cost)
   - $21.74
   - Fórmula: Gastado / Compras = $500 / 23

4. **ROAS** (Return on Ad Spend)
   - 13.6x
   - Fórmula: Revenue / Gastado = $6,789 / $500
   - Color: Verde si ≥3x, Amarillo si 2-3x, Rojo si <2x

**Breakdown por País (tabla colapsable):**

Mostrar qué países fueron alcanzados por esta campaña:
- España: 2,890 visitas, 18 compras, 0.62% conv
- México: 245 visitas, 3 compras, 1.22% conv
- Colombia: 110 visitas, 2 compras, 1.82% conv

**Insights automáticos:**

Ejemplos de mensajes que el sistema puede generar:
- ✅ "ROAS de 13.6x indica campaña muy rentable"
- ⚠️ "Colombia tiene mejor conversion (1.82%) que España (0.62%). Considera aumentar presupuesto en Colombia."
- 🚀 "32.45% CTR está por encima del promedio de la industria (1-2%)"
- ❌ "Solo 23 compras de 3,245 visitas. Revisar página de checkout."

### Formulario: Crear Nueva Campaña

**Campos:**

1. **Nombre de campaña**
   - Ej: "Black Friday México 2025"

2. **UTM Source**
   - Dropdown: Facebook, Google, Instagram, TikTok, Email, Custom

3. **UTM Campaign**
   - Text input: "black_friday_mx_2025"

4. **Países objetivo**
   - Multi-select: ES, MX, CO, AR, etc.

5. **Presupuesto**
   - Input: $500.00

6. **Metas (opcionales):**
   - Reach esperado: 10,000
   - Visitas esperadas: 3,000
   - Compras esperadas: 30

7. **Datos externos (se llenan luego):**
   - Reach real (de Facebook): 10,500
   - Impressions: 45,000
   - Clicks: 3,500
   - Spend real: $487.50

**Output:** URL pre-formada para usar en Facebook Ads

```
https://apidevs.io/precios?utm_source=facebook&utm_medium=cpc&utm_campaign=black_friday_mx_2025
```

### Comparador de Campañas

**Vista:** Tabla comparativa de todas las campañas

Columnas:
- Campaña
- Source
- Reach → Visitas → Compras (funnel compacto)
- CTR
- Conversion
- CAC
- ROAS
- Status

**Ordenamiento:** Por defecto por ROAS (las más rentables arriba)

**Filtros:**
- Por source (solo Facebook, solo Google, etc.)
- Por status (solo activas)
- Por rango de fechas

---

## ✅ FASE 6: TESTING Y FINALIZACIÓN

**Tiempo:** 1-2 horas  
**Estado:** ⏳ Pendiente  
**Dependencias:** Todas las anteriores

### Objetivo:
Asegurar que todo funciona correctamente y documentar.

### Testing Manual:

**Test 1: Tracking de Visitas**
1. Abrir tu web en incógnito
2. Visitar con `?utm_source=test&utm_campaign=manual_test`
3. Navegar 3-4 páginas
4. Verificar en Supabase:
   - Registro en `visitor_tracking` con session_id
   - UTM params guardados correctamente
   - pages_visited = 3 o 4
   - Geolocalización detectada

**Test 2: Vinculación con Compra**
1. Continuar sesión anterior
2. Completar una compra de prueba
3. Verificar webhook de Stripe ejecutado
4. Verificar en Supabase:
   - purchased = TRUE
   - purchase_id vinculado
   - purchase_amount correcto

**Test 3: Dashboard Visual**
1. Abrir `/admin/geo-analytics`
2. Verificar que carga sin errores
3. Verificar mapa muestra países
4. Click en país, verificar sincronización con tabla
5. Probar filtros de fecha
6. Verificar métricas calculadas correctamente

**Test 4: Campañas**
1. Crear campaña de prueba
2. Generar URL con UTMs
3. Visitar con esa URL
4. Verificar que la visita se asocia a la campaña
5. Verificar métricas de campaña se actualizan

### Casos Edge a Verificar:

1. **Usuario sin JavaScript:** ¿Se trackea igual? (Sí, es server-side)
2. **Usuario con VPN:** ¿Geolocalización incorrecta? (Inevitable, informar limitación)
3. **Usuario con AdBlock:** ¿Se trackea? (Sí, no usa cookies de terceros)
4. **Múltiples pestañas abiertas:** ¿Se cuenta como 1 o múltiples visitas? (1, mismo session_id)
5. **Session cookie borrada:** ¿Qué pasa? (Se genera nuevo session_id, cuenta como nuevo visitante)

### Performance Testing:

**Objetivo:** El middleware NO debe añadir latencia perceptible.

1. Medir tiempo de respuesta SIN tracking
2. Medir tiempo de respuesta CON tracking
3. Diferencia debe ser <50ms
4. Si es mayor, optimizar (mover tracking a background job)

### Documentación a Crear:

**Archivo 1: `GEO-ANALYTICS.md`** (este documento)
- Explicación completa del sistema
- Arquitectura
- Esquema de base de datos

**Archivo 2: `GEO-ANALYTICS-USAGE.md`**
- Cómo usar el dashboard
- Cómo crear campañas
- Cómo interpretar métricas
- FAQ

**Archivo 3: Comentarios en código**
- Explicar funciones complejas
- Documentar decisiones de diseño

---

## 🎓 CONCEPTOS CLAVE PARA ENTENDER

### 1. ¿Qué es un UTM Parameter?

UTM = Urchin Tracking Module (de Google Analytics)

Son parámetros que añades a tus URLs para saber de dónde vino el tráfico:

```
https://tusite.com/producto?utm_source=facebook&utm_campaign=verano2025
```

**Los 5 UTM estándar:**
- `utm_source`: De qué plataforma (facebook, google, instagram)
- `utm_medium`: Tipo de tráfico (cpc, email, social)
- `utm_campaign`: Nombre de campaña (verano2025, black_friday)
- `utm_term`: Palabra clave (solo para Google Ads)
- `utm_content`: Variante del anuncio (ad_a, ad_b)

### 2. ¿Qué es Geolocalización por IP?

Cada dispositivo conectado a internet tiene una IP única.
Servicios como MaxMind mantienen bases de datos gigantes que mapean:
- IP 89.116.30.133 → España, Madrid, lat: 40.4165, lng: -3.7026

Vercel/Cloudflare ya hacen esto automáticamente en sus servidores.
Tu código solo tiene que leer los headers.

**Precisión:**
- País: ~99% preciso
- Ciudad: ~75-80% preciso
- Coordenadas: ~20-50km de error

**Limitación:** VPNs reportan el país del servidor VPN, no del usuario real.

### 3. ¿Qué es un Session ID?

Identificador único por visitante para rastrear múltiples visitas.

**Ejemplo:**
```
Session ID: 1727876543210-xyz789abc
  Visita 1: 2 Oct 10:30am → /inicio
  Visita 2: 2 Oct 10:32am → /precios
  Visita 3: 2 Oct 10:35am → /checkout
  Compra:   2 Oct 10:40am → ✅ $390
```

Sin session_id, cada visita parecería un usuario diferente.

**Almacenamiento:** Cookie HTTP-only (no accesible desde JavaScript, más seguro).

### 4. ¿Qué es CAC y ROAS?

**CAC** (Customer Acquisition Cost):
- Cuánto gastas para conseguir 1 cliente
- Fórmula: Gasto de publicidad / Número de clientes
- Ejemplo: $500 / 23 clientes = $21.74 por cliente
- **Objetivo:** Que sea menor que el LTV (valor de vida del cliente)

**ROAS** (Return on Ad Spend):
- Cuántos dólares ganas por cada dólar gastado
- Fórmula: Revenue / Gasto de publicidad
- Ejemplo: $6,789 / $500 = 13.6x
- **Interpretación:**
  - <1x = Pierdes dinero
  - 1-2x = Breakeven o ganancia mínima
  - 2-3x = Bueno
  - 3-5x = Muy bueno
  - >5x = Excelente

### 5. ¿Qué es una Vista Materializada?

Tabla "virtual" que almacena resultados pre-calculados de queries complejas.

**Sin vista materializada:**
```sql
SELECT country, COUNT(*), AVG(conversion_rate)
FROM visitor_tracking
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY country;
-- Tarda 2 segundos con 1 millón de registros
```

**Con vista materializada:**
```sql
SELECT * FROM country_stats;
-- Tarda 0.05 segundos (ya está calculado)
```

**Trade-off:**
- ✅ Mucho más rápido
- ❌ Datos ligeramente desactualizados (se refresca cada hora)

Para dashboards de analytics, es perfecto (no necesitas datos en tiempo real al segundo).

---

## 🎯 RESULTADO FINAL ESPERADO

### Dashboard Geo-Analytics Completo:

Usuario administrador accede a `/admin/geo-analytics` y ve:

**Pantalla 1: Overview Global**
- 4 métricas globales en cards
- Mapa interactivo con pins de países
- Tabla con top países
- Selector de rango de fechas

**Pantalla 2: Campañas (tab aparte o sección abajo)**
- Lista de campañas activas
- Cada campaña muestra funnel completo
- Métricas CAC y ROAS
- Comparador de campañas

### Flujo de Uso Real:

**Caso 1: Lanzar campaña en Facebook**

1. Vas a `/admin/geo-analytics/campanas`
2. Click "Nueva Campaña"
3. Llenas formulario:
   - Nombre: "Promoción España Octubre"
   - Source: Facebook
   - Campaign: "promo_es_oct_2025"
   - Países: España
   - Presupuesto: $500
4. Sistema genera URL:
   ```
   https://apidevs.io?utm_source=facebook&utm_campaign=promo_es_oct_2025
   ```
5. Copias esa URL a Facebook Ads Manager
6. Lanzas la campaña

**Una semana después:**

7. Vuelves a `/admin/geo-analytics`
8. Ves:
   - Facebook reporta: 8,500 reach
   - Tu web registra: 2,890 visitas (34% CTR)
   - Compras: 18 (0.62% conversion)
   - Revenue: $5,234
   - CAC: $27.78
   - ROAS: 10.5x ✅

9. **Decisión informada:**
   - ROAS de 10.5x es excelente → Aumentar presupuesto
   - CTR de 34% es muy alto → El anuncio funciona
   - Conversion de 0.62% es mejorable → Revisar landing page

**Caso 2: Comparar países**

1. Entras a la tabla de países
2. Ordenas por "Conversion Rate"
3. Descubres:
   - Colombia: 1.82% conversion con solo 110 visitas
   - España: 0.62% conversion con 2,890 visitas
4. **Insight:** Colombia convierte mejor pero tiene poco tráfico
5. **Acción:** Lanzar campaña específica para Colombia

### Métricas de Éxito:

Al finalizar la implementación, debes poder responder:

✅ **"¿Cuántos visitantes tengo por país?"**
- Respuesta: Tabla ordenada + mapa visual

✅ **"¿Qué países compran más?"**
- Respuesta: Conversion rate por país, colores en mapa

✅ **"¿Mi campaña de Facebook funciona?"**
- Respuesta: Funnel completo, CAC, ROAS

✅ **"¿Vale la pena invertir en publicidad en X país?"**
- Respuesta: Comparativa de países con métricas financieras

✅ **"¿Cuánto dinero generé de cada campaña?"**
- Respuesta: Revenue por campaña + ROAS

---

## 🔧 DEPENDENCIAS TÉCNICAS

### Librerías NPM a Instalar:

1. **`@vercel/functions`**
   - Para: ipAddress() y geolocation()
   - Solo funciona en Vercel (tu hosting)

2. **`leaflet`** + **`react-leaflet`**
   - Para: Mapa interactivo
   - Alternativa: Mapbox (requiere API key de pago)

3. **`ua-parser-js`** (opcional)
   - Para: Parsear User Agent strings
   - Alternativa: Regex manual (más simple, menos preciso)

4. **Recharts** (ya lo tienes)
   - Para: Gráficos de tendencias

### Variables de Entorno Necesarias:

```env
# Stripe (ya las tienes)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase (ya las tienes)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

No se requieren APIs adicionales (Vercel geo es gratuito).

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Base de Datos ✅
- [ ] Crear tabla `visitor_tracking`
- [ ] Crear tabla `utm_campaigns`
- [ ] Crear vista `campaign_performance`
- [ ] Crear vista `country_stats`
- [ ] Crear índices optimizados
- [ ] Crear triggers de actualización

### Fase 2: Tracking ✅
- [ ] Implementar middleware Next.js
- [ ] Capturar IP y geolocalización
- [ ] Parsear User Agent
- [ ] Extraer UTM parameters
- [ ] Generar/gestionar session_id
- [ ] Implementar visitor tracker
- [ ] Crear webhook de Stripe
- [ ] Probar tracking end-to-end

### Fase 3: UI Base ✅
- [ ] Crear ruta `/admin/geo-analytics`
- [ ] Implementar componente GeoAnalyticsTab
- [ ] 4 cards de métricas globales
- [ ] Integrar Leaflet/Mapbox
- [ ] Implementar mapa con markers
- [ ] Colorear markers según conversion
- [ ] Popups con información
- [ ] Leyenda del mapa

### Fase 4: Tablas y Visualizaciones ✅
- [ ] Tabla de países con estadísticas
- [ ] Ordenamiento por columnas
- [ ] Sincronización mapa ↔ tabla
- [ ] Top 5 países (ranking)
- [ ] Gráfico de tendencias
- [ ] Breakdown por dispositivo

### Fase 5: Campañas ✅
- [ ] Vista de lista de campañas
- [ ] Card de campaña con funnel
- [ ] Métricas CAC y ROAS
- [ ] Formulario crear campaña
- [ ] Generador de URLs con UTMs
- [ ] Comparador de campañas
- [ ] Insights automáticos

### Fase 6: Testing ✅
- [ ] Test tracking de visitas
- [ ] Test vinculación con compras
- [ ] Test dashboard visual
- [ ] Test campañas
- [ ] Performance testing
- [ ] Documentación
- [ ] Deploy a producción

---

## 🚀 PRÓXIMOS PASOS DESPUÉS DE IMPLEMENTAR

### Mejoras Futuras (Fase 7+):

1. **Heatmaps de clicks**
   - Ver dónde hacen click los usuarios
   - Librería: Hotjar o implementación custom

2. **Grabación de sesiones**
   - Ver cómo navegan los usuarios
   - Librería: LogRocket, FullStory

3. **A/B Testing integrado**
   - Probar variantes de páginas
   - Medir cuál convierte mejor

4. **Alertas automáticas**
   - Email cuando ROAS <2x
   - Email cuando país nuevo con buena conversion
   - Email cuando campaña supera meta

5. **Predicciones con ML**
   - Predecir qué países convertirán mejor
   - Sugerir presupuestos óptimos

6. **Integración directa con Facebook API**
   - Importar automáticamente reach e impressions
   - No llenar manualmente los datos externos

7. **Dashboard público para clientes**
   - Versión simplificada sin datos sensibles
   - Mostrar solo sus campañas

---

## 💡 CONSEJOS DE IMPLEMENTACIÓN

### 1. Empezar Simple
No implementes todo de golpe. Orden recomendado:
1. Base de datos (Fase 1)
2. Tracking básico (Fase 2)
3. Vista simple con tabla (parte de Fase 3)
4. Mapa (resto de Fase 3)
5. Campañas (Fase 5)

### 2. Datos de Prueba
Antes de tener tráfico real, genera datos fake para desarrollar:
- 10,000 visitas aleatorias
- 50 países diferentes
- 100 compras
- 3-4 campañas

Script SQL para insertar datos de prueba (te lo puedo dar después).

### 3. Performance
- Usar vistas materializadas para queries lentas
- Refrescar vistas con cron job (cada hora)
- Índices en TODAS las columnas que uses en WHERE
- Limitar queries a últimos 90 días por defecto

### 4. Privacidad
- Nunca mostrar IPs individuales en el dashboard
- Solo agregaciones (totales por país)
- Cumplir GDPR: No guardar IPs >30 días (campo `ip_address`)
- Permitir opt-out con cookie `do-not-track`

### 5. Testing
- Usar `utm_source=test` para tus pruebas
- Filtrar visitas de admin del dashboard (tu IP)
- Verificar webhooks de Stripe en modo test

---

## 🎉 CONCLUSIÓN

Este sistema te dará **visibilidad completa** del journey de tus usuarios:

```
Anuncio (Facebook) 
  → Visita (tu web) 
    → Navegación (páginas) 
      → Compra (Stripe) 
        → Analytics (este dashboard)
```

Por primera vez, podrás responder con **datos reales**:
- ¿Funcionan mis anuncios?
- ¿Qué países son más rentables?
- ¿Cuánto cuesta conseguir un cliente?
- ¿Vale la pena seguir invirtiendo en publicidad?

**Valor de Negocio:**
- Optimizar presupuesto de ads
- Identificar países con mejor ROI
- Detectar problemas de conversión
- Justificar gastos de marketing con datos

**Ventaja Competitiva:**
Mientras otros negocios solo ven datos de Facebook/Google (reach, impressions), tú verás la verdad completa de qué pasa en TU web.

---

**🚀 ¡Listo para implementar!**

Este documento es la guía completa. Cada fase tiene objetivos claros y resultados esperados. Puedes entregárselo a otro desarrollador y podrá implementarlo siguiendo este plan.

**Tiempo total estimado:** 12-15 horas de desarrollo
**Complejidad:** Media-Alta
**Valor de negocio:** MUY ALTO 💰
