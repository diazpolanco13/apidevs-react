# 🚨 PROBLEMA: Sistema Multi-idioma Sanity + Next.js

## 📋 **Contexto del Proyecto**

**Proyecto:** APIDevs - E-commerce de indicadores de trading  
**Tecnologías:** Next.js 14.2.3 + Sanity CMS + TypeScript  
**Objetivo:** Implementar sistema multi-idioma en la documentación (`/docs/`)

## 🔍 **Descripción del Problema**

### **Síntoma Principal:**
- La página `http://localhost:3000/docs/es` carga pero **NO muestra el contenido**
- Aparece mensaje "Documentación en desarrollo" en lugar del contenido real
- El sidebar está vacío (no muestra categorías ni documentos)

### **Error Técnico:**
```
GROQ query parse error: param $language referenced, but not provided
```

**URL del error:** `https://mpxhkyzk.apicdn.sanity.io/v2025-10-11/data/query/production`

## 🏗️ **Arquitectura Implementada**

### **1. Plugin de Internacionalización:**
- ✅ `@sanity/document-internationalization` instalado y configurado
- ✅ Idiomas soportados: Español (`es`) e Inglés (`en`)
- ✅ Schemas `documentation` y `docCategory` modificados con campo `language`

### **2. Rutas Next.js:**
```
app/docs/
├── [lang]/           # Nueva estructura multi-idioma
│   ├── layout.tsx    # Layout con idioma
│   ├── page.tsx      # /docs/es, /docs/en
│   └── [slug]/       # Documentos específicos
│       └── page.tsx  # /docs/es/que-es-apidevs
├── page.tsx          # Redirige /docs → /docs/es
└── layout.tsx        # Layout principal
```

### **3. Queries GROQ:**
```groq
// Query que falla:
{
  "categories": *[_type == "docCategory" && language == $language] | order(order asc) {
    _id, title, slug, icon, order, isCollapsible, defaultExpanded,
    "pages": *[_type == "documentation" && category._ref == ^._id && language == $language] | order(order asc) {
      _id, title, "slug": slug.current, icon, order, description
    }
  }
}
```

## 🔧 **Estado Actual de los Datos**

### **Sanity Studio:**
- ✅ **Documentos:** 2 documentos con `language: "es"` asignado
- ✅ **Categorías:** 1 categoría "Comenzar" con `language: "es"` asignado
- ✅ **Plugin activo:** Botón "Translations" visible en documentos y categorías

### **Verificación de Datos:**
```groq
# Documentos existentes:
*[_type == "documentation" && language == "es"]{
  _id, title, slug, language
}

# Categorías existentes:
*[_type == "docCategory" && language == "es"]{
  _id, title, slug, language
}
```

### **✅ SOLUCIÓN APLICADA - 12 Octubre 2025**

**Problema identificado:** El cliente de Sanity global tenía `perspective: 'published'` forzada, causando que las queries con parámetros `$language` fallaran.

**Solución implementada:**
1. **Nuevo cliente específico:** `docsClient` sin perspectiva forzada para queries con parámetros
2. **Archivos actualizados:**
   - `sanity/lib/client.ts` - Agregado `docsClient`
   - `app/docs/[lang]/layout.tsx` - Usa `docsClient`
   - `app/docs/[lang]/page.tsx` - Usa `docsClient`
   - `app/docs/[lang]/[slug]/page.tsx` - Usa `docsClient`

**Resultado:** `/docs/es` ahora muestra contenido real ("Comenzar", "Guía de Inicio en TradingView") ✅

### **✅ SEGUNDA SOLUCIÓN APLICADA - 12 Octubre 2025**

**Problema adicional:** Enlaces hardcodeados sin prefijo de idioma

**Solución implementada:**
- **DocsSidebar.tsx:** Corregidos enlaces de navegación y función `isPageActive`
- **DocsSearch.tsx:** Agregada detección automática de idioma actual y corrección de navegación
- **Archivos actualizados:**
  - `components/docs/DocsSidebar.tsx` - Enlaces ahora usan `/docs/${currentLanguage}/${slug}`
  - `components/docs/DocsSearch.tsx` - Navegación incluye idioma detectado del pathname

**Resultado final:** Todos los enlaces ahora usan formato correcto `/docs/es/slug` ✅

## 🐛 **Análisis del Error**

### **Problema Identificado:**
El parámetro `$language` no se está pasando correctamente a la query GROQ, aunque el código parece estar bien estructurado.

### **Código del Layout (`app/docs/[lang]/layout.tsx`):**
```typescript
export default async function DocsLanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  // Validar idioma
  if (!isValidLanguage(lang)) {
    // ... manejo de error
  }

  // Fetch sidebar data para el idioma específico
  let sidebarData;
  try {
    console.log('Fetching sidebar data for language:', lang);
    sidebarData = await client.fetch(SIDEBAR_DOCS_QUERY, { language: lang });
    console.log('Sidebar data fetched successfully:', sidebarData);
  } catch (error) {
    console.error('Error fetching sidebar data:', error);
    sidebarData = { categories: [] };
  }
  
  // ... resto del componente
}
```

