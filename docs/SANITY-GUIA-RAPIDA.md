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
- **Layout estilo LuxAlgo:** Todo contenido en contenedor centrado

```typescript
// Estructura:
<div className="docs-layout min-h-screen relative">
  <BackgroundEffects variant="minimal" />
  <DocsHeader />
  
  {/* Contenedor centrado 1800px que engloba todo */}
  <div className="max-w-[1800px] mx-auto pt-16 relative">
    <div className="flex">
      <DocsSidebar sidebarData={categories} /> {/* sticky */}
      <main className="flex-1 relative z-10 min-w-0">
        {children} {/* TableOfContents fixed dentro */}
      </main>
    </div>
  </div>
</div>
```

#### 2. **DocsHeader** (`components/docs/DocsHeader.tsx`)
- Logo APIDevs horizontal blanco
- ~~Navegación~~ (REMOVIDA para simplificar)
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
- **Sticky positioning:** `sticky top-16 h-[calc(100vh-4rem)]`
- Scroll independiente del contenido principal

#### 4. **PortableTextComponents** (`components/docs/PortableTextComponents.tsx`)
**⚠️ IMPORTANTE: Server Component (NO 'use client')**

**Renderizado estilo LuxAlgo con gradientes y efectos:**

```typescript
// Headings con gradientes y anchor links animados
h2: <h2 id={id} className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
  <a href={`#${id}`} className="opacity-0 group-hover:opacity-100">#</a>
  <span className="w-1 h-8 bg-gradient-to-b from-apidevs-primary to-purple-400" />
  {children}
</h2>

// Code blocks estilo macOS con copy button
codeBlock: <div className="group relative rounded-xl overflow-hidden">
  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800">
    <span className="w-3 h-3 rounded-full bg-red-500" />
    <span className="w-3 h-3 rounded-full bg-yellow-500" />
    <span className="w-3 h-3 rounded-full bg-green-500" />
    {filename && <span className="ml-2 text-gray-400">{filename}</span>}
  </div>
  <pre className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
    <code className="language-{language}">{code}</code>
  </pre>
  <div className="absolute top-14 right-4 opacity-0 group-hover:opacity-100">
    Copy button (non-interactive, Server Component)
  </div>
</div>

// Callouts con gradientes y glow effects
callout: <div className={`${typeStyles[type].container} backdrop-blur-sm`}>
  <div className={`${typeStyles[type].iconBg} glow-effect`}>
    {icon}
  </div>
  {title && <h4 className="font-semibold text-white">{title}</h4>}
  <div className="text-gray-300">{content}</div>
</div>

// Imágenes con gradient borders y zoom hover
image: <figure className="group relative rounded-xl overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-r from-apidevs-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100" />
  <img src={urlForImage(value)} alt={alt} className="group-hover:scale-105 transition-transform" />
  {caption && <figcaption className="text-gray-400 text-center">{caption}</figcaption>}
</figure>

// Listas con checkmarks personalizados
bullet: <li className="flex items-start gap-3">
  <span className="text-apidevs-primary">✓</span>
  {children}
</li>
```

**Callout Types (6 tipos):**
- 💡 **Info** - Azul gradient con glow
- ⚠️ **Warning** - Amarillo gradient con glow
- 🚨 **Error** - Rojo gradient con glow
- ✅ **Success** - Verde gradient con glow
- 📝 **Note** - Gris gradient con glow
- 💡 **Tip** - Púrpura gradient con glow

#### 5. **TableOfContents** (`components/docs/TableOfContents.tsx`)
- **Fixed positioning con cálculo dinámico:**
  ```typescript
  style={{ right: 'calc((100vw - min(1800px, 100vw)) / 2)' }}
  ```
- Se alinea automáticamente con el contenedor de 1800px
- `fixed top-16 h-[calc(100vh-4rem)]` para quedarse fijo al scroll
- Auto-highlight del heading visible
- Smooth scroll al click
- Extrae headings h1-h4 con IDs únicos
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

**Layout (Estilo LuxAlgo):**
- Header: 64px fixed top
- Contenedor principal: max-w-[1800px] centrado con flex
- Sidebar: 256px sticky left con scroll independiente
- Content: flex-1 max-w-5xl con padding adaptativo
- TOC: 256px fixed right (desktop) con cálculo dinámico

**Efectos:**
- Backdrop blur en header/sidebar
- Hover states en links
- Smooth transitions
- Partículas espaciales background

### ✅ Issues Resueltos Docs

1. **Renderizado Primera Entrada** ✅ RESUELTO
   - **Problema:** Callouts no renderizaban, error `Unknown block type "callout"`
   - **Causa:** `PortableTextComponents.tsx` era Client Component (`'use client'`)
   - **Solución:** Convertido a Server Component, removido `'use client'`
   - **Extras:** Fallbacks para campos faltantes (`type`, `title`)

2. **Middleware Optimización** ✅
   - Skip `updateSession` de Supabase en `/docs`
   - Evita rate limit errors (429)
   - Mejora performance

3. **CSS Navbar Hide** ✅
   - Selector `.docs-layout` + `:has()` más robusto
   - Oculta Navbar principal Y Footer
   - Mantiene visible contenido docs

4. **Layout LuxAlgo Clone** ✅
   - Sidebar sticky con scroll independiente
   - TOC fixed al lado derecho con cálculo dinámico
   - Contenedor max-w-[1800px] centrado
   - Todos los componentes dentro del contenedor

### 🔧 Middleware Docs

```typescript
// middleware.ts
export const config = {
  matcher: [
    // Excluye /docs del middleware (evita rate limit)
    '/((?!_next|__nextjs|api/|docs|_static|_vercel|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2|ttf|eot|json)$).*)'
  ]
};
```

### 🎯 CSS Custom Docs

```css
/* styles/main.css */

