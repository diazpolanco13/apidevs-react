# 🔧 TEMPLATE: Documentación de Feature/Módulo

**INSTRUCCIONES:** Usa este template para features específicos que no son sistemas críticos completos pero sí funcionalidades importantes.

---

```markdown
---
sidebar_position: [número de orden]
---

# [Nombre del Feature/Módulo]

## Qué Hace

[Descripción clara de 1-2 párrafos explicando qué funcionalidad provee este feature y en qué contexto se usa]

## Componentes Involucrados

- **[Componente 1]**: `path/to/file.tsx` - [Propósito específico del componente]
- **[Componente 2]**: `path/to/file.tsx` - [Propósito específico del componente]
- **[Hook/Util]**: `path/to/hook.ts` - [Qué hace este hook/util]

## APIs Utilizadas

- [Lista de endpoints internos utilizados]
- [Lista de servicios externos si aplica]

## Flujo Técnico Detallado

### 1. [Paso inicial del flujo]
[Explicación técnica del paso]

```typescript
// Código crítico del paso 1
[code example]
```

### 2. [Siguiente paso]
[Continuar explicando el flujo paso a paso]

```typescript
// Código crítico del paso 2
[code example]
```

## Estados del Sistema

| Estado | Condición | Siguiente Acción |
|--------|-----------|------------------|
| [estado1] | [condición] | [acción] |
| [estado2] | [condición] | [acción] |

## Ubicación en el Código

- **Componentes**: [paths específicos]
- **Lógica de negocio**: [paths]
- **Tests**: [paths si existen]

## Configuración Necesaria

```bash
# Variables de entorno requeridas
VARIABLE_NAME=valor
ANOTHER_VAR=valor
```

## Decisiones Técnicas Importantes

- **[Decisión 1]**: [Por qué se tomó, alternativas consideradas, impacto]
- **[Decisión 2]**: [Contexto completo de la decisión]

## Limitaciones Conocidas

- [Limitación 1] y workaround actual
- [Limitación 2] y plan para resolverla

## TODOs y Mejoras Futuras

- [ ] [Mejora específica planificada]
- [ ] [Refactor necesario]
- [ ] [Nueva funcionalidad solicitada]

## Problemas Conocidos

### **Problema: [Descripción breve]**
- **Estado:** [Resuelto/En progreso/Pendiente]
- **Impacto:** [Severidad del problema]
- **Solución temporal:** [Si aplica]
- **Solución definitiva:** [Planificada]

## Testing

### **Casos de prueba principales:**
1. [Caso de prueba 1] - [Resultado esperado]
2. [Caso de prueba 2] - [Resultado esperado]

### **Comandos de testing:**
```bash
# Comando para ejecutar tests relacionados
npm run test [specific-test]
```

---

## 📋 Checklist para Usar Este Template

- [ ] Explicar claramente qué hace el feature (no asumir conocimiento previo)
- [ ] Listar TODOS los archivos relevantes con paths exactos
- [ ] Incluir al menos un ejemplo de código funcional
- [ ] Documentar decisiones técnicas importantes
- [ ] Mencionar limitaciones y workarounds
- [ ] Incluir TODOs específicos y accionables

**Ubicación recomendada:** `docs/docs/features/[nombre-feature].md`
```

---

## 🔍 Cómo Saber si Usar Este Template

✅ **SÍ usar este template si:**
- Es una funcionalidad específica y autocontenida
- Tiene 2-5 componentes relacionados
- No es un sistema crítico completo
- Puede explicarse en menos de 1000 palabras
- Es usado por otros sistemas/features

❌ **NO usar este template si:**
- Es un sistema completo con múltiples fases
- Tiene más de 10 componentes
- Requiere explicación de arquitectura compleja
- Tiene documentación técnica de más de 2000 palabras
- (En estos casos, usar el template de Sistema Crítico)
