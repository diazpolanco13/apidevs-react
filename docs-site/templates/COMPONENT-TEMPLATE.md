# 🧩 TEMPLATE: Documentación de Componente

**INSTRUCCIONES:** Usa este template para componentes individuales simples. Mantén la documentación concisa y enfocada.

---

```markdown
---
sidebar_position: [número de orden]
---

# [Nombre del Componente]

## Propósito

[1-2 oraciones explicando qué hace este componente y cuándo usarlo]

## Props/Parámetros

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| [prop1] | [string] | ✅ | [valor] | [descripción breve] |
| [prop2] | [boolean] | ❌ | [valor] | [descripción breve] |

## Ejemplo de Uso

```tsx
import { [NombreComponente] } from '[ruta del componente]';

// Ejemplo básico
<[NombreComponente]
  [prop1]={[valor1]}
  [prop2]={[valor2]}
/>

// Ejemplo avanzado
<[NombreComponente]
  [prop1]={[valor1]}
  [prop2]={[valor2]}
  [prop3]={[valor3]}
>
  [children content si aplica]
</[NombreComponente]>
```

## Ubicación

- **Archivo**: `src/components/[ruta]/[NombreComponente].tsx`
- **Tests**: `src/components/[ruta]/[NombreComponente].test.tsx` [si existe]
- **Storybook**: `src/components/[ruta]/[NombreComponente].stories.tsx` [si existe]

## Dependencias Clave

- **[Dependencia 1]**: Para [propósito específico]
- **[Dependencia 2]**: Para [propósito específico]

## Estados y Variantes

- **[Estado 1]**: [Descripción y cuándo se usa]
- **[Estado 2]**: [Descripción y cuándo se usa]

## Consideraciones de Performance

- [Si tiene consideraciones especiales de performance]
- [Si maneja muchos datos o re-renders frecuentes]

## Accesibilidad (a11y)

- [Consideraciones de accesibilidad si aplica]
- [Soporte para lectores de pantalla, navegación por teclado, etc.]

## TODOs

- [ ] [Mejora específica si está planificada]
- [ ] [Bug conocido si existe]

---

## 📋 Checklist para Usar Este Template

- [ ] Propósito claro en 1-2 oraciones
- [ ] Tabla completa de props con tipos y defaults
- [ ] Al menos un ejemplo funcional de uso
- [ ] Path exacto del archivo
- [ ] Mantener documentación concisa (< 300 palabras)

**Ubicación recomendada:** `docs/docs/components/[categoria]/[NombreComponente].md`

---

## 🔍 Cuándo Usar Este Template

✅ **SÍ usar para:**
- Componentes individuales reutilizables
- Hooks personalizados simples
- Utilidades compartidas
- Componentes de UI básicos

❌ **NO usar para:**
- Sistemas completos
- Features complejas con múltiples componentes
- Lógica de negocio compleja
- (Usar templates de Sistema o Feature en esos casos)