/* Ocultar Navbar y Footer cuando estamos en /docs */
body:has(.docs-layout) > nav {
  display: none !important;
}
body:has(.docs-layout) > footer {
  display: none !important;
}
```

### 📝 Documentos Publicados

**Categoría:** "Comenzar" (🚀)
- Order: 0
- Slug: `comenzar`
- DefaultExpanded: true

**Documentos actuales:**

1. **"¿Qué es APIDevs?"** (🏢)
   - Slug: `que-es-apidevs`
   - URL: `/docs/que-es-apidevs`
   - Contenido:
     - Introducción a la empresa (negrita)
     - ¿Qué Ofrecemos? (lista numerada: Indicadores, Scanners, Tools)
     - ¿Por qué elegir APIDevs? (lista bullets: 3 diferenciadores)
     - ¿Realmente funcionan? (expectativas realistas)
     - Cómo operar correctamente (4 tips)
     - 3 Callouts (Info, Warning, Success)
     - SEO completo

2. **"Guía de Inicio en TradingView"** (📊)
   - Slug: `guia-inicio-tradingview`
   - URL: `/docs/guia-inicio-tradingview`
   - Contenido:
     - Introducción con bold keywords
     - Callouts (Info, Note)
     - Secciones con emojis (📊, 🛠️, 📚)
     - Listas numeradas con bold
     - SEO optimizado

### 🎯 Features Mintlify Implementadas vs Pendientes

#### ✅ **COMPLETAMENTE IMPLEMENTADAS:**
- Layout con sidebar colapsable
- Table of Contents (TOC) sticky con highlighting automático
- Búsqueda con Ctrl+K (modal + API + keyboard navigation)
- Responsive design móvil (sidebar overlay + FAB)
- Code blocks con syntax highlighting
- Callouts con 6 tipos (info, warning, error, success, note, tip)
- Portable Text rico (headings, listas, imágenes)
- Navegación breadcrumbs
- SEO optimizado (meta tags dinámicos)
- ISR con revalidación (60 segundos)
- **🌙☀️ Dark/Light Mode** (Context API + localStorage + toggle sidebar)
- **🌍 Multi-idioma (i18n)** - Estructura base con selector idioma

---

### 🌙☀️ **Sistema Dark/Light Mode (IMPLEMENTADO)**

#### Arquitectura Completa:

**1. ThemeProvider** (`components/docs/ThemeProvider.tsx`)
- Client Component con Context API
- Estado: `'light' | 'dark'`
- Persistencia: `localStorage.getItem('docs-theme')`
- Detección sistema: `window.matchMedia('(prefers-color-scheme: dark)')`
- Aplica: `document.documentElement.classList.add('dark')` + `data-theme` attribute

```typescript
// Hook de uso:
const { theme, toggleTheme, setTheme } = useTheme();

// Provider en layout:
<ThemeProvider>
  {/* Todo el contenido de docs */}
</ThemeProvider>
```

**2. Script FOUC Prevention** (`app/docs/[lang]/layout.tsx`)
```typescript
<Script
  id="theme-script"
  strategy="beforeInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        const theme = localStorage.getItem('docs-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = theme === 'dark' || (!theme && prefersDark);
        
        if (shouldBeDark) {
          document.documentElement.classList.add('dark');
        }
      })();
    `,
  }}
/>
```

**3. Toggle Button** (`components/docs/DocsSidebar.tsx`)
- Ubicación: Footer del sidebar
- Estilos Mintlify: fondo gris claro/oscuro con border
- Icono dinámico: 🌙 Moon (dark mode) / ☀️ Sun (light mode)
- Switch icon on hover (⇄)

**4. Sistema de Colores Dual:**

