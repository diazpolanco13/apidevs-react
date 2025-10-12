# 🚀 Guía Rápida: Sanity CMS en APIDevs

## 📋 Resumen Ejecutivo

APIDevs usa **Sanity CMS** como headless CMS para gestionar:
1. **Catálogo de Indicadores** - Productos VIP de trading
2. **Sistema de Documentación** - Docs tipo Mintlify/LuxAlgo (NUEVO ✨)

El sistema combina datos técnicos de Supabase con contenido editorial de Sanity.

### 🤖 MCP Tools Disponibles

**IMPORTANTE:** Tienes acceso a 2 MCPs (Model Context Protocol) que te permiten interactuar directamente con los servicios:

1. **MCP Sanity** - 26 herramientas disponibles:
   - `mcp_sanity_create_document` - Crear indicadores
   - `mcp_sanity_update_document` - Actualizar contenido con AI
   - `mcp_sanity_query_documents` - Queries GROQ
   - `mcp_sanity_get_schema` - Ver schema completo
   - `mcp_sanity_translate_document` - Traducir contenido
   - `mcp_sanity_transform_image` - Optimizar imágenes
   - Y más...

2. **MCP Supabase** - Múltiples herramientas:
   - `mcp_supabase_execute_sql` - Queries SQL
   - `mcp_supabase_list_tables` - Ver estructura DB
   - Y más...

**Usa estos MCPs cuando necesites:**
- Crear/editar indicadores en Sanity
- Consultar datos técnicos de Supabase
- Ver schemas y estructura de datos

---

## 🏗️ Arquitectura Actual

### 🎯 Concepto Clave del Sistema

**Este NO es un simple catálogo de productos estático.** Es un **catálogo inteligente** que se adapta dinámicamente según el plan de suscripción del usuario:

#### 3 Planes de Usuario:
1. **FREE** (usuarios sin pago):
   - Acceso solo a indicadores `access_tier: 'free'`
   - Sidebar invita a upgrade en indicadores premium
   - Puede ver botón TradingView en todos

