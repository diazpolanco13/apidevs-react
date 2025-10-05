# 📚 Templates de Documentación Estandarizada

Esta carpeta contiene los templates estandarizados para mantener consistencia en toda la documentación de APIDevs Trading Platform.

## 🎯 Templates Disponibles

### 1. **Sistema Crítico** (`SYSTEM-CRITICAL-TEMPLATE.md`)
**Para:** Sistemas fundamentales que hacen funcionar la plataforma
**Ejemplos:** Sistema TradingView, Sistema de Compras, Geo-Analytics
**Características:**
- Documentación técnica completa (500+ líneas)
- Arquitectura detallada
- Problemas conocidos con soluciones
- Métricas actuales
- Consideraciones para futuras IAs

### 2. **Feature/Módulo** (`FEATURE-MODULE-TEMPLATE.md`)
**Para:** Funcionalidades específicas importantes
**Ejemplos:** Sistema de notificaciones, Dashboard de analytics, Sistema de refunds
**Características:**
- Explicación clara del propósito
- Componentes involucrados
- Flujo técnico paso a paso
- Limitaciones y TODOs

### 3. **Componente** (`COMPONENT-TEMPLATE.md`)
**Para:** Componentes individuales y utilidades
**Ejemplos:** `SimpleCookieBanner`, hooks personalizados, utilidades
**Características:**
- Props y tipos detallados
- Ejemplos de uso
- Consideraciones de performance
- Documentación concisa

## 🚀 Cómo Usar los Templates

### Paso 1: Elegir el Template Correcto
- **¿Es crítico para el funcionamiento de la web?** → Sistema Crítico
- **¿Es una funcionalidad autocontenida?** → Feature/Módulo
- **¿Es un componente simple reutilizable?** → Componente

### Paso 2: Copiar y Completar
```bash
# Copiar el template apropiado
cp templates/SYSTEM-CRITICAL-TEMPLATE.md docs/docs/systems/[nuevo-sistema]/overview.md

# O para features
cp templates/FEATURE-MODULE-TEMPLATE.md docs/docs/features/[nueva-feature].md

# O para componentes
cp templates/COMPONENT-TEMPLATE.md docs/docs/components/[categoria]/[componente].md
```

### Paso 3: Completar con Información Real
- Reemplazar todos los `[CORCHETES]` con información específica
- Incluir código real y ejemplos funcionales
- Agregar métricas actuales del sistema
- Listar commits importantes con hashes

### Paso 4: Ubicación Correcta
```
docs/docs/
├── systems/           # 🏗️ Sistemas críticos
│   └── [sistema]/
│       └── overview.md
├── features/          # 🔧 Features importantes
│   └── [feature].md
├── components/        # 🧩 Componentes individuales
│   └── [categoria]/
│       └── [componente].md
└── project/           # 📊 Proyecto general
    ├── overview.md
    ├── tech-stack.md
    └── ...
```

## 📋 Checklist de Calidad

### Para Todos los Templates:
- [ ] Información actualizada (última revisión < 1 mes)
- [ ] Código funcional y probado
- [ ] Paths exactos de archivos
- [ ] Consideraciones para futuras IAs
- [ ] Problemas conocidos documentados

### Específico por Template:
- **Sistema Crítico:** Arquitectura completa, métricas actuales, problemas resueltos
- **Feature:** Flujo técnico detallado, limitaciones claras
- **Componente:** Props completas, ejemplos realistas

## 🎯 Principios de Documentación

1. **Single Source of Truth** - Una sola fuente autorizada por tema
2. **Consistencia** - Usar templates para formato uniforme
3. **Actualización Continua** - Revisar y actualizar al cambiar código
4. **Contexto Completo** - Incluir por qué se tomaron decisiones
5. **Facilidad para IAs** - Estructura clara, enlaces cruzados, ejemplos

## 🔄 Proceso de Mantenimiento

### Al modificar código:
1. Actualizar documentación correspondiente
2. Agregar nuevos problemas conocidos
3. Actualizar métricas si cambiaron
4. Agregar commit hash si es importante

### Revisiones mensuales:
1. Verificar que enlaces funcionan
2. Actualizar estadísticas desactualizadas
3. Revisar TODOs y marcar como completados
4. Agregar nueva documentación según necesidad

---

**Última actualización:** Octubre 2025
**Mantenido por:** Equipo de Desarrollo APIDevs