| Elemento | Light Mode | Dark Mode |
|----------|------------|-----------|
| **Background** | `bg-white` | `bg-apidevs-dark` |
| **Texto principal** | `text-gray-900` | `text-white` |
| **Texto secundario** | `text-gray-700` | `text-gray-300` |
| **Acentos/Links activos** | `text-apidevs-purple` (#8B5CF6) | `text-apidevs-primary` (#C9D92E) |
| **Bordes** | `border-gray-300` | `border-gray-800` |
| **Cards/Sidebar** | `bg-gray-100` | `bg-gray-900/50` |
| **Hover states** | `hover:bg-gray-200` | `hover:bg-gray-800/70` |
| **Search bar** | `bg-gray-200` | `bg-gray-900/50` |
| **TOC active** | `border-apidevs-purple` | `border-apidevs-primary` |

**5. Componentes Adaptados:**
- ✅ `DocsHeader.tsx` - Logo dinámico (negro/blanco) + search bar
- ✅ `DocsSidebar.tsx` - Backgrounds, borders, links activos
- ✅ `DocsSearch.tsx` - Modal, input, resultados, kbd shortcuts
- ✅ `TableOfContents.tsx` - Border, texto, links activos
- ✅ `PortableTextComponents.tsx` - Headings, listas, callouts, code blocks
- ✅ `SidebarLanguageSelector.tsx` - Dropdown estilizado

**⚠️ IMPORTANTE para implementar Blog:**
- El `ThemeProvider` está en el layout de `/docs`, NO es global
- Si el blog necesita dark/light mode, debe:
  1. Reutilizar el mismo `ThemeProvider` a nivel global en `app/layout.tsx`, O
  2. Crear su propio provider específico de blog

---

### 🌍 **Multi-idioma (i18n) - Estado Actual**

#### ✅ **Implementado:**

**1. Estructura de Rutas:**
```
/docs/[lang]/[slug]
```
- Soporta: `es` (español), `en` (inglés)
- Ejemplo: `/docs/es/que-es-apidevs`, `/docs/en/what-is-apidevs`

**2. Selector de Idioma** (`components/docs/SidebarLanguageSelector.tsx`)
- Client Component con estado local
- Ubicación: Footer del sidebar
- Estilos: Dropdown estilo Mintlify con flags y checkmark
- Funcionalidad: Cambia ruta preservando el slug
- Transiciones: Loading state durante cambio

**3. Schema Documentation:**
```typescript
{
  name: 'documentation',
  fields: [
    {
      name: 'language',
      type: 'string',
      options: {
        list: [
          { title: '🇪🇸 Español', value: 'es' },
          { title: '🇺🇸 English', value: 'en' }
        ]
      }
    },
    // ... otros campos
  ]
}
```

**4. Mapeo de Documentos:**
El layout hace query para mapear documentos entre idiomas:
```typescript
const docsMap = sidebarData.reduce((acc, category) => {
  category.pages.forEach(page => {
    if (page.slug && page.language) {
      if (!acc[page.slug]) acc[page.slug] = {};
      acc[page.slug][page.language] = page._id;
    }
  });
  return acc;
}, {});
```

#### 🚧 **Pendiente (para otra IA implementar):**
- [ ] Traducir documentos existentes con `mcp_sanity_translate_document`
- [ ] Crear versiones EN de todos los docs ES
- [ ] Implementar detección automática de idioma del browser
- [ ] Agregar más idiomas (FR, PT, CN)

**⚠️ IMPORTANTE para implementar Blog:**
- Si el blog necesita multi-idioma, puede reutilizar el mismo sistema
- Schema `post` debería incluir campo `language: string`
- Rutas sugeridas: `/blog/[lang]/[slug]` o `/blog/[slug]` con filtro

---

### 🚧 **Pendientes (Mintlify tiene):**

**1. Versioning** 📚
- **Mintlify:** Dropdown en header para cambiar versión (v1.0, v2.0)
- **Implementación sugerida:**
  - Usar releases de Sanity para versiones
  - Campo `version: string` en documentos
  - Dropdown en header con versiones disponibles
  - Query GROQ filtrando por versión

---

### 🚀 Próximos Pasos (Docs)

- [x] **Multi-idioma** - ✅ Estructura base implementada
- [x] **Dark/Light Mode** - ✅ Sistema completo implementado
- [ ] **Contenido y Categorías** (PRIORIDAD MEDIA)
  - Crear categoría "Guías" (tutoriales paso a paso)
  - Crear categoría "API Reference" (documentación técnica)
  - Crear categoría "Indicadores" (docs por indicador)
  - Agregar 10+ documentos con contenido rico
  
- [ ] **UX Improvements** (PRIORIDAD BAJA)
  - Navegación previous/next entre páginas
  - Related pages en sidebar
  - Feedback widget ("¿Te ayudó esto?")
  - Copy link to section
  - Versioning con releases

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
/* Colores Principales de Marca */
--apidevs-primary: #C9D92E    /* Verde lima - Dark mode accent */
--apidevs-purple: #8B5CF6     /* Morado - Light mode accent (NUEVO) */
--purple-brand: #9333EA        /* Morado oscuro - Lifetime tier */

/* Sistema Dark/Light Mode */
/* LIGHT MODE: */
--light-bg: #FFFFFF
--light-text-primary: #111827 (gray-900)
--light-text-secondary: #374151 (gray-700)
--light-border: #D1D5DB (gray-300)
--light-accent: #8B5CF6 (apidevs-purple)

/* DARK MODE: */
--dark-bg: #0a0a0a (apidevs-dark)
--dark-text-primary: #FFFFFF
--dark-text-secondary: #9CA3AF (gray-400)
--dark-border: #1F2937 (gray-800)
--dark-accent: #C9D92E (apidevs-primary)

/* Badges */
--free-badge: #2563EB (blue-600)
--premium-badge: #9333EA (purple-600)

/* Backgrounds */
--bg-card: #1F2937 (gray-800)

/* Configuración Tailwind (tailwind.config.js) */
colors: {
  'apidevs': {
    'primary': '#C9D92E',      // Verde lima
    'primary-dark': '#A8B625',
    'purple': '#8B5CF6',       // NUEVO - Para light mode
    'purple-dark': '#7C3AED',
    'dark': '#0a0a0a',
    // ... otros
  }
}
```

**⚠️ IMPORTANTE para implementar Blog:**
- Si el blog necesita colores consistentes, debe usar las mismas clases dark:
- `text-apidevs-purple dark:text-apidevs-primary` para acentos
- `bg-white dark:bg-apidevs-dark` para backgrounds
- Mantener la coherencia visual con docs e indicadores

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

---

## 📝 **Sistema de Blog (✅ IMPLEMENTADO)**

**Fecha Implementación:** 13 octubre 2025  
**Estado:** 🟢 Funcional - Listo para contenido

### 🎯 **Objetivo del Blog:**
- Contenido SEO para atraer tráfico orgánico
- Tutoriales de trading y análisis técnico
- Noticias y actualizaciones de APIDevs
- Casos de éxito de usuarios

### 🏗️ **Arquitectura Implementada:**

#### **Rutas Implementadas:**
```
/blog                    # ✅ Listado de posts (grid + filtros)
/blog/[slug]            # ✅ Post individual con Portable Text
/blog/category/[slug]   # 🚧 Pendiente
/blog/author/[slug]     # 🚧 Pendiente
```

**URL del Blog:** `http://localhost:3000/blog`

#### **Schemas Sanity Implementados:**

**1. Schema `post` (Artículo del Blog)** ✅
**Archivo:** `sanity/schemas/post.ts`

```typescript
{
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    // Estado de publicación
    {
      name: 'status',
      type: 'string',
      options: {
        list: [
          { title: '📝 Borrador', value: 'draft' },
          { title: '✅ Publicado', value: 'published' },
          { title: '👀 En Revisión', value: 'review' },
          { title: '📅 Programado', value: 'scheduled' }
        ]
      },
      initialValue: 'draft',
      validation: Rule => Rule.required()
    },
    {
      name: 'visibility',
      type: 'string',
      options: {
        list: [
          { title: '🌍 Público', value: 'public' },
          { title: '🔒 Privado', value: 'private' },
          { title: '🔑 Solo Miembros', value: 'members-only' }
        ]
      },
      initialValue: 'public'
    },
    {
      name: 'title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: Rule => Rule.required()
    },
    {
      name: 'excerpt',
      type: 'text',
      rows: 3,
      description: 'Resumen corto para cards (150-200 chars)'
    },
    {
      name: 'mainImage',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alt text' }
      ]
    },
    {
      name: 'content',
      type: 'array',
      of: [
        { type: 'block' },          // Texto enriquecido (h2-h4, listas, etc)
        { type: 'image' },          // Imágenes con caption
        { type: 'codeBlock' },      // ✅ Code blocks con syntax highlighting
        { type: 'callout' },        // ✅ Cajas info/warning/error/success/note/tip
        { type: 'videoEmbed' },     // ✅ Videos YouTube/Vimeo
        { type: 'cardGroup' },      // ✨ NUEVO - Grupos de cards (1-4 cols)
        { type: 'tabs' },           // ✨ NUEVO - Pestañas interactivas (2-8 tabs)
        { type: 'accordion' }       // ✨ NUEVO - Secciones colapsables
      ]
    },
    {
      name: 'author',
      type: 'reference',
      to: [{ type: 'author' }]
    },
    {
      name: 'categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'blogCategory' }] }]
    },
    {
      name: 'tags',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'publishedAt',
      type: 'datetime',
      validation: Rule => Rule.required()
    },
    {
      name: 'readingTime',
      type: 'number',
      description: 'Tiempo estimado de lectura (minutos)'
    },
    {
      name: 'featured',
      type: 'boolean',
      description: 'Destacar en homepage'
    },
    {
      name: 'language',
      type: 'string',
      options: {
        list: [
          { title: '🇪🇸 Español', value: 'es' },
          { title: '🇺🇸 English', value: 'en' }
        ]
      },
      initialValue: 'es'
    },
    {
      name: 'seo',
      type: 'object',
      fields: [
        { name: 'metaTitle', type: 'string' },
        { name: 'metaDescription', type: 'text' },
        { name: 'keywords', type: 'array', of: [{ type: 'string' }] }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage'
    }
  }
}
```

**2. Schema `blogCategory` (Categorías del Blog)** ✅
**Archivo:** `sanity/schemas/blogCategory.ts`

```typescript
{
  name: 'blogCategory',
  title: 'Blog Category',
  type: 'document',
  fields: [
    {
      name: 'order',
      type: 'number',
      description: 'Orden de visualización en sidebar',
      validation: Rule => Rule.required()
    },
    {
      name: 'title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      type: 'slug',
      options: { source: 'title' }
    },
    {
      name: 'description',
      type: 'text'
    },
    {
      name: 'icon',
      type: 'string',
      description: 'Emoji para la categoría'
    },
    {
      name: 'color',
      type: 'string',
      options: {
        list: [
          { title: 'Verde APIDevs', value: 'primary' },
          { title: 'Morado', value: 'purple' },
          { title: 'Azul', value: 'blue' },
          { title: 'Rojo', value: 'red' }
        ]
      }
    }
  ]
}
```

**3. Schema `author` (Autores)** ✅
**Archivo:** `sanity/schemas/author.ts`

```typescript
{
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    {
      name: 'name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      type: 'slug',
      options: { source: 'name' }
    },
    {
      name: 'bio',
      type: 'text',
      rows: 3
    },
    {
      name: 'avatar',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'role',
      type: 'string',
      description: 'Ej: "Trader Profesional", "Analista Técnico"'
    },
    {
      name: 'social',
      type: 'object',
      fields: [
        { name: 'twitter', type: 'url' },
        { name: 'linkedin', type: 'url' },
        { name: 'website', type: 'url' }
      ]
    }
  ]
}
```

### 📂 **Estructura de Archivos Implementada:**

```
apidevs-react/
├── app/
│   └── blog/
│       ├── page.tsx                    # ✅ Listado posts (ISR 1h)
│       └── [slug]/page.tsx             # ✅ Post individual (SSG + ISR)
│
├── components/
│   └── blog/
│       ├── BlogHero.tsx                # ✅ Post destacado (Hero section)
│       ├── BlogCard.tsx                # ✅ Card post para grid
│       ├── BlogGrid.tsx                # ✅ Grid con filtros + búsqueda
│       ├── CategoryBadge.tsx           # ✅ Badge categorías con colores
│       ├── PostHeader.tsx              # ✅ Header post con metadata
│       ├── PostContent.tsx             # ✅ Portable Text enriquecido
│       ├── AuthorCard.tsx              # ✅ Card info autor
│       ├── RelatedPosts.tsx            # ✅ Posts relacionados
│       ├── ShareButtons.tsx            # ✅ Compartir en redes sociales
│       ├── TableOfContents.tsx         # ✅ TOC sticky (reutilizado de docs)
│       ├── CardGroup.tsx               # ✅ NUEVO - Grupos de cards
│       ├── Tabs.tsx                    # ✅ NUEVO - Pestañas interactivas
│       └── Accordion.tsx               # ✅ NUEVO - Secciones colapsables
│
├── sanity/
│   ├── schemas/
│   │   ├── post.ts                     # ✅ IMPLEMENTADO - Con componentes avanzados
│   │   ├── blogCategory.ts             # ✅ IMPLEMENTADO
│   │   └── author.ts                   # ✅ IMPLEMENTADO
│   ├── lib/
│   │   └── blog-queries.ts             # ✅ IMPLEMENTADO - 6 queries
│   └── deskStructure.ts                # ✅ Sección "📝 Blog" agregada
```

### 🎨 **Componentes Avanzados para Contenido (NUEVO):**

El blog incluye **8 componentes de Portable Text** para crear contenido enriquecido:

#### **1. 💻 Code Block** (de docs)
**Uso en Sanity Studio:** Insertar → Code Block

**Características:**
- Syntax highlighting para 20+ lenguajes
- Filename opcional (ej: `app/page.tsx`)
- Números de línea opcionales
- Header estilo macOS con dots (🔴🟡🟢)
- Copy button en hover

**Ejemplo:**
```typescript
// Título: "Ejemplo de código TypeScript"
// Filename: utils/helpers.ts
// Language: TypeScript
// showLineNumbers: true

export function calculateRisk(capital: number, riskPercent: number) {
  return (capital * riskPercent) / 100;
}
```

#### **2. 💡 Callout** (de docs)
**Uso en Sanity Studio:** Insertar → 💡 Callout

**6 Tipos disponibles:**
- 💡 **Info** - Información general (azul)
- ✅ **Success** - Éxito o confirmación (verde)
- ⚠️ **Warning** - Advertencia importante (amarillo)
- 🚨 **Error** - Error o peligro (rojo)
- 📝 **Note** - Nota adicional (gris)
- 💡 **Tip** - Consejo útil (morado)

**Campos:**
- `type` (required) - Tipo de callout
- `title` (optional) - Título del callout
- `content` (required) - Contenido texto

**Ejemplo:**
```markdown
⚠️ Warning
**Riesgo en Trading**
Nunca arriesgues más del 2% de tu capital en una sola operación.
```

#### **3. 🎥 Video Embed** (de docs)
**Uso en Sanity Studio:** Insertar → 🎥 Video

**Características:**
- Soporte YouTube, Vimeo, Loom
- 4 aspect ratios: 16:9, 4:3, 1:1, 9:16
- Título opcional
- Responsive iframe

**Campos:**
- `url` (required) - URL del video
- `title` (optional) - Título descriptivo
- `aspectRatio` (default: 16:9)

#### **4. 🃏 Card Group** ✨ NUEVO
**Uso en Sanity Studio:** Insertar → 🃏 Card Group

**Características:**
- Grid responsive 1-4 columnas
- Cards con icono emoji + título + descripción
- Links opcionales (internos o externos)
- Hover effects con scale

**Campos:**
- `title` (optional) - Título del grupo
- `cols` (required) - Número de columnas (1-4)
- `cards` (array, min 1, max 12):
  - `title` (required)
  - `icon` (optional) - Emoji
  - `description` (optional)
  - `href` (optional) - Link (URL o slug)

**Ejemplo de uso:**
```
📚 Recursos Recomendados
Columnas: 3

Card 1:
  Icon: 📊
  Title: "Análisis Técnico Básico"
  Description: "Aprende los fundamentos del análisis técnico"
  Link: /docs/analisis-tecnico

Card 2:
  Icon: 💰
  Title: "Gestión de Riesgo"
  Description: "Protege tu capital con estrategias probadas"
  Link: /blog/gestion-riesgo

Card 3:
  Icon: 🎯
  Title: "Trading Plan"
  Description: "Crea tu plan de trading personalizado"
  Link: /blog/trading-plan
```

**Renderizado:**
```tsx
<CardGroup value={{
  title: "Recursos Recomendados",
  cols: 3,
  cards: [...]
}} />
```

#### **5. 📑 Tabs** ✨ NUEVO
**Uso en Sanity Studio:** Insertar → 📑 Tabs

**Características:**
- Pestañas interactivas client-side
- 2-8 tabs por componente
- Transición suave entre tabs
- Border bottom animado
- Colores APIDevs

**Campos:**
- `items` (array, min 2, max 8):
  - `label` (required) - Texto de la pestaña
  - `content` (required) - Contenido (texto largo)

**Ejemplo de uso:**
```
Tabs: Comparación de Timeframes

Tab 1:
  Label: "1H"
  Content: "El timeframe de 1 hora es ideal para swing trading..."

Tab 2:
  Label: "4H"
  Content: "El timeframe de 4 horas proporciona señales más confiables..."

Tab 3:
  Label: "1D"
  Content: "El timeframe diario es perfecto para inversiones a largo plazo..."
```

**Renderizado:**
```tsx
<Tabs value={{
  items: [
    { label: "1H", content: "..." },
    { label: "4H", content: "..." },
    { label: "1D", content: "..." }
  ]
}} />
```

#### **6. 📋 Accordion** ✨ NUEVO
**Uso en Sanity Studio:** Insertar → 📋 Accordion

**Características:**
- Sección colapsable/expandible
- Animación smooth con transición
- Icono chevron rotatorio
- Estado "abierto por defecto" opcional
- Hover effects

**Campos:**
- `title` (required) - Título visible
- `content` (required) - Contenido oculto
- `defaultOpen` (optional, default: false)

**Ejemplo de uso:**
```
Accordion 1:
  Title: "¿Qué es el Stop Loss?"
  Content: "El Stop Loss es una orden que cierra automáticamente tu posición..."
  Default Open: true

Accordion 2:
  Title: "¿Cómo calcular el tamaño de posición?"
  Content: "Para calcular el tamaño de posición, necesitas..."
  Default Open: false
```

**Renderizado:**
```tsx
<Accordion value={{
  title: "¿Qué es el Stop Loss?",
  content: "El Stop Loss es...",
  defaultOpen: true
}} />
```

#### **7. 🖼️ Image** (nativo Sanity)
**Características:**
- Hotspot para crop inteligente
- Caption opcional
- Alt text requerido (SEO + Accesibilidad)
- Optimización automática por Sanity CDN

#### **8. 📝 Block** (texto enriquecido)
**Estilos disponibles:**
- Normal (párrafo)
- H2, H3, H4 (headings)
- Blockquote (citas)

**Listas:**
- Bullet (con checkmark verde ✓)
- Number (numerada)
- Checkbox

**Marks:**
- **Strong** (negrita)
- *Emphasis* (cursiva)
- `Code` (inline con bg gris)
- Underline
- Strike-through
- Highlight (bg amarillo)
- Links (con target blank)

---

### 🔍 **Queries GROQ Implementadas:**

**Archivo:** `sanity/lib/blog-queries.ts`

**6 Queries Principales:**

```typescript
// blog-queries.ts
import { defineQuery } from 'next-sanity'

// 1. Todos los posts publicados (con paginación)
export const BLOG_POSTS_QUERY = defineQuery(`
  *[_type == "post" && status == "published" && language == $language && visibility == "public"] 
  | order(publishedAt desc) [0...$limit] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    featured,
    author->{
      name,
      avatar,
      role
    },
    categories[]->{
      title,
      slug,
      color,
      icon
    }
  }
