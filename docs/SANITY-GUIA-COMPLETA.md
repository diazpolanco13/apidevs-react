# 📚 Guía Completa de Sanity CMS - APIDevs Indicators

## 🎯 Resumen

Has implementado exitosamente Sanity CMS en tu proyecto Next.js para gestionar el catálogo de indicadores de forma escalable y profesional.

## ✅ Estado de Implementación

### Fases Completadas

1. ✅ **Configuración Inicial**
   - Dependencias instaladas: `next-sanity`, `@sanity/image-url`, `@portabletext/react`
   - Cliente de Sanity configurado
   - Variables de entorno definidas

2. ✅ **Schema de Indicadores**
   - Schema completo con 15+ campos
   - Soporte para contenido enriquecido (Portable Text)
   - Galería de imágenes
   - SEO metadata
   - FAQ y beneficios

3. ✅ **Sanity Studio**
   - Studio embebido en `/studio`
   - Configuración integrada con Next.js
   - CORS configurado automáticamente

4. ✅ **Páginas Dinámicas**
   - Ruta dinámica: `/indicadores/[slug]`
   - ISR con revalidación de 60 segundos
   - Componente reutilizable `IndicatorDetailView`
   - SEO dinámico por indicador

5. ✅ **Catálogo Principal**
   - API route: `/api/indicators`
   - Combinación de datos Sanity + Supabase
   - Filtros y búsqueda funcionando

6. ✅ **Script de Migración**
   - Migración automatizada desde Supabase
   - Subida de imágenes a Sanity CDN
   - Generación de slugs automática

---

## 🚀 Cómo Usar

### 1. Acceder al Studio

```bash
# Iniciar el servidor
npm run dev

# Ir a http://localhost:3000/studio
# Login con tu cuenta de Sanity
```

### 2. Crear un Nuevo Indicador

1. En el Studio, click en **"Indicador"**
2. Click en **"Create"**
3. Llenar campos:
   - **Pine ID**: Copiar desde Supabase (ej: `PUB;abc123...`)
   - **Slug**: Generar automáticamente desde el título
   - **Title**: Nombre del indicador
   - **Short Description**: Descripción breve (máx 200 caracteres)
   - **Main Image**: Arrastrar imagen principal
   - **Gallery**: Agregar capturas de pantalla
   - **Content**: Escribir contenido enriquecido con el editor visual
   - **Features**: Lista de características
   - **Benefits**: Título y descripción de beneficios
   - **How to Use**: Instrucciones paso a paso
   - **FAQ**: Preguntas frecuentes
   - **SEO**: Meta título, descripción y keywords

4. Click en **"Publish"**
5. La página se generará automáticamente en `/indicadores/[slug]`

---

## 📝 Estructura del Proyecto

```
apidevs-react/
├── app/
│   ├── studio/
│   │   └── [[...tool]]/
│   │       └── page.tsx           # Sanity Studio embebido
│   ├── indicadores/
│   │   ├── page.tsx                # Catálogo de indicadores
│   │   └── [slug]/
│   │       └── page.tsx            # Página de detalle dinámica
│   └── api/
│       └── indicators/
│           └── route.ts            # API para obtener indicadores
├── components/
│   └── indicators/
│       ├── IndicatorDetailView.tsx # Vista de detalle reutilizable
│       └── PortableTextComponents.tsx # Estilos para contenido
├── lib/
│   └── sanity/
│       └── client.ts               # Cliente de Sanity
├── sanity/
│   ├── env.ts                      # Variables de entorno
│   ├── schemas/
│   │   └── indicator.ts            # Schema del indicador
│   └── schemaTypes/
│       └── index.ts                # Export de schemas
├── scripts/
│   └── migrate-indicators-to-sanity.ts # Script de migración
├── sanity.config.ts                # Configuración del Studio
└── .env.local                      # Variables de entorno
```

---

## 🔧 Comandos Disponibles

```bash
# Iniciar servidor de desarrollo (Next.js + Studio)
npm run dev

# Ejecutar migración de indicadores desde Supabase
npm run sanity:migrate

# Build de producción
npm run build

# Iniciar en producción
npm start
```

---

## 🎨 Campos del Schema

### Campos Básicos
- **pineId**: ID del indicador en TradingView (debe coincidir con Supabase)
- **slug**: URL amigable (se genera automáticamente)
- **title**: Título del indicador
- **shortDescription**: Descripción breve para el catálogo

### Multimedia
- **mainImage**: Imagen principal (con hotspot)
- **gallery**: Array de imágenes adicionales
- **videoUrl**: URL de video de demostración (YouTube/Vimeo)

### Contenido Enriquecido
- **content**: Editor Portable Text con:
  - Texto enriquecido (bold, italic, code)
  - Headings (H2, H3, H4)
  - Imágenes con caption
  - Videos embebidos
  - Blockquotes
  - Listas numeradas y con viñetas