2. **PRO** (suscripción mensual/anual):
   - Acceso a TODOS los indicadores (free + premium)
   - Sidebar con shimmer amarillo-verde (#C9D92E)
   - Mensaje "¡Acceso Completo!"
   - Botón directo "Abrir en TradingView"

3. **LIFETIME** (compra única):
   - Acceso PERMANENTE a todo
   - Sidebar con shimmer morado (#9333EA)
   - Mensaje VIP "¡Miembro VIP de por vida!"
   - Diseño exclusivo morado

**Lógica de Detección del Plan:**
```typescript
// Orden de prioridad:
1. hasLifetimeAccess (consulta tabla purchases)
2. subscription.metadata.plan_type === 'lifetime'
3. product.name.includes('lifetime')
4. subscription.status === 'active' → PRO
5. default → FREE
```

### Flujo de Datos

```
Sanity CMS (Content Studio)
        ↓
   GROQ Queries
        ↓
Next.js Server Components (ISR)
        ↓
Combina con Supabase (user, subscription, purchases)
        ↓
Client Components (UI adaptativa según plan)
```

**Estrategia de Rendering:**
- **SSG + ISR**: Páginas pre-renderizadas, revalidación cada 1 hora
- **Server Components**: Fetch de datos en servidor (Sanity + Supabase)
- **Client Components**: UI dinámica según plan del usuario

---

## 📁 Estructura de Archivos Clave

```
apidevs-react/
├── app/
│   ├── indicadores/
│   │   ├── page.tsx                    # Catálogo (ISR)
│   │   └── [slug]/page.tsx             # Detalle (SSG + ISR)
│   ├── docs/                           # ✨ NUEVO: Sistema Documentación
│   │   ├── layout.tsx                  # Layout con sidebar + header
│   │   ├── page.tsx                    # Landing docs (Mintlify style)
│   │   └── [slug]/page.tsx             # Página doc individual
│   └── studio/[[...tool]]/page.tsx     # Sanity Studio
│
├── components/
│   ├── ui/
│   │   ├── IndicatorsHub/
│   │   │   ├── IndicatorsHub.tsx       # Grid + filtros + búsqueda
│   │   │   └── IndicatorCard.tsx       # Card individual
│   │   ├── IndicatorDetail/
│   │   │   └── IndicatorDetailView.tsx # Vista detalle (2 columnas)
│   │   ├── ImageGallery.tsx            # Galería con zoom
│   │   └── TradingViewEmbed.tsx        # Widget TradingView
│   └── docs/                           # ✨ NUEVO: Componentes docs
│       ├── DocsHeader.tsx              # Header con logo + nav
│       ├── DocsSidebar.tsx             # Sidebar categorías colapsables
│       ├── DocsSearch.tsx              # Modal búsqueda
│       ├── TableOfContents.tsx         # TOC sticky
│       └── PortableTextComponents.tsx  # Renderizado contenido rico
│
├── sanity/
│   ├── schemas/
│   │   ├── indicator.ts                # Schema indicadores (18 campos)
│   │   ├── documentation.ts            # ✨ NUEVO: Schema docs
│   │   └── docCategory.ts              # ✨ NUEVO: Categorías docs
│   └── lib/
│       ├── client.ts                   # Cliente Sanity
│       ├── queries.ts                  # Queries indicadores (6)
│       ├── doc-queries.ts              # ✨ NUEVO: Queries docs (7)
│       └── image.ts                    # Optimización imágenes
│
├── sanity.config.ts                    # Config Studio + theme APIDevs
└── middleware.ts                       # Skip Supabase auth en /docs
```

---

## 📚 Sistema de Documentación (NUEVO)

### 🎨 Diseño Mintlify/LuxAlgo Clone

El sistema de documentación replica el diseño profesional de Mintlify y LuxAlgo, adaptado con los colores de APIDevs.

**URL:** `http://localhost:3000/docs`

### 🏗️ Arquitectura Docs

**2 Schemas Principales:**

1. **`docCategory`** - Organización del sidebar
   - `title` (string) - Nombre categoría
   - `slug` (slug) - URL categoría
   - `icon` (string) - Emoji (🚀, 📚, ⚙️)
   - `order` (number) - Orden sidebar
   - `description` (text) - Descripción corta
   - `isCollapsible` (boolean) - Puede colapsar
   - `defaultExpanded` (boolean) - Expandida default

2. **`documentation`** - Páginas de docs
   - `title` (string) - Título página
   - `slug` (slug) - URL amigable
   - `category` (reference) - Ref a docCategory
   - `icon` (string) - Emoji título
   - `description` (text) - Meta descripción
   - `content` (array) - **Portable Text Rico:**
     - Blocks (h1-h4, párrafos, listas)
     - Imágenes con caption
     - **`codeBlock`** - Sintaxis highlight + copy button
     - **`callout`** - Cajas info/warning/error/success/note
     - **`cardGroup`** - Cards en grid
     - **`tabs`** - Pestañas contenido
     - **`accordion`** - Secciones colapsables
     - **`videoEmbed`** - YouTube/Vimeo
   - `nextPage` / `previousPage` (reference) - Navegación
   - `relatedPages` (array[reference]) - Artículos relacionados
   - `seo` - Meta tags

### 🎯 Componentes Clave Docs

#### 1. **DocsLayout** (`app/docs/layout.tsx`)
- **Server Component** que fetch sidebar data
- Renderiza estructura base: header + sidebar + main
- Background con partículas espaciales reutilizadas
- CSS personalizado oculta Navbar principal

```typescript
// Estructura:
<div className="docs-layout">
  <BackgroundEffects variant="minimal" />
  <DocsHeader />
  <DocsSidebar sidebarData={categories} />
  <main className="ml-64 pt-16">{children}</main>
</div>
```

#### 2. **DocsHeader** (`components/docs/DocsHeader.tsx`)
- Logo APIDevs horizontal blanco
- Navegación: Documentation, Guides, API Reference, Changelog
- Búsqueda con shortcut Ctrl+K
- Botón "Get started" (verde APIDevs)
- Fixed top con backdrop blur

#### 3. **DocsSidebar** (`components/docs/DocsSidebar.tsx`)
- **Client Component** con `usePathname` para highlighting
- Categorías colapsables con iconos emoji
- Input de búsqueda (Ctrl+K)
- Link activo con color `#C9D92E`
- Scrollbar personalizado
- Footer "Back to Home"
- Fixed left con backdrop blur

#### 4. **PortableTextComponents** (`components/docs/PortableTextComponents.tsx`)
**Renderizado personalizado de cada tipo:**

```typescript
// Headings con anchor links
h2: <h2 id={id}>
  <a href={`#${id}`}>#</a>
  <span className="w-1 h-8 bg-apidevs-primary" />
  {children}
</h2>

// Code blocks con copy button
codeBlock: <div className="group relative">
  {filename && <div>{filename}</div>}
  <pre><code>{code}</code></pre>
  <button onClick={copy}>Copy</button>
</div>

// Callouts coloreados
callout: <div className={`${typeStyles[type].bg} ${typeStyles[type].border}`}>
  <div className={typeStyles[type].iconBg}>{icon}</div>
  {title && <div>{title}</div>}
  <div>{content}</div>
</div>

// Imágenes optimizadas
image: <figure>
  <Image src={urlForImage(value)} alt={alt} />
  {caption && <figcaption>{caption}</figcaption>}
</figure>
```

**Callout Types:**
- 💡 **Info** - Azul (`bg-blue-500/10`, `border-blue-500/30`)
- ⚠️ **Warning** - Amarillo (`bg-yellow-500/10`)
- 🚨 **Error** - Rojo (`bg-red-500/10`)
- ✅ **Success** - Verde (`bg-green-500/10`)
- 📝 **Note** - Morado (`bg-purple-500/10`)

#### 5. **TableOfContents** (`components/docs/TableOfContents.tsx`)
- Fixed derecha en páginas individuales
- Auto-highlight del heading visible
- Smooth scroll al click
- Extrae headings h1-h4
- Indent según nivel

#### 6. **DocsSearch** (`components/docs/DocsSearch.tsx`)
- Modal full-screen
- Implementar search con GROQ query
- Keyboard navigation (↑↓)
- Preview snippet
- Categoría badge

### 📊 Queries GROQ Docs

**Archivo:** `sanity/lib/doc-queries.ts`

```typescript
// 1. Sidebar completo
SIDEBAR_DOCS_QUERY
// Retorna: { categories: Array<{pages: Doc[]}> }

// 2. Página por slug
DOC_BY_SLUG_QUERY
// Params: { slug: string }
// Retorna: DocPage con content completo

// 3. Búsqueda
SEARCH_DOCS_QUERY
// Params: { searchTerm: string }
// Retorna: Array<SearchResult>

// 4. Static params
DOC_SLUGS_QUERY
// Retorna: string[]

// 5. Por categoría
DOCS_BY_CATEGORY_QUERY
// Params: { categorySlug: string }
```

### 🎨 Diseño Visual Docs

**Colores:**
- Background: `#0a0a0a` (apidevs-dark)
- Primary: `#C9D92E` (links, borders, highlights)
- Cards: `bg-gray-900/30` con hover `bg-gray-900/50`
- Borders: `border-gray-800/50`
- Text: `text-white` / `text-gray-400`

**Layout:**
- Header: 64px fixed top
- Sidebar: 256px fixed left
- Content: max-w-4xl centered
- TOC: 256px fixed right (desktop)

**Efectos:**
- Backdrop blur en header/sidebar
- Hover states en links
- Smooth transitions
- Partículas espaciales background

### ⚠️ Issues Conocidos Docs

1. **Renderizado Primera Entrada** ❌
   - El documento existe en Sanity
   - Página carga (200 OK)
   - Sidebar muestra entrada
   - Contenido NO se visualiza en `[slug]/page.tsx`
   - **POSIBLE CAUSA:** Error en query o rendering de Portable Text

2. **Middleware Optimización** ✅
   - Skip `updateSession` de Supabase en `/docs`
   - Evita rate limit errors
   - Mejora performance

3. **CSS Navbar Hide** ✅
   - Usa selector `.docs-layout` + `:has()`
   - Oculta solo Navbar principal
   - Mantiene visible contenido docs

### 🔧 Middleware Docs

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // NO ejecutar updateSession para /docs (evita rate limit)
  if (request.nextUrl.pathname.startsWith('/docs')) {
    return;
  }
  return await updateSession(request);
}
```

### 🎯 CSS Custom Docs

```css
/* styles/main.css */

/* Ocultar SOLO el Navbar cuando estamos en /docs */
body:has(.docs-layout) > nav.Navbar-module__uj6e0q__root {
  display: none !important;
}
```

### 📝 Contenido Ejemplo Creado

**Categoría:** "Comenzar" (🚀)
- Order: 0
- Slug: `comenzar`
- DefaultExpanded: true

**Documento:** "¿Qué es TradingView?" (📊)
- Slug: `que-es-tradingview`
- URL: `/docs/que-es-tradingview`
- Contenido:
  - Introducción con bold keywords
  - Callouts (Info, Note)
  - Secciones con emojis (📊, 🛠️, 📚)
  - Listas numeradas con bold
  - SEO optimizado

### 🚀 Próximos Pasos Docs

- [ ] **FIX:** Resolver issue renderizado primera entrada
- [ ] Implementar búsqueda funcional (modal + query)
- [ ] Crear más categorías: "Guides", "API Reference", "Tutorials"
- [ ] Agregar más documentos con contenido rico
- [ ] Implementar navegación previous/next
- [ ] Dark mode toggle (opcional)
- [ ] Versioning docs (releases en Sanity)

---

## 🗂️ Schema de Indicadores

**Archivo:** `sanity/schemas/indicator.ts`

### Campos Principales (18 total):

**Identificación:**
- `pineId` (string, required) - ID TradingView (formato: `PUB;xxxxx`)
- `slug` (slug, required) - URL amigable
- `title` (string, required) - Título

**URLs:**
- `tradingviewUrl` (url, required) - URL pública del script
- `embedUrl` (url, optional) - Widget interactivo
- `videoUrl` (url, optional) - Video YouTube

**Contenido:**
- `shortDescription` (text, required, max 200) - Para catálogo
- `content` (array[block, image]) - Portable Text con imágenes embebidas
- `howToUse` (text) - Instrucciones
- `features` (array[string]) - Lista características
- `benefits` (array[{title, description}]) - Beneficios detallados
- `faq` (array[{question, answer}]) - Preguntas frecuentes

**Imágenes:**
- `mainImage` (image, hotspot) - Principal
- `gallery` (array[image]) - Capturas adicionales

**Categorización:**
- `category` (string) - `indicador` | `scanner` | `tool`
- `access_tier` (string) - `free` | `premium`
- `status` (string) - `activo` | `inactivo` | `desarrollo`
- `tags` (array[string]) - Etiquetas

**SEO:**
- `seo.metaTitle` (string, max 60)
- `seo.metaDescription` (text, max 160)
- `seo.keywords` (array[string])

**Metadata:**
- `publishedAt` (datetime)

---

## 🔍 Queries GROQ Disponibles

**Archivo:** `sanity/lib/queries.ts`

### 1. Lista de Indicadores (Catálogo)
```typescript
INDICATORS_QUERY
// Retorna: IndicatorListItem[]
// Campos: _id, pineId, slug, title, shortDescription, mainImage, 
//         features, tags, access_tier, category, status, publishedAt
```

### 2. Indicador por Slug (Detalle)
```typescript
INDICATOR_BY_SLUG_QUERY
// Parámetro: { slug: string }
// Retorna: IndicatorDetail (todos los campos completos)
```

### 3. Filtros
```typescript
INDICATORS_BY_CATEGORY_QUERY  // { category: string }
INDICATORS_BY_TIER_QUERY      // { tier: 'free' | 'premium' }
SEARCH_INDICATORS_QUERY       // { searchTerm: string }
```

### 4. Static Generation
```typescript
INDICATOR_SLUGS_QUERY
// Retorna: string[] (todos los slugs)
```

---

## 🎨 Componentes UI Actuales

### 1. **IndicatorsHub** (Client Component)
**Props:** `{ initialIndicators: IndicatorListItem[] }`

**Características:**
- Grid responsive: 1→2→3→4 columnas
- Filtros por tier: All | Free | Premium
- Subfiltros por categoría: Indicador | Scanner | Tools
- Búsqueda en tiempo real (title, shortDescription, tags)
- Estado vacío con mensaje
- Animaciones: `fade-in-up`

**Colores APIDevs:**
- Primary: `#C9D92E` (verde-amarillo)
- Purple: `#9333EA`
- Free badge: `bg-blue-600`
- Premium badge: `bg-purple-600`

### 2. **IndicatorCard** (Client Component)
**Props:** `{ indicator: IndicatorListItem }`

**Elementos:**
- Imagen optimizada (placeholder si no hay)
- Badge tier (🎁 GRATIS | 💎 PREMIUM)
- Badge categoría (📊)
- Título + descripción corta
- Primera feature preview
- Fecha publicación
- Botón "Ver detalles" con hover effect

### 3. **IndicatorDetailView** (Client Component)
**Props:** `{ indicator: IndicatorDetail, user, subscription, hasLifetimeAccess }`

**⚠️ COMPONENTE CRÍTICO - Maneja lógica de planes**

**Layout 2 Columnas:**

**Columna Principal (2/3):**
- Breadcrumb navigation
- Header con badges
- TradingView Widget (si `embedUrl` existe)
- Portable Text (contenido rico)
- Características (grid 2 columnas)
- Beneficios (cards con emoji)
- Cómo Usar (card gris)
- Galería (grid 2 columnas con modal)
- FAQ (accordion con details/summary)

**Sidebar Sticky (1/3) - ADAPTATIVO:**

Este sidebar **cambia completamente** según el plan del usuario. Es la diferenciación clave del sistema.

#### 🎨 4 Estados del Sidebar:

**1. Usuario GUEST (no autenticado):**
```typescript
// Background: gradient gray
// CTA: "Iniciar Sesión" (verde) + "Ver Planes" (gris)
// Mensaje: "Desbloquea este indicador"
// Bullets: Sin tarjeta, Acceso inmediato, +25 indicadores
```

**2. Usuario FREE viendo indicador PREMIUM:**
```typescript
// Background: gradient gray con border-2 gray-600
// Efecto: gradient shimmer apidevs-primary/10
// CTA: "🚀 Actualizar Ahora" (verde) + "Ver en TradingView" (gris)
// Mensaje: "Actualiza a PRO - Desbloquea este indicador..."
// Bullets: Todos premium, Alertas real-time, Soporte prioritario
```

**3. Usuario FREE viendo indicador FREE:**
```typescript
// Background: gradient gray con border gray-600
// CTA: "Ver en TradingView" (verde)
// Mensaje: "✅ Ya tienes acceso"
```

**4. Usuario PRO (suscripción activa):**
```typescript
// Background: from-yellow-900/20 via-yellow-800/10 to-gray-900
// Border: border-2 border-apidevs-primary/30
// Shimmer: animate-shimmer (amarillo-verde)
// Icon: ⚡
// Badge: "Plan PRO Activo" (apidevs-primary)
// Título: "¡Acceso Completo!"
// CTA: "Abrir en TradingView" (apidevs-primary) + "Gestionar Suscripción"
// Mensaje: "Disfruta de todos los indicadores premium sin límites"
```

**5. Usuario LIFETIME (compra única):**
```typescript
// Background: from-purple-900/30 via-purple-800/20 to-gray-900
// Border: border-2 border-purple-500/40
// Shimmer: animate-shimmer (morado)
// Icon: 👑
// Badge: "Lifetime Access" (purple-400)
// Título: "¡Miembro VIP de por vida!"
// CTA: "Abrir en TradingView" (purple-600) + VIP message card
// Mensaje: "Acceso ilimitado y permanente a toda la plataforma"
// Extra: Card morado con "💎 Gracias por ser parte de nuestra comunidad VIP"
```

**Elementos Adicionales Sidebar:**
- Botón YouTube (si `videoUrl` existe)
- Features rápidas (primeras 5)
- Tags

**Código de Detección en el Componente:**
```typescript
const getUserPlan = () => {
  if (!user) return 'guest';
  if (hasLifetimeAccess) return 'lifetime'; // PRIORIDAD 1
  const metadata = subscription?.metadata as { plan_type?: string } | null;
  if (metadata?.plan_type === 'lifetime') return 'lifetime';
  const productName = ((subscription as any)?.prices?.products as any)?.name?.toLowerCase() || '';
  if (productName.includes('lifetime')) return 'lifetime';
  if (subscription?.status === 'active' || subscription?.status === 'trialing') return 'pro';
  return 'free';
};
```

### 4. **ImageGallery** (Client Component)
**Props:** `{ images: GalleryImage[] }`

**Características:**
- Grid 2→3 columnas
- Hover overlay con "Click para ampliar"
- Lightbox con controles:
  - Zoom 1x→3x (botones +/-, rueda ratón, teclado)
  - Arrastrar cuando zoom activo
  - Navegación ←/→
  - ESC cerrar
- Optimización: `priority` primeras 3 imágenes

### 5. **TradingViewEmbed** (Client Component)
**Props:** `{ embedUrl: string, title: string, height?: number }`

**Iframe responsivo** para widgets TradingView

---

## 🎯 Portable Text Rendering

**Componentes personalizados:**

```typescript
// Headings con bullet verde
h2: <h2 className="..."><span className="w-1 h-8 bg-apidevs-primary" /></h2>

// Imágenes embebidas con caption
image: <Image /> + <p className="text-gray-400">{caption}</p>

// Blockquotes con border verde
blockquote: <blockquote className="border-l-4 border-apidevs-primary" />

// Code con fondo gris
code: <code className="bg-gray-800 text-apidevs-primary" />

// Links externos
link: <a target="_blank" rel="noopener noreferrer" />
```

---

## 🚀 ISR Configuration

### Catálogo (`app/indicadores/page.tsx`)
```typescript
export const revalidate = 3600; // 1 hora

await client.fetch(INDICATORS_QUERY, {}, {
  next: {
    revalidate: 3600,
    tags: ['indicators'],
  },
});
```

### Detalle (`app/indicadores/[slug]/page.tsx`)
```typescript
export async function generateStaticParams() {
  const slugs = await client.fetch(INDICATOR_SLUGS_QUERY);
  return slugs.map((slug) => ({ slug }));
}

await client.fetch(INDICATOR_BY_SLUG_QUERY, { slug }, {
  next: {
    revalidate: 3600,
    tags: [`indicator:${slug}`],
  },
});
```

---

## 🔧 Variables de Entorno

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=mpxhkyzk
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=skk...
```

---

## 📊 Estado Actual

**Indicadores Migrados:** 6
- RSI PRO+ OVERLAY [APIDEVS] - Premium
- RSI PRO+ Stochastic [APIDEVs] - Premium
- RSI SCANNER [APIDEVs] - Premium
- ADX DEF [APIDEVS] - Free
- POSITION SIZE [APIDEVs] - Premium
- Watermark [APIDEVs] - Free

**Features Implementadas:**
- ✅ Catálogo con filtros y búsqueda
- ✅ Páginas de detalle dinámicas
- ✅ Sidebar adaptativo por plan
- ✅ Galería con zoom
- ✅ TradingView widgets
- ✅ SEO dinámico
- ✅ ISR 1 hora

---

## 🎨 Paleta de Colores APIDevs

```css
/* Verde-Amarillo Principal */
--apidevs-primary: #C9D92E

/* Morado */
--purple: #9333EA

/* Badges */
--free-badge: #2563EB (blue-600)
--premium-badge: #9333EA (purple-600)

/* Backgrounds */
--bg-dark: #000000
--bg-card: #1F2937 (gray-800)

/* Text */
--text-primary: #FFFFFF
--text-secondary: #9CA3AF (gray-400)
```

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev              # Next.js + Sanity Studio en /studio

# Sanity
npx sanity@latest schema deploy        # Deploy schema
npx sanity@latest typegen generate     # Generar types
npx sanity@latest dataset export       # Backup

# Migración
npm run sanity:migrate   # Migrar desde Supabase
```

---

## 🔗 URLs Importantes

- **Studio:** http://localhost:3000/studio
- **Catálogo:** http://localhost:3000/indicadores
- **Detalle:** http://localhost:3000/indicadores/[slug]

---

## 📝 Mejoras Potenciales

### Performance
- [ ] Implementar semantic search con embeddings
- [ ] Related indicators (recomendaciones)
- [ ] Infinite scroll en catálogo
- [ ] Skeleton loaders

### UX
- [ ] Filtros avanzados (múltiples categorías)
- [ ] Ordenamiento (popularidad, fecha, alfabético)
- [ ] Comparador de indicadores
- [ ] Preview mode para editores

### Contenido
- [ ] Completar contenido rico de todos los indicadores
- [ ] Agregar más screenshots a galerías
- [ ] Videos tutoriales para cada indicador
- [ ] Testimonios de usuarios

### SEO
- [ ] Sitemap dinámico
- [ ] JSON-LD structured data
- [ ] Breadcrumbs schema
- [ ] Canonical URLs

### Analytics
- [ ] Track views por indicador
- [ ] Track conversiones (view → purchase)
- [ ] A/B testing de CTAs
- [ ] Heatmaps

---

## 🚨 Notas Importantes

1. **Vinculación Datos:** El `pineId` en Sanity DEBE coincidir exactamente con `pine_id` en Supabase
2. **Revalidación:** Cambios en Sanity tardan máx 1 hora en reflejarse (ISR)
3. **Imágenes:** Dominio `cdn.sanity.io` configurado en `next.config.js`
4. **Plan Detection:** Sidebar usa lógica: `hasLifetimeAccess` → `metadata.plan_type` → `product.name` → `subscription.status`
5. **Tablas Supabase Clave:**
   - `subscriptions`: Estado de suscripciones activas
   - `purchases`: Historial de compras (detecta Lifetime)
   - `indicators`: Datos técnicos (pine_id, access_tier, category)

---

## 🔗 Recursos de Integración

### Supabase Tables Schema
```sql
-- Tabla indicators (datos técnicos)
indicators {
  id: uuid
  pine_id: text (UNIQUE) -- Vincula con Sanity
  name: text
  access_tier: text -- 'free' | 'premium'
  category: text -- 'indicador' | 'escaner' | 'tools'
  status: text -- 'activo' | 'inactivo'
  total_users: integer
  active_users: integer
}

-- Tabla subscriptions (planes activos)
subscriptions {
  id: text
  user_id: uuid
  status: text -- 'active' | 'trialing' | 'canceled'
  metadata: jsonb -- { plan_type: 'lifetime' }
  price_id: text
  created: timestamptz
}

-- Tabla purchases (historial compras)
purchases {
  id: uuid
  user_id: uuid
  product_name: text -- Busca 'lifetime'
  amount: bigint
  status: text -- 'succeeded'
  created_at: timestamptz
}
```

### Flujo de Datos Completo

```
┌─────────────────────────────────────────────────┐
│         SANITY CMS (Contenido)                  │
│  - Títulos, descripciones                       │
│  - Imágenes, galería                            │
│  - Contenido rico (Portable Text)               │
│  - FAQs, features, benefits                     │
│  - SEO metadata                                 │
└─────────────┬───────────────────────────────────┘
              │
              ↓ GROQ Queries
              │
┌─────────────▼───────────────────────────────────┐
│       NEXT.JS SERVER COMPONENT                  │
│  app/indicadores/[slug]/page.tsx                │
│                                                  │
│  1. Fetch indicator from Sanity                 │
│  2. Get user from Supabase Auth                 │
│  3. Get subscription from Supabase              │
│  4. Check hasLifetimeAccess (purchases)         │
└─────────────┬───────────────────────────────────┘
              │
              ↓ Props
              │
┌─────────────▼───────────────────────────────────┐
│    CLIENT COMPONENT (UI Adaptativa)             │
│  IndicatorDetailView.tsx                        │
│                                                  │
│  getUserPlan() → 'guest'|'free'|'pro'|'lifetime'│
│         ↓                                        │
│  Render Sidebar Adaptativo                      │
│  - Colores específicos                          │
│  - CTAs personalizados                          │
│  - Mensajes dinámicos                           │
└──────────────────────────────────────────────────┘
```

---

## 💡 Tips para Mejorar el Catálogo

### Performance
- Usa `mcp_sanity_query_documents` para analizar contenido actual
- Optimiza queries GROQ para incluir solo campos necesarios
- Implementa lazy loading en galerías grandes

### UX
- A/B test diferentes mensajes de CTA según plan
- Analiza conversión de FREE → PRO en indicadores específicos
- Mejora búsqueda con algoritmos de relevancia

### Contenido
- Usa `mcp_sanity_update_document` con AI para mejorar descripciones
- Genera contenido rico automáticamente con AI
- Traduce indicadores con `mcp_sanity_translate_document`

### Consultas Útiles con MCPs
```typescript
// Ver todos los indicadores en Sanity
mcp_sanity_query_documents({
  query: '*[_type == "indicator"]',
  resource: { projectId: 'mpxhkyzk', dataset: 'production' }
})

// Ver indicadores sin galería
mcp_sanity_query_documents({
  query: '*[_type == "indicator" && !defined(gallery)]',
  resource: { projectId: 'mpxhkyzk', dataset: 'production' }
})

// Ver datos técnicos de Supabase
mcp_supabase_execute_sql({
  query: 'SELECT pine_id, access_tier, active_users FROM indicators ORDER BY active_users DESC'
})
```

---

**Última actualización:** 12 octubre 2025  
**Commit:** `b50359b` - Sistema de documentación implementado  
**Branch:** `feature/docs-mintlify-clone`

---

**🎯 Objetivo:** Esta guía te permite entender y trabajar con:
1. El catálogo de indicadores VIP
2. El sistema de documentación tipo Mintlify (NUEVO)

Usando los MCPs de Sanity y Supabase disponibles para crear, editar y optimizar contenido.