`)

// 2. Posts destacados (featured)
export const FEATURED_POSTS_QUERY = defineQuery(`
  *[_type == "post" && status == "published" && featured == true && language == $language] 
  | order(publishedAt desc) [0...3] {
    _id,
    "slug": slug.current,
    title,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    featured,
    author->,
    categories[]->
  }
`)

// 3. Categorías con conteo de posts
export const BLOG_CATEGORIES_QUERY = defineQuery(`
  *[_type == "blogCategory"] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    icon,
    color,
    order,
    "postCount": count(*[_type == "post" && references(^._id) && status == "published"])
  }
`)

// 4. Post por slug
export const POST_BY_SLUG_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug && status == "published"][0] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    content,
    publishedAt,
    readingTime,
    author->{
      name,
      bio,
      avatar,
      role,
      social
    },
    categories[]->{
      title,
      slug,
      color,
      icon
    },
    tags,
    seo
  }
`)

// 5. Posts relacionados
export const RELATED_POSTS_QUERY = defineQuery(`
  *[_type == "post" && _id != $currentId && count(categories[@._ref in $categoryIds]) > 0] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt
  }
`)

// 6. Static generation (todos los slugs)
export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && status == "published" && defined(slug.current)].slug.current
`)
```

**Filtros Implementados:**
- ✅ `status == "published"` - Solo posts publicados
- ✅ `visibility == "public"` - Solo posts públicos
- ✅ `language == $language` - Multi-idioma (ES/EN)
- ✅ `featured == true` - Posts destacados
- ✅ Referencias expandidas con `->` para autor y categorías

