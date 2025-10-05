# 👋 Bienvenido a la Documentación de APIDevs Trading Platform

**APIDevs Trading Platform** es una aplicación web moderna para la venta de **suscripciones de indicadores de trading digitales** con un sistema completo de gestión de accesos a TradingView.

## 🎯 ¿Qué encontrarás aquí?

Esta documentación técnica contiene todo lo necesario para entender, mantener y extender la plataforma:

### 🏗️ **Sistemas Críticos**
- **[Sistema de Gestión de Accesos TradingView](systems/tradingview-access/overview.md)** - El corazón de la plataforma
  - **[🔥 Microservicio TradingView](systems/tradingview-access/microservice.md)** - API crítica y endpoints
  - **[📡 Endpoints del Admin](systems/tradingview-access/endpoints.md)** - API completa del sistema
- **[Sistema de Compras y Dashboard Admin](systems/purchases/overview.md)** - Monetización y gestión de usuarios
- **[Sistema Geo-Analytics](systems/geo-analytics/overview.md)** - Análisis geográfico y tracking de marketing
- **[Sistema de Cookies y Tracking](systems/cookies/overview.md)** - Consentimiento y seguimiento de usuarios

### 🛠️ **Arquitectura y Desarrollo**
- **[Stack Tecnológico](project/overview.md#stack-tecnológico)** - Next.js, Supabase, Stripe, TradingView
- **[Proyecto General](project/overview.md)** - Arquitectura completa, migración y deployment

## 🚀 **Estado Actual del Proyecto**

| Sistema | Estado | Documentación | Última Actualización |
|---------|--------|---------------|---------------------|
| **TradingView Access** | ✅ **100% Funcional** | 4,500+ líneas | 5 Oct 2025 |
| **Dashboard Admin** | ✅ **Funcional** | 1,417 líneas | 2 Oct 2025 |
| **Geo-Analytics** | ✅ **Funcional** | Completo | 5 Oct 2025 |
| **Sistema de Pagos** | ✅ **Funcional** | Completo | 3 Oct 2025 |
| **Base de Usuarios** | ✅ **81 usuarios legacy** | Scripts completos | 3 Oct 2025 |

## 🎯 **Para quién es esta documentación**

### 🤖 **Para IAs (como yo)**
- **Single source of truth** - Un solo lugar con toda la información actualizada
- **Estructura clara** - Sidebar navegable con jerarquía lógica
- **Contexto completo** - Arquitectura, problemas conocidos, soluciones implementadas
- **Decisiones técnicas** - Por qué se tomó cada decisión y alternativas consideradas

### 👨‍💻 **Para Desarrolladores**
- **Guías de implementación** - Cómo extender cada sistema
- **Troubleshooting** - Problemas comunes y sus soluciones
- **API Reference** - Endpoints, parámetros, ejemplos
- **Mejores prácticas** - Patrones usados en el proyecto

### 📈 **Para el Negocio**
- **Métricas actuales** - Usuarios, conversiones, revenue
- **ROI esperado** - +25% reactivación de usuarios legacy
- **Próximos pasos** - Planes de crecimiento y monetización

## 📚 **Cómo navegar esta documentación**

1. **Si eres nuevo** → Empieza por [Resumen del Proyecto](project/overview.md)
2. **Si quieres entender el sistema TradingView** → Ve directo a [Sistema TradingView](systems/tradingview-access/overview.md)
3. **Si necesitas implementar algo** → Busca en la sección correspondiente
4. **Si hay un problema** → Revisa la sección de troubleshooting de cada sistema

## 🔍 **Búsqueda y Navegación**

- **Sidebar izquierdo** - Navegación jerárquica por sistemas
- **Búsqueda global** - Ctrl+K para buscar cualquier término
- **Enlaces cruzados** - Cada página enlaza a conceptos relacionados
- **Índice alfabético** - Para términos técnicos específicos

## 📝 **Convenciones utilizadas**

| Emoji | Significado |
|-------|-------------|
| ✅ | Implementado y funcionando |
| 🔄 | En desarrollo |
| ⏳ | Pendiente |
| 🐛 | Problema conocido |
| ⚠️ | Consideración crítica |
| 💡 | Mejora sugerida |

## 🚀 **Próximos pasos recomendados**

### Prioridad Alta
1. **Auto-grant en webhooks Stripe** - Conectar compras automáticas con accesos TradingView
2. **Sistema de notificaciones** - Push notifications para eventos importantes
3. **Dashboard de campañas UTM** - Análisis de marketing y conversiones

### Mejoras de Documentación
- Migrar toda la documentación existente a esta estructura
- Agregar más diagramas Mermaid para flujos complejos
- Crear guías de troubleshooting más detalladas

---

**Última actualización:** 5 de Octubre 2025
**Versión del proyecto:** MVP Completo
**Estado:** Documentación técnica consolidada en Docusaurus