### Características
- **features**: Array de strings (características principales)
- **benefits**: Array de objetos {title, description}
- **howToUse**: Texto largo con instrucciones
- **faq**: Array de objetos {question, answer}

### SEO
- **seo.metaTitle**: Título para meta tags (máx 60 caracteres)
- **seo.metaDescription**: Descripción para meta tags (máx 160 caracteres)
- **seo.keywords**: Array de palabras clave

### Metadata
- **publishedAt**: Fecha de publicación

---

## 🔄 Flujo de Datos

### 1. Datos Técnicos (Supabase)
```
indicators table:
- pine_id
- name
- access_tier (free/premium)
- category (indicador/escaner/tools)
- status
- total_users
- active_users
```

### 2. Contenido Editorial (Sanity)
```
indicator document:
- pineId (vincula con Supabase)
- slug
- title
- shortDescription
- mainImage
- gallery
- content (Portable Text)
- features
- benefits
- howToUse
- faq
- seo
```

### 3. Combinación en Frontend
```typescript
// 1. Obtener contenido de Sanity
const content = await client.fetch(`...`);

// 2. Obtener datos técnicos de Supabase
const { data: technical } = await supabase
  .from('indicators')
  .select('*')
  .eq('pine_id', content.pineId);

// 3. Renderizar con ambos
<IndicatorDetailView content={content} technical={technical} />
```

---

## 🎯 Mejores Prácticas

### 1. Contenido
- ✅ Escribir descripciones cortas y claras
- ✅ Usar imágenes de alta calidad (mínimo 1200x675px)
- ✅ Agregar al menos 3-5 features por indicador
- ✅ Incluir FAQs comunes
- ✅ Optimizar meta descriptions para SEO

### 2. Imágenes
- ✅ Usar formato PNG para capturas de pantalla
- ✅ Comprimir imágenes antes de subir
- ✅ Usar hotspots para recortes inteligentes
- ✅ Agregar texto alternativo descriptivo

### 3. SEO
- ✅ Meta título: Máximo 60 caracteres
- ✅ Meta descripción: 150-160 caracteres
- ✅ Keywords: 5-10 palabras clave relevantes
- ✅ Usar slugs descriptivos y cortos

### 4. Vinculación
- ⚠️ **IMPORTANTE**: El `pineId` en Sanity DEBE coincidir exactamente con el `pine_id` en Supabase
- ✅ Verificar en Supabase antes de crear en Sanity
- ✅ Usar el mismo formato: `PUB;xxxxx`

---

## 🐛 Troubleshooting

### Error: "No se encuentra el indicador"
- Verificar que el `pineId` en Sanity coincida con `pine_id` en Supabase
- Verificar que el indicador esté publicado en Sanity
- Verificar que el indicador tenga `status='activo'` en Supabase

### Error: "Imágenes no cargan"
- Verificar que el dominio `cdn.sanity.io` esté en `next.config.js`
- Verificar que las imágenes se hayan subido correctamente al CDN

### Error: "Studio no carga"
- Verificar variables de entorno en `.env.local`
- Verificar que el token tenga permisos suficientes
- Reiniciar el servidor

### Error: "ISR no actualiza"
- Esperar 60 segundos después de publicar cambios
- Hacer hard refresh en el navegador (Ctrl+Shift+R)
- Verificar que `revalidate = 60` esté configurado

---

## 📊 Métricas y Monitoreo

### Datos Técnicos (Supabase)
- Total de usuarios: `indicator.total_users`
- Usuarios activos: `indicator.active_users`
- Tier: `indicator.access_tier`
- Categoría: `indicator.category`

### Datos Editoriales (Sanity)
- Total de indicadores publicados
- Fecha de última actualización
- Indicadores sin contenido completo

---

## 🚀 Deployment

### 1. Build Local
```bash
npm run build
npm start
```

### 2. Variables de Entorno en Producción
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=mpxhkyzk
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=tu_token_aqui
```

### 3. Vercel
- Las variables ya están configuradas
- El Studio funciona en producción en `/studio`
- ISR funciona automáticamente

---

## 📚 Recursos Adicionales

- [Documentación de Sanity](https://www.sanity.io/docs)
- [Portable Text](https://www.sanity.io/docs/presenting-block-text)
- [Image API](https://www.sanity.io/docs/image-url)
- [GROQ Queries](https://www.sanity.io/docs/groq)

---

## ✨ Próximos Pasos

### Opcionales
- [ ] Agregar preview en tiempo real
- [ ] Implementar webhooks de Sanity
- [ ] Agregar más tipos de contenido (posts, tutoriales)
- [ ] Implementar multi-idioma
- [ ] Agregar analytics de contenido

---

**¡Felicidades! Tu sistema de catálogo con Sanity está completamente funcional.** 🎉

Para cualquier duda, consulta esta guía o la documentación oficial de Sanity.