### 🎨 **Diseño Implementado:**

**Inspiración:** Blog de LuxAlgo adaptado con colores APIDevs

**Página Principal (`/blog`):**

**1. Hero Section (Post Destacado):**
- Layout 2:3 columnas (imagen:contenido)
- Imagen left con aspect ratio 16:10
- Badge "⭐ Destacado" con color APIDevs primary
- Categorías con badges personalizados
- Hover effect con scale en imagen
- Metadata: autor (avatar + nombre + rol), fecha, tiempo lectura
- CTA "Leer artículo completo" con flecha animada

**2. Sección "Últimos Artículos":**
- Título + subtítulo descriptivo
- Layout 2 columnas: Main content (flex-1) + Sidebar (w-80)

**3. Grid de Posts:**
- Component `BlogGrid` con:
  - Filtros por categoría (Tabs horizontales)
  - Búsqueda en tiempo real
  - Grid responsive: 1→2→3 columnas
  - Cards `BlogCard` con hover effects

**4. Sidebar Desktop (hidden lg:block):**
- **Categorías:**
  - Card con bg-gray-900/30 + backdrop-blur
  - Lista de categorías con iconos emoji
  - Contador de posts por categoría
  - Hover bg-gray-800/50
  
- **Newsletter:**
  - Gradient bg from-apidevs-primary/10 to-purple-500/10
  - Input email + botón suscribirse
  - Colores APIDevs primary

