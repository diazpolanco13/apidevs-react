# 🎨 Integración de Sanity CMS en APIDevs

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura](#arquitectura)
3. [Configuración](#configuración)
4. [Schema de Indicadores](#schema-de-indicadores)
5. [Queries GROQ](#queries-groq)
6. [Componentes](#componentes)
7. [Flujo de Datos](#flujo-de-datos)
8. [Optimización de Imágenes](#optimización-de-imágenes)
9. [MCP (Model Context Protocol)](#mcp-model-context-protocol)
10. [Casos de Uso](#casos-de-uso)

---

## 🎯 Introducción

Sanity CMS es un **Headless CMS** que proporciona una interfaz administrativa (Sanity Studio) para gestionar el contenido de los indicadores de trading. La integración permite:

- ✅ Gestión centralizada de indicadores
- ✅ Contenido rico con Portable Text
- ✅ Optimización automática de imágenes
- ✅ Generación estática de páginas (SSG)
- ✅ Revalidación incremental (ISR)
- ✅ SEO dinámico

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────┐
│           SANITY STUDIO                          │
│         (localhost:3000/studio)                  │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │  Editor visual de contenido              │   │
│  │  • Crear/Editar indicadores              │   │
│  │  • Subir imágenes                        │   │
│  │  • Portable Text (contenido rico)        │   │
│  └─────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────┘
                  │
                  │ Sanity API
                  │ (Content Lake)
                  │
┌─────────────────▼───────────────────────────────┐
│           NEXT.JS APP                            │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Server Components                        │  │
│  │  • app/indicadores/page.tsx              │  │
│  │  • app/indicadores/[slug]/page.tsx       │  │
│  └──────────────────────────────────────────┘  │
│                    │                             │
│  ┌─────────────────▼──────────────────────┐    │
│  │  Sanity Client                          │    │
│  │  • sanity/lib/client.ts                 │    │
│  │  • Fetches data via GROQ                │    │
│  └─────────────────┬──────────────────────┘    │
│                    │                             │
│  ┌─────────────────▼──────────────────────┐    │
│  │  Client Components                      │    │
│  │  • IndicatorsHub                        │    │
│  │  • IndicatorDetailView                  │    │
│  │  • ImageGallery                         │    │
│  └─────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

---

## ⚙️ Configuración

### 1. Variables de Entorno (`.env.local`)

```bash
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=mpxhkyzk
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=skk...  # Token con permisos de escritura
```

### 2. Configuración de Sanity (`sanity.config.ts`)

```typescript
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'default',
  title: 'APIDevs',
  
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  
  plugins: [
    structureTool(),
    visionTool(),
  ],
  
  schema: {
    types: schemaTypes,
  },
})
```

### 3. Cliente de Sanity (`sanity/lib/client.ts`)

```typescript
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
})
```

---

## 📊 Schema de Indicadores

El schema define la estructura de datos de los indicadores en Sanity:

### Ubicación: `sanity/schemas/indicator.ts`

```typescript
export default defineType({
  name: 'indicator',
  title: 'Indicador',
  type: 'document',
  fields: [
    // Identificación
    {
      name: 'pineId',
      title: 'Pine ID',
      type: 'string',
      description: 'ID del indicador en TradingView (formato: PUB;xxxxx)',
      validation: (Rule) => Rule.required(),
    },
    
    // URLs
    {
      name: 'tradingviewUrl',
      title: 'URL Pública del Script',
      type: 'url',
      description: 'URL pública del script para usuarios',
      validation: (Rule) => Rule.required().uri({ scheme: ['https'] }),
    },
    {
      name: 'embedUrl',
      title: '📊 URL Embed Interactivo (Widget)',
      type: 'url',
      description: 'URL del widget interactivo de TradingView',
    },
    
    // Metadata
    {
      name: 'slug',
      title: 'Slug URL',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'shortDescription',
      title: 'Descripción Corta',
      type: 'text',
      validation: (Rule) => Rule.required().max(200),
    },
    
    // Imágenes
    {
      name: 'mainImage',
      title: 'Imagen Principal',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Texto Alternativo' },
      ],
    },
    {
      name: 'gallery',
      title: 'Galería de Imágenes',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Texto Alternativo' },
            { name: 'caption', type: 'string', title: 'Descripción' },
          ],
        },
      ],
    },
    
    // Contenido
    {
      name: 'content',
      title: 'Contenido',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string' },
            { name: 'caption', type: 'string' },
          ],
        },
      ],
    },
    
    // Características
    {
      name: 'features',
      title: 'Características',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'benefits',
      title: 'Beneficios',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string', title: 'Título' },
            { name: 'description', type: 'text', title: 'Descripción' },
          ],
        },
      ],
    },
    
    // FAQs
    {
      name: 'faq',
      title: 'Preguntas Frecuentes',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'question', type: 'string', title: 'Pregunta' },
            { name: 'answer', type: 'text', title: 'Respuesta' },
          ],
        },
      ],
    },
    
    // Categorización
    {
      name: 'category',
      title: 'Categoría',
      type: 'string',
      options: {
        list: [
          { title: 'Indicador', value: 'indicador' },
          { title: 'Scanner', value: 'scanner' },
          { title: 'Tool', value: 'tool' },
        ],
      },
      initialValue: 'indicador',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'access_tier',
      title: 'Tier de Acceso',
      type: 'string',
      options: {
        list: [
          { title: '🎁 Free', value: 'free' },
          { title: '💎 Premium', value: 'premium' },
        ],
      },
      initialValue: 'free',
      validation: (Rule) => Rule.required(),
    },
    
    // Video
    {
      name: 'videoUrl',
      title: 'URL de Video (YouTube)',
      type: 'url',
    },
    
    // SEO
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        { name: 'metaTitle', type: 'string' },
        { name: 'metaDescription', type: 'text' },
        { name: 'keywords', type: 'array', of: [{ type: 'string' }] },
      ],
    },
  ],
})
```

---

## 🔍 Queries GROQ

GROQ (Graph-Relational Object Queries) es el lenguaje de consultas de Sanity.

### Ubicación: `sanity/lib/queries.ts`

### 1. **Lista de Indicadores** (Catálogo)

```typescript
export const INDICATORS_QUERY = defineQuery(`
  *[_type == "indicator"] | order(publishedAt desc) {
    _id,
    _createdAt,
    pineId,
    "slug": slug.current,
    title,
    shortDescription,
    mainImage {
      asset-> {
        _id,
        url,
        metadata {
          lqip,
          dimensions {
            width,
            height
          }
        }
      },
      alt
    },
    features,
    tags,
    access_tier,
    category,
    status,
    publishedAt
  }
`)
```

### 2. **Indicador por Slug** (Detalle)

```typescript
export const INDICATOR_BY_SLUG_QUERY = defineQuery(`
  *[_type == "indicator" && slug.current == $slug][0] {
    _id,
    pineId,
    tradingviewUrl,
    embedUrl,
    "slug": slug.current,
    title,
    shortDescription,
    mainImage {
      asset-> {
        _id,
        url,
        metadata {
          lqip,
          dimensions { width, height }
        }
      },
      alt
    },
    gallery[] {
      asset-> {
        _id,
        url,
        metadata {
          lqip,
          dimensions { width, height }
        }
      },
      alt,
      caption
    },
    videoUrl,
    content,
    features,
    benefits,
    howToUse,
    faq,
    seo,
    tags,
    access_tier,
    category,
    publishedAt
  }
`)
```

### 3. **Slugs para Static Generation**

```typescript
export const INDICATORS_SLUGS_QUERY = defineQuery(`
  *[_type == "indicator" && defined(slug.current)][].slug.current
`)
```

---

## 🧩 Componentes

### 1. **Página de Catálogo** (`app/indicadores/page.tsx`)

**Tipo:** Server Component  
**Estrategia:** ISR (Incremental Static Regeneration)

```typescript
export const revalidate = 3600; // Revalidar cada hora

export default async function IndicadoresPage() {
  // Fetch indicators desde Sanity
  const indicators = await client.fetch<IndicatorListItem[]>(
    INDICATORS_QUERY,
    {},
    {
      next: {
        revalidate: 3600,
        tags: ['indicators'],
      },
    }
  );

  return (
    <div className="relative min-h-screen bg-black">
      <BackgroundEffects />
      <div className="relative z-10">
        <IndicatorsHub initialIndicators={indicators} />
      </div>
    </div>
  );
}
```

**Características:**
- ✅ Server-side rendering en build time
- ✅ Cache de 1 hora
- ✅ Revalidación automática con tags

---

### 2. **Página de Detalle** (`app/indicadores/[slug]/page.tsx`)

**Tipo:** Server Component  
**Estrategia:** SSG + ISR

```typescript
// Genera rutas estáticas para todos los indicadores
export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(INDICATORS_SLUGS_QUERY);
  return slugs.map((slug) => ({ slug }));
}

// Genera metadatos dinámicamente
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const indicator = await client.fetch<IndicatorDetail>(
    INDICATOR_BY_SLUG_QUERY,
    { slug: params.slug }
  );

  return {
    title: indicator.seo?.metaTitle || `${indicator.title} | APIDevs`,
    description: indicator.seo?.metaDescription || indicator.shortDescription,
    keywords: indicator.seo?.keywords?.join(', '),
    openGraph: {
      title: indicator.seo?.metaTitle || indicator.title,
      description: indicator.seo?.metaDescription,
      images: [{ url: indicator.mainImage?.asset.url || '/default.png' }],
    },
  };
}

export default async function IndicatorPage({ params }: Props) {
  const indicator = await client.fetch<IndicatorDetail>(
    INDICATOR_BY_SLUG_QUERY,
    { slug: params.slug },
    {
      next: {
        revalidate: 3600,
        tags: [`indicator:${params.slug}`],
      },
    }
  );

  if (!indicator) notFound();

  return (
    <div className="relative min-h-screen bg-black">
      <BackgroundEffects />
      <div className="relative z-10">
        <IndicatorDetailView indicator={indicator} />
      </div>
    </div>
  );
}
```

**Características:**
- ✅ Páginas pre-renderizadas en build time
- ✅ SEO dinámico (meta tags, OpenGraph, Twitter Cards)
- ✅ Revalidación por slug
- ✅ 404 automático para slugs inválidos

---

### 3. **IndicatorDetailView** (Client Component)

**Renderiza:**
- Widget interactivo de TradingView (`embedUrl`)
- Botones CTA (Obtener Acceso, Ver en TradingView)
- Contenido rico (Portable Text)
- Galería de imágenes con lightbox
- Video de YouTube
- FAQs, características, beneficios

```typescript
export default function IndicatorDetailView({ indicator }: Props) {
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero: TradingView Widget */}
      {indicator.embedUrl && (
        <TradingViewEmbed embedUrl={indicator.embedUrl} />
      )}
      
      {/* CTA Buttons */}
      <div className="flex gap-3">
        <Link href="/checkout">Obtener Acceso</Link>
        <a href={indicator.tradingviewUrl}>Ver en TradingView</a>
      </div>
      
      {/* Content */}
      <PortableText value={indicator.content} />
      
      {/* Gallery */}
      {indicator.gallery && <ImageGallery images={indicator.gallery} />}
      
      {/* Video */}
      {indicator.videoUrl && <iframe src={indicator.videoUrl} />}
      
      {/* Sidebar */}
      <aside>
        {/* Features, Benefits, How to Use */}
      </aside>
    </div>
  );
}
```

---

## 🔄 Flujo de Datos

### 1. **Creación de Contenido**

```
Editor en Sanity Studio → Sanity API → Content Lake
```

### 2. **Build Time (SSG)**

```
Next.js Build
  ↓
Fetch INDICATORS_SLUGS_QUERY
  ↓
Generate static pages for each slug
  ↓
Fetch INDICATOR_BY_SLUG_QUERY for each
  ↓
Generate HTML + JSON
  ↓
Deploy to production
```

### 3. **Runtime (ISR)**

```
User visits /indicadores/position-size
  ↓
Check if cached (< 1 hour)
  ↓
  YES → Serve from cache
  ↓
  NO → Revalidate in background
       ↓
       Fetch fresh data from Sanity
       ↓
       Update cache
       ↓
       Serve updated page
```

---

## 🖼️ Optimización de Imágenes

### Helper: `sanity/lib/image.ts`

```typescript
export const urlForImage = (source: any) => {
  if (!source?.asset) return undefined;

  // Si el asset ya está resuelto (tiene url), úsalo directamente
  if (source.asset.url) {
    return {
      url: () => source.asset.url,
      width: (w: number) => ({
        height: (h: number) => ({
          url: () => source.asset.url
        })
      })
    }
  }

  // Si tiene _ref, usa el builder de Sanity
  if (source.asset._ref) {
    return imageBuilder?.image(source).auto('format').fit('max')
  }

  return undefined
}
```

**Uso:**

```typescript
const imageUrl = urlForImage(indicator.mainImage)
  ?.width(800)
  .height(600)
  .url();
```

**Beneficios:**
- ✅ Optimización automática (WebP, AVIF)
- ✅ Responsive (srcset automático)
- ✅ CDN global (Sanity CDN)
- ✅ LQIP (Low Quality Image Placeholder)

---

## 🤖 MCP (Model Context Protocol)

Permite que AI assistants (como Cursor) interactúen directamente con Sanity Studio.

### Configuración: `sanity-mcp-config.json`

```json
{
  "sanity": {
    "command": "npx",
    "args": ["-y", "@sanity/mcp-server@latest"],
    "env": {
      "SANITY_PROJECT_ID": "mpxhkyzk",
      "SANITY_DATASET": "production",
      "SANITY_API_TOKEN": "skk...",
      "MCP_USER_ROLE": "editor"
    }
  }
}
```

### Capacidades:

- ✅ Crear documentos
- ✅ Actualizar contenido
- ✅ Publicar/despublicar
- ✅ Hacer queries GROQ
- ✅ Gestionar assets (imágenes)

---

## 📚 Casos de Uso

### 1. **Agregar un nuevo indicador**

```bash
# En Sanity Studio (localhost:3000/studio)
1. Click en "Indicador" → "Create"
2. Completar campos:
   - Pine ID
   - Título
   - Descripción corta
   - Slug (auto-generado)
   - URLs (TradingView, embed)
   - Categoría y tier
3. Subir imagen principal
4. Agregar características, beneficios
5. Escribir contenido (Portable Text)
6. Agregar galería, video
7. Configurar SEO
8. Click "Publish"
```

### 2. **Actualizar contenido existente**

```bash
1. Buscar indicador en Sanity Studio
2. Click "Edit"
3. Modificar campos
4. Click "Publish"
   → La página se revalidará automáticamente en < 1 hora
```

### 3. **Optimizar SEO**

```typescript
// En Sanity Studio, sección SEO:
{
  metaTitle: "Position Size Calculator | APIDevs",
  metaDescription: "Calcula el tamaño óptimo de posición...",
  keywords: ["position size", "risk management", "trading"]
}
```

### 4. **Agregar contenido rico**

```bash
# Portable Text soporta:
- Headings (H1-H6)
- Párrafos
- Listas (ordenadas/desordenadas)
- Bold, italic, links
- Imágenes embebidas
- Videos embebidos
- Código
```

---

## 🚀 Comandos Útiles

### Deploy Schema

```bash
npx sanity@latest schema deploy --dataset production
```

### Iniciar Sanity Studio

```bash
npm run dev
# Visita: http://localhost:3000/studio
```

### Validar Schema

```bash
npx sanity@latest schema validate
```

### Exportar datos

```bash
npx sanity@latest dataset export production backup.tar.gz
```

### Importar datos

```bash
npx sanity@latest dataset import backup.tar.gz production
```

---

## 📊 Estructura de Archivos

```
apidevs-react/
├── sanity/
│   ├── env.ts                    # Variables de entorno
│   ├── schemas/
│   │   ├── index.ts              # Export de todos los schemas
│   │   └── indicator.ts          # Schema de indicadores
│   └── lib/
│       ├── client.ts             # Cliente de Sanity
│       ├── queries.ts            # Queries GROQ + Types
│       └── image.ts              # Helper de imágenes
│
├── app/
│   ├── studio/
│   │   └── [[...tool]]/
│   │       └── page.tsx          # Sanity Studio
│   ├── indicadores/
│   │   ├── page.tsx              # Lista (SSG + ISR)
│   │   └── [slug]/
│   │       └── page.tsx          # Detalle (SSG + ISR)
│
├── components/
│   └── ui/
│       ├── IndicatorsHub/
│       │   ├── IndicatorsHub.tsx
│       │   └── IndicatorCard.tsx
│       └── IndicatorDetail/
│           └── IndicatorDetailView.tsx
│
├── sanity.config.ts              # Configuración de Sanity
├── sanity.cli.ts                 # CLI de Sanity
├── sanity-mcp-config.json        # MCP para AI
└── .env.local                    # Variables de entorno
```

---

## 🎯 Best Practices

### 1. **Queries**
- ✅ Usa `defineQuery` para type-safety
- ✅ Proyecta solo los campos necesarios
- ✅ Usa `asset->` para resolver referencias

### 2. **Imágenes**
- ✅ Siempre define `alt` text
- ✅ Usa `hotspot` para crop inteligente
- ✅ Aprovecha LQIP para placeholders

### 3. **Cache**
- ✅ Usa `revalidate` para ISR
- ✅ Define `tags` para revalidación selectiva
- ✅ Considera `useCdn: true` para lectura

### 4. **SEO**
- ✅ Completa metadata en cada indicador
- ✅ Usa slugs descriptivos
- ✅ Genera sitemap dinámico

### 5. **Performance**
- ✅ Pre-renderiza páginas en build time
- ✅ Usa Server Components cuando sea posible
- ✅ Implementa lazy loading para galerías

---

## 🔗 Recursos

- [Sanity Docs](https://www.sanity.io/docs)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Next.js + Sanity](https://www.sanity.io/plugins/next-sanity)
- [Image Optimization](https://www.sanity.io/docs/image-url)
- [Portable Text](https://portabletext.org/)

---

## 📞 Soporte

Si tienes dudas sobre la integración de Sanity:

1. **Documentación oficial**: https://www.sanity.io/docs
2. **Slack de Sanity**: https://slack.sanity.io/
3. **GitHub Issues**: Reporta bugs específicos

---

**¡Listo! 🎉** Ahora tienes una guía completa de cómo Sanity está integrado en tu aplicación APIDevs.