### **Logs del Servidor:**
```
Fetching sidebar data for language: es
Sidebar data fetched successfully: { categories: [] }
```

**Observación:** La query se ejecuta pero devuelve `{ categories: [] }`, lo que sugiere que no encuentra datos con `language == "es"`.

## 🔍 **Posibles Causas**

### **1. Problema de Timing/Caching:**
- Sanity puede estar cacheando resultados antiguos
- El campo `language` puede no estar sincronizado entre Studio y API

### **2. Problema de Perspectiva:**
- La query puede estar ejecutándose en perspectiva `published` en lugar de `raw`
- Los documentos pueden estar en draft

### **3. Problema de Schema:**
- El campo `language` puede no estar correctamente definido en el schema
- Puede haber conflicto entre el plugin y el schema manual

### **4. Problema de Parámetros:**
- Aunque el log muestra `language: es`, puede haber un problema en cómo se pasa a Sanity
- Next.js puede estar serializando mal el parámetro

## 🛠️ **Archivos Clave**

### **1. Configuración Sanity (`sanity.config.ts`):**
```typescript
import {documentInternationalization} from '@sanity/document-internationalization'

export default defineConfig({
  // ...
  plugins: [
    documentInternationalization({
      supportedLanguages: [
        { id: 'es', title: 'Español 🇪🇸' },
        { id: 'en', title: 'English 🇺🇸' },
      ],
      defaultLanguages: ['es'],
      schemaTypes: ['documentation', 'docCategory'],
      languageField: 'language',
    }),
  ],
})
```

### **2. Schema Documentation (`sanity/schemas/documentation.ts`):**
```typescript
fields: [
  // Campo agregado manualmente:
  defineField({
    name: 'language',
    title: 'Idioma',
    type: 'string',
    readOnly: true,
    hidden: true,
  }),
  // ... resto de campos
]
```

### **3. Query GROQ (`sanity/lib/doc-queries.ts`):**
```typescript
export const SIDEBAR_DOCS_QUERY = groq`
  {
    "categories": *[_type == "docCategory" && language == $language] | order(order asc) {
      _id, title, slug, icon, order, isCollapsible, defaultExpanded,
      "pages": *[_type == "documentation" && category._ref == ^._id && language == $language] | order(order asc) {
        _id, title, "slug": slug.current, icon, order, description
      }
    }
  }
`;
```

## 🎯 **Preguntas para Debugging**

1. **¿Está el campo `language` realmente guardado en los documentos?**
   - Verificar en Sanity Studio que los documentos tengan el campo `language` visible
   - Confirmar que el valor sea exactamente `"es"` (string)

2. **¿La query funciona directamente en Sanity Vision?**
   - Probar la query manualmente en Sanity Studio > Vision
   - Usar parámetros: `{"language": "es"}`

3. **¿Hay conflictos de cache?**
   - Limpiar cache de Next.js: `rm -rf .next`
   - Verificar cache de Sanity en el navegador

4. **¿El plugin está funcionando correctamente?**
   - Verificar que el botón "Translations" funcione en Studio
   - Confirmar que se puedan crear traducciones

## 🔧 **Soluciones a Probar**

### **1. Verificación Directa de Datos:**
```groq
# Probar en Sanity Vision:
*[_type == "docCategory"]{_id, title, language}
*[_type == "documentation"]{_id, title, language}
```

### **2. Query Simplificada:**
```groq
# Probar query más simple:
*[_type == "docCategory" && language == "es"]
```

### **3. Cambiar Perspectiva:**
```typescript
// En el fetch, agregar perspectiva:
sidebarData = await client.fetch(
  SIDEBAR_DOCS_QUERY, 
  { language: lang },
  { perspective: 'raw' } // o 'published'
);
```

### **4. Debugging Avanzado:**
```typescript
// Agregar más logging:
console.log('Language parameter:', JSON.stringify({ language: lang }));
console.log('Query:', SIDEBAR_DOCS_QUERY);
```

## 📝 **Información del Entorno**

- **Next.js:** 14.2.3 (turbo mode)
- **Sanity:** Latest version
- **Plugin:** `@sanity/document-internationalization`
- **Proyecto Sanity:** `mpxhkyzk`
- **Dataset:** `production`
- **URL:** `http://localhost:3000`

## 🎯 **Objetivo Final**

Hacer que la página `/docs/es` muestre:
1. ✅ Sidebar con categoría "Comenzar"
2. ✅ Lista de documentos en esa categoría
3. ✅ Contenido real en lugar de "Documentación en desarrollo"
4. ✅ Sistema multi-idioma completamente funcional

---

**¿Puedes ayudar a resolver este problema de query GROQ con parámetros en Sanity + Next.js?**