**5. Estado Vacío:**
- Cuando no hay posts publicados
- Mensaje informativo con nota para publicar desde `/studio`

**Página Individual (`/blog/[slug]`):**
- `PostHeader` - Título, autor, metadata
- `PostContent` - Portable Text (reutiliza componentes de docs)
- `AuthorCard` - Info del autor con bio y social links
- `RelatedPosts` - Grid 3 posts relacionados
- `ShareButtons` - Twitter, LinkedIn, Facebook, Copy link
- `TableOfContents` - TOC sticky (reutilizado de docs)

**Componentes Reutilizados de Docs:**
- ✅ `PortableTextComponents` - Code blocks, callouts, imágenes
- ✅ `TableOfContents` - TOC con auto-highlighting
- ✅ `BackgroundEffects` - Partículas espaciales (variant="minimal")

**Colores APIDevs Blog:**
```css
/* Backgrounds */
--blog-bg: #0a0a0a (apidevs-dark)
--card-bg: bg-gray-900/30
--hover-bg: bg-gray-800/50

/* Text */
--text-primary: text-white
--text-secondary: text-gray-400

/* Acentos */
--primary: #C9D92E (green-lime)
--purple: #9333EA (purple-600)

/* Badges */
--featured-badge: bg-apidevs-primary text-gray-900
--category-badge: Dinámico según color de categoría
```

### 🎛️ **Sanity Studio - Sección Blog:**

**Ubicación:** `/studio` → "📝 Blog"

**Estructura Sidebar:**

```typescript
// sanity/deskStructure.ts
S.listItem()
  .title('📝 Blog')
  .child(
    S.list()
      .title('Sistema de Blog')
      .items([
        // ✨ Quick Actions
        S.listItem()
          .title('✨ Quick Actions')
          .child(
            S.list().items([
              '➕ Nuevo Post',
              '⭐ Posts Destacados',
              '🚧 Borradores'
            ])
          ),
        
        S.divider(),
        
        // 📄 Todos los Posts
        S.documentTypeList('post'),
        
        S.divider(),
        
        // 📊 Por Estado
        S.listItem()
          .title('📊 Por Estado')
          .child(
            S.list().items([
              '✅ Publicados',
              '🚧 Borradores',
              '👀 En Revisión',
              '📅 Programados'
            ])
          ),
        
        S.divider(),
        
        // 🏷️ Categorías
        S.documentTypeList('blogCategory'),
        
        // 👤 Autores
        S.documentTypeList('author')
      ])
  )
```

**Features Studio:**
- ✅ Quick actions para crear posts rápidamente
- ✅ Filtros por estado (draft, published, review, scheduled)
- ✅ Vista de posts destacados
- ✅ Gestión de categorías con orden personalizado
- ✅ Gestión de autores

### 🚧 **Pendientes (Posts por Categoría):**

