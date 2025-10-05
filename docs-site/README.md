# 📚 APIDevs Trading Platform - Documentación

Sistema de documentación estructurada con Docusaurus para el proyecto APIDevs Trading Platform.

## 🚀 Inicio Rápido

### Ejecutar la documentación localmente

```bash
# Navegar al directorio de documentación
cd docs-site

# Instalar dependencias (primera vez)
npm install

# Iniciar servidor de desarrollo
npm start
```

La documentación estará disponible en: **http://localhost:4000**

### Construir para producción

```bash
# Build optimizado para producción
npm run build

# Servir build localmente para testing
npm run serve
```

## 📁 Estructura de la Documentación

```
docs-site/
├── docs/
│   ├── intro.md                    # 👋 Página principal
│   ├── systems/                    # 🏗️ Sistemas críticos
│   │   ├── tradingview-access/     # Sistema TradingView
│   │   ├── purchases/              # Sistema de Compras
│   │   ├── geo-analytics/          # Geo-Analytics
│   │   └── cookies-tracking/       # Cookies & Tracking
│   ├── project/                    # 📊 Proyecto general
│   │   ├── overview.md             # Resumen completo
│   │   ├── tech-stack.md           # Stack tecnológico
│   │   └── migration.md            # Migración WordPress
│   └── components/                 # 🧩 Componentes
├── templates/                      # 📋 Templates estandarizados
└── src/                           # 🎨 Tema personalizado
```

## 🎯 Contenido Disponible

### 🏗️ **Sistemas Críticos**
- **[Sistema TradingView](docs/systems/tradingview-access/overview.md)** - Gestión completa de accesos (3,369 líneas)
- **[Sistema de Compras](docs/systems/purchases/overview.md)** - Dashboard admin y analytics (1,417 líneas)
- **[Proyecto General](docs/project/overview.md)** - Arquitectura completa y contexto (1,217 líneas)

### 📊 **Proyecto**
- **Stack Tecnológico** - Next.js 14, Supabase, Stripe
- **Migración Legacy** - WordPress → Next.js con 6,477 usuarios
- **Arquitectura** - Decisiones técnicas y patrones
- **Deployment** - Vercel, GitHub, CI/CD

## 📝 Convenciones de Documentación

### Templates Disponibles
- **`templates/SYSTEM-CRITICAL-TEMPLATE.md`** - Para sistemas críticos
- **`templates/FEATURE-MODULE-TEMPLATE.md`** - Para features específicos
- **`templates/COMPONENT-TEMPLATE.md`** - Para componentes individuales

### Estructura de Cada Documento
1. **Header con metadata** - Fecha, estado, commits
2. **Objetivo general** - Qué hace y por qué es crítico
3. **Arquitectura** - Stack, componentes, base de datos
4. **Funcionalidades** - Qué está implementado
5. **Problemas conocidos** - Soluciones a issues críticos
6. **Estadísticas** - Métricas actuales del sistema
7. **Consideraciones críticas** - Para futuras IAs
8. **Próximos pasos** - Roadmap y prioridades

## 🔧 Desarrollo

### Agregar Nueva Documentación

```bash
# Copiar template apropiado
cp templates/SYSTEM-CRITICAL-TEMPLATE.md docs/docs/systems/[nuevo-sistema]/overview.md

# Editar con información específica
# Completar todos los [CORCHETES] con datos reales
```

### Actualizar Documentación Existente

Al modificar código:
1. Actualizar sección correspondiente
2. Agregar problemas nuevos con soluciones
3. Actualizar métricas si cambiaron
4. Documentar commits importantes

## 🚀 Deployment

### Deploy a Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd docs-site
vercel --prod
```

### Configuración de Producción

- **URL:** `https://docs.apidevs-platform.com`
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Node Version:** 20.x

## 🎯 Metadatos del Proyecto

- **Proyecto:** APIDevs Trading Platform
- **Versión:** MVP Completo
- **Estado:** 6,477 usuarios legacy migrados
- **Stack:** Next.js 14 + Supabase + Stripe
- **Deployment:** Vercel + GitHub

## 📞 Soporte

Para preguntas sobre la documentación:
- **Issues:** Crear issue en el repositorio
- **Commits:** Referenciar commits específicos con hashes
- **Updates:** Actualizar documentación al modificar código

---

**Última actualización:** Octubre 2025
**Documentación:** Docusaurus v3.9.1
**Proyecto:** APIDevs Trading Platform