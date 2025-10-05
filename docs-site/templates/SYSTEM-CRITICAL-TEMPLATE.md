# 📚 TEMPLATE: Documentación de Sistema Crítico

**INSTRUCCIONES:** Copia este template y reemplaza las secciones marcadas con [CORCHETES] con la información específica de tu sistema.

---

```markdown
---
sidebar_position: [número de orden]
---

# 🎯 [Nombre del Sistema]

**Fecha:** [Fecha de creación/última actualización]
**Estado:** [Estado actual del desarrollo - Fase X de Y]
**Commits principales:** [Lista de commits importantes]
**Última actualización:** [Fecha y hora]

---

## 🎯 Objetivo General

[Descripción clara de qué hace el sistema y por qué es crítico para la plataforma]

---

## 🏗️ Arquitectura del Sistema

### **Stack Tecnológico**
- **Frontend:** [Tecnologías principales]
- **Backend:** [Tecnologías principales]
- **Base de datos:** [Sistema y características especiales]
- **Microservicio externo:** [Si aplica, descripción]
- **Autenticación:** [Sistema utilizado]

### **Componentes Principales**

[Diagrama o descripción textual de los componentes]

```
┌─────────────────────────────────────────────────────────────┐
│                    [COMPONENTE PRINCIPAL]                   │
├─────────────────────────────────────────────────────────────┤
│  • [Funcionalidad 1]                                        │
│  • [Funcionalidad 2]                                        │
│  • [Funcionalidad 3]                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 [COMPONENTE SECUNDARIO]                     │
└─────────────────────────────────────────────────────────────┘
```

### **Base de Datos - [X] Tablas Principales**

#### 1. **`[tabla_principal]`** - [Propósito]
```sql
- id ([tipo], PK)
- [campo_importante_1] ([tipo]) -- Descripción
- [campo_importante_2] ([tipo]) -- Descripción
- created_at, updated_at (timestamptz)
```

#### 2. **`[tabla_secundaria]`** - [Propósito]
[Schema completo si es crítico]

---

## ✅ FASES IMPLEMENTADAS

### **Fase 1: [Nombre de Fase]** ✅ COMPLETADA
- **Ubicación:** [Rutas en la aplicación]
- **Funcionalidad:** [Qué se logró]
- **Componentes:** [Archivos principales]
- **Estado visual:** [Si aplica]

### **Fase 2: [Nombre de Fase]** ✅ COMPLETADA
[Continuar con cada fase implementada]

---

## 🐛 PROBLEMAS CONOCIDOS Y SOLUCIONES

### **1. Error: "[mensaje exacto del error]"**
- **Fecha:** [Cuándo se descubrió]
- **Causa:** [Explicación técnica]
- **Solución:** [Cómo se resolvió]
- **Commit fix:** [Hash del commit]
- **Código:**
  ```typescript
  // ❌ Incorrecto
  [código problemático]

  // ✅ Correcto
  [código corregido]
  ```

### **2. [Otro problema importante]**
[Continuar con otros problemas críticos]

---

## 📊 Estadísticas Actuales del Sistema

### **Base de Datos:**
- **[X] registros** en tabla principal
- **[Y] operaciones** exitosas
- **[Z] métricas** importantes

### **Métricas de Negocio:**
- [Métrica 1]: [Valor]
- [Métrica 2]: [Valor]

---

## ⚠️ CONSIDERACIONES CRÍTICAS PARA IA CONTINUADORA

### **1. [Aspecto Crítico 1]**
- **SIEMPRE** [regla absoluta]
- **NUNCA** [anti-patrón]
- **Verificar** [qué revisar]

### **2. [Aspecto Crítico 2]**
[Continuar con consideraciones importantes]

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### **Prioridad Alta:**
1. [Tarea específica más importante]
2. [Siguiente tarea crítica]

### **Prioridad Media:**
1. [Mejoras importantes]
2. [Refinamientos]

---

## 📝 RESUMEN EJECUTIVO PARA CONTINUIDAD

### **Lo que está funcionando:**
✅ [Feature 1]
✅ [Feature 2]

### **Lo que falta:**
⏳ [Feature pendiente]
⏳ [Mejora necesaria]

### **Archivos más importantes:**
1. `[ruta/archivo1.ts]` - [Propósito crítico]
2. `[ruta/archivo2.ts]` - [Propósito crítico]

### **Datos críticos del negocio:**
- [Métrica clave 1]
- [Métrica clave 2]

---

**Última actualización:** [Fecha y hora]
**Mantenido por:** [Persona/Equipo]
**Estado:** [Resumen ejecutivo del estado actual]
**Próxima IA:** [Instrucciones específicas de qué revisar primero]
```

---

## 📋 Checklist para Usar Este Template

- [ ] Reemplazar todos los [CORCHETES] con información específica
- [ ] Incluir al menos 3 problemas conocidos con soluciones detalladas
- [ ] Agregar métricas actuales del sistema
- [ ] Listar archivos más importantes con rutas exactas
- [ ] Incluir consideraciones críticas para futuras IAs
- [ ] Agregar commits importantes con hashes
- [ ] Crear diagrama de arquitectura (usar Mermaid si es complejo)

**Ubicación recomendada:** `docs/docs/systems/[nombre-sistema]/overview.md`