**NO Implementado:**
- [ ] `/blog/category/[slug]` - Página filtrada por categoría
export const POSTS_BY_CATEGORY_QUERY = defineQuery(`
  *[_type == "post" && $categorySlug in categories[]->slug.current] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime
  }
`;
```

### 📚 **Guía de Uso: Crear Contenido Rico en el Blog**

#### **Flujo de Trabajo Recomendado:**

**1. Crear Post en Sanity Studio:**
```
1. Ir a http://localhost:3000/studio
2. Click en "📝 Blog" → "➕ Nuevo Post"
3. Llenar campos básicos:
   - Title (se genera slug automático)
   - Excerpt (150-200 chars)
   - Main Image (obligatorio, con alt text)
   - Author (seleccionar de lista)
   - Categories (array, puede ser múltiple)
   - Tags (array de strings)
   - Language (ES/EN)
   - Status: "✅ Publicado"
   - Visibility: "🌍 Público"
```

**2. Crear Contenido Enriquecido:**

El editor de `content` tiene un menú "+" para insertar componentes:

**Estructura Sugerida de un Post:**
```markdown
[Párrafo introductorio con **negritas** y *cursivas*]

## Sección Principal (H2)

[Párrafo explicativo]

[💡 Callout tipo "Info" con consejo clave]

### Subsección (H3)

[Lista numerada con pasos]
1. Primer paso
2. Segundo paso
3. Tercer paso

[🎥 Video Embed si hay tutorial]

[🃏 Card Group con recursos relacionados - 3 columnas]

### Comparativa (H3)

[📑 Tabs para comparar opciones]

### Preguntas Frecuentes (H3)

[📋 Accordion 1: ¿Pregunta frecuente 1?]
[📋 Accordion 2: ¿Pregunta frecuente 2?]

[⚠️ Callout tipo "Warning" con advertencia importante]

## Conclusión (H2)

[Párrafo de cierre]

[✅ Callout tipo "Success" con llamado a la acción]
```

**3. Publicar:**
```
1. Verificar preview en Studio
2. Cambiar Status a "✅ Publicado"
3. Click "Publish"
4. Visitar http://localhost:3000/blog para ver el post
5. Esperar máx 1 hora para ISR (o forzar refresh)
```

#### **Tips de Contenido:**

**Usar Card Groups cuando:**
- Necesitas mostrar recursos relacionados
- Quieres crear navegación visual a otros posts/docs
- Presentas múltiples opciones o servicios

**Usar Tabs cuando:**
- Comparas frameworks, estrategias, timeframes
- Muestras código en diferentes lenguajes
- Presentas información alternativa (Principiante vs Avanzado)

**Usar Accordion cuando:**
- Creas sección de FAQs
- Contenido opcional que no todos necesitan leer
- Listas largas que ocupan mucho espacio

**Usar Callouts cuando:**
- Info importante que destaca del contenido (💡 Info)
- Advertencias críticas (⚠️ Warning, 🚨 Error)
- Confirmaciones o buenas prácticas (✅ Success)
- Tips rápidos (💡 Tip)
- Notas adicionales (📝 Note)

#### **Consultas MCP Útiles:**

**Ver todos los posts:**
```typescript
mcp_sanity_query_documents({
  resource: { projectId: 'mpxhkyzk', dataset: 'production' },
  query: '*[_type == "post"] | order(publishedAt desc) {title, status, publishedAt}'
})
```

**Crear post con AI:**
```typescript
mcp_sanity_create_document({
  resource: { projectId: 'mpxhkyzk', dataset: 'production' },
  type: 'post',
  instruction: 'Crear artículo sobre [TEMA] con introducción, 3 secciones principales con listas, callout de advertencia, y conclusión con CTA',
  workspaceName: 'default'
})
```

**Actualizar contenido con AI:**
```typescript
mcp_sanity_update_document({
  resource: { projectId: 'mpxhkyzk', dataset: 'production' },
  operations: [{
    documentId: 'POST_ID',
    instruction: 'Agregar sección sobre gestión de riesgo con 3 bullets y un callout de warning'
  }],
  workspaceName: 'default'
})
```

**Traducir post:**
```typescript
mcp_sanity_translate_document({
  resource: { projectId: 'mpxhkyzk', dataset: 'production' },
  documentIds: ['POST_ID'],
  language: { id: 'en', title: 'English' },
  operation: 'create',
  protectedPhrases: ['APIDevs', 'TradingView', 'Stop Loss'],
  workspaceName: 'default'
})
```

### ✅ **Decisiones de Arquitectura Implementadas:**

1. **Layout Independiente de Docs:**
   - ✅ Blog usa navbar principal de APIDevs
   - ✅ NO oculta navbar/footer (solo docs lo hace)
   - ✅ NO tiene sidebar fijo como docs
   - ✅ Usa `BackgroundEffects` con variant="minimal"

2. **Schemas Separados:**
   - ✅ `post` ≠ `documentation` (schemas independientes)
   - ✅ `blogCategory` ≠ `docCategory` (propósitos diferentes)
   - ✅ Queries GROQ separadas en `blog-queries.ts`

3. **Componentes Reutilizados:**
   - ✅ `PortableTextComponents.tsx` de docs (Server Component)
   - ✅ `TableOfContents.tsx` de docs
   - ✅ `BackgroundEffects` con variant="minimal"
   - ❌ NO se reutiliza `ThemeProvider` (blog no tiene dark/light mode por ahora)

4. **Middleware:**
   - ✅ Blog NO necesita skip de Supabase auth
   - ✅ Posts son públicos por defecto
   - ✅ Filtro `visibility == "public"` en queries

5. **ISR Configuration Implementada:**
```typescript
// app/blog/page.tsx
export const revalidate = 3600; // ISR: Revalidar cada hora

async function getBlogData() {
  const [featuredPosts, recentPosts, categories] = await Promise.all([
    client.fetch(FEATURED_POSTS_QUERY, { language: 'es' }, {
      next: { revalidate: 3600, tags: ['blog', 'featured'] }
    }),
    client.fetch(BLOG_POSTS_QUERY, { language: 'es', limit: 12 }, {
      next: { revalidate: 3600, tags: ['blog'] }
    }),
    client.fetch(BLOG_CATEGORIES_QUERY, {}, {
      next: { revalidate: 3600, tags: ['blog-categories'] }
    })
  ]);
  return { featuredPosts, recentPosts, categories };
}

// app/blog/[slug]/page.tsx
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await client.fetch(POST_SLUGS_QUERY);
  return slugs.map((slug: string) => ({ slug }));
}

const post = await client.fetch(POST_BY_SLUG_QUERY, { slug }, {
  next: { 
    revalidate: 3600, 
    tags: [`blog:${slug}`] 
  }
});
```

### ✅ **Implementación Completada (Checklist):**

- [x] **Fase 1: Schemas** ✅ 100%
  - [x] Crear `sanity/schemas/post.ts` (con status + visibility)
  - [x] Crear `sanity/schemas/blogCategory.ts` (con order + color)
  - [x] Crear `sanity/schemas/author.ts` (con bio + social)
  - [x] Agregar a `sanity/schemas/index.ts`
  - [x] Deploy schema: `npx sanity schema deploy`

- [x] **Fase 2: Queries** ✅ 100%
  - [x] Crear `sanity/lib/blog-queries.ts`
  - [x] Implementar 6 queries principales
  - [x] Filtros: status, visibility, language, featured

- [x] **Fase 3: Páginas** ✅ 100%
  - [x] Crear `app/blog/page.tsx` (Hero + Grid + Sidebar)
  - [x] Crear `app/blog/[slug]/page.tsx` (Post detalle)
  - [x] Configurar ISR 1 hora
  - [x] generateStaticParams para SSG

- [x] **Fase 4: Componentes** ✅ 100%
  - [x] `BlogHero.tsx` - Post destacado Hero
  - [x] `BlogCard.tsx` - Card individual con hover
  - [x] `BlogGrid.tsx` - Grid con filtros + búsqueda
  - [x] `CategoryBadge.tsx` - Badges con colores
  - [x] `PostHeader.tsx` - Header con metadata
  - [x] `PostContent.tsx` - Reutiliza PortableTextComponents
  - [x] `AuthorCard.tsx` - Info autor completa
  - [x] `RelatedPosts.tsx` - Posts relacionados
  - [x] `ShareButtons.tsx` - Compartir redes sociales
  - [x] `TableOfContents.tsx` - TOC sticky (de docs)

- [x] **Fase 5: Sanity Studio** ✅ 100%
  - [x] Sección "📝 Blog" en deskStructure
  - [x] Quick Actions (Nuevo Post, Destacados, Borradores)
  - [x] Filtros por estado
  - [x] Gestión categorías y autores

- [x] **Fase 6: Contenido Inicial** ✅ 100%
  - [x] 3 categorías creadas (Gestión de Riesgo, Indicadores, Piscotrading)
  - [x] 1 autor creado (Carlos Díaz - CEO APIDevs)
  - [x] 1 post ejemplo publicado
  - [x] Post con imagen, categorías, autor completo

- [ ] **Fase 7: SEO (Pendiente)** 🚧
  - [x] Meta tags dinámicos (title, description)
  - [x] Open Graph metadata
  - [ ] Sitemap blog
  - [ ] Schema.org JSON-LD
  - [ ] Canonical URLs

### 📊 **Contenido Publicado:**

**Categorías (3):**
1. 🎯 **Gestión de Riesgo** - Order: 1, Color: Primary
2. 📊 **Indicadores** - Order: 2, Color: Purple  
3. 🧠 **Piscotrading** - Order: 3, Color: Blue

**Autores (1):**
- **Carlos Díaz** - CEO APIDevs  
  - Avatar: ✅ Publicado
  - Bio: Trader y desarrollador
  - Role: CEO APIDevs

**Posts Publicados (1):**
- **"Cómo Calcular el Tamaño de tu Posición en Trading"**
  - Status: ✅ Published
  - Featured: ✅ Yes
  - Language: ES
  - Categories: Gestión de Riesgo, Indicadores
  - Reading Time: 5 min
  - Published: 12 octubre 2025
  - Image: ✅ Funcionando
  - Content: Pasos detallados (1. Capital Total, 2. Riesgo %, 3. Stop Loss)

### 🚀 **Próximos Pasos:**

**Contenido (Prioridad Alta):**
- [ ] Crear 5-10 posts adicionales para llenar grid
- [ ] Agregar imágenes featured a todos los posts
- [ ] Traducir posts al inglés
- [ ] Crear más autores (equipo APIDevs)

**Features (Prioridad Media):**
- [ ] Implementar `/blog/category/[slug]`
- [ ] Implementar `/blog/author/[slug]`
- [ ] Newsletter form funcional (integrar con servicio email)
- [ ] Búsqueda avanzada con Algolia/Meilisearch
- [ ] Comentarios (Disqus/Giscus)

**SEO (Prioridad Media):**
- [ ] Sitemap.xml para blog
- [ ] Schema.org Article markup
- [ ] Canonical URLs
- [ ] RSS Feed

**UX (Prioridad Baja):**
- [ ] Dark/Light mode para blog
- [ ] Infinite scroll en lugar de paginación
- [ ] Reading progress bar
- [ ] Estimated reading time automático
- [ ] Print stylesheet

### 💡 **Consejos para Crear Contenido:**

**Usando MCP Sanity:**
```typescript
// Crear post con AI
mcp_sanity_create_document({
  resource: { projectId: 'txlvgvel', dataset: 'production' },
  type: 'post',
  instruction: 'Crear artículo sobre [TEMA] con 1000 palabras, incluir introducción, 3 secciones principales con listas, y conclusión',
  workspaceName: 'default'
})

// Traducir post existente
mcp_sanity_translate_document({
  resource: { projectId: 'txlvgvel', dataset: 'production' },
  documentIds: ['POST_ID'],
  language: { id: 'en', title: 'English' },
  operation: 'create',
  workspaceName: 'default'
})
```

---

**Última actualización:** 13 octubre 2025  
**Commit:** Blog APIDevs - Sistema completo implementado  
**Branch:** `main`

**Cambios Recientes (Sesión 13 octubre 2025):**
- ✅ **Blog APIDevs 100% Implementado y Funcional**
- ✅ 3 Schemas Sanity creados (post, blogCategory, author)
- ✅ 6 Queries GROQ con filtros avanzados
- ✅ 13 Componentes React creados (10 básicos + 3 avanzados)
- ✅ **Componentes Avanzados de Contenido:**
  - 🃏 CardGroup - Grupos de cards 1-4 columnas
  - 📑 Tabs - Pestañas interactivas 2-8 tabs
  - 📋 Accordion - Secciones colapsables
- ✅ Páginas /blog y /blog/[slug] con ISR
- ✅ Hero destacado + Grid posts + Sidebar
- ✅ Schema `post` con 8 tipos de componentes Portable Text
- ✅ Sección "📝 Blog" en Sanity Studio
- ✅ 2 posts publicados con contenido rico
- ✅ Documentación completa con guía de uso
- ✅ Fix imageUrl helper (mainImage completo vs mainImage.asset)
- ✅ Fix tipos TypeScript (Author con campos opcionales)

**Estado Actual del Sistema:**

**📚 Documentación (`/docs`):**
- ✅ 2 documentos publicados (ES)
- ✅ 1 categoría activa
- ✅ Sistema i18n base implementado
- ✅ Dark/Light mode funcional
- ✅ Búsqueda con Ctrl+K
- ✅ Responsive completo

**📊 Indicadores (`/indicadores`):**
- ✅ 6 indicadores migrados
- ✅ Sidebar adaptativo por plan (free/pro/lifetime)
- ✅ Catálogo con filtros dinámicos
- ✅ ISR 1 hora + SSG

**📝 Blog (`/blog`):**
- ✅ **100% FUNCIONAL** (implementado 13 oct 2025)
- ✅ 1 post publicado con contenido rico
- ✅ 3 categorías + 1 autor
- ✅ Hero + Grid + Sidebar completos
- ✅ ISR 1 hora + SSG
- 🚧 Pendiente: más contenido y páginas por categoría

---

**🎯 Objetivo de esta Guía:**

Esta guía te permite entender y trabajar con el sistema Sanity CMS de APIDevs, que gestiona:

1. ✅ **Catálogo de Indicadores VIP** (6 indicadores, sidebar adaptativo por plan)
2. ✅ **Sistema de Documentación tipo Mintlify** (dark/light mode, i18n, búsqueda)
3. ✅ **Blog** (Hero, Grid, categorías, autores - 100% funcional)

**Usando los MCPs de Sanity y Supabase** disponibles para crear, editar y optimizar contenido.

**URLs del Sistema:**
- Indicadores: `http://localhost:3000/indicadores`
- Documentación: `http://localhost:3000/docs`
- Blog: `http://localhost:3000/blog`
- Studio: `http://localhost:3000/studio`

