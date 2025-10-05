# Guía de Implementación: Docusaurus para Documentación Técnica

## Contexto del Proyecto
- **Stack actual**: Next.js + Turbopack + Tailwind
- **Hosting**: Vercel
- **Propósito**: Documentar arquitectura, APIs, componentes y flujos de usuario para que las IAs tengan contexto específico del proyecto

---

## Objetivo

Crear una base de conocimiento estructurada en Docusaurus que permita:
1. Documentar detalles técnicos específicos (endpoints, schemas, integraciones)
2. Servir como contexto para IAs (Cursor, Claude, etc.)
3. Reemplazar múltiples archivos .md dispersos por una estructura organizada

---

## 1. Instalación

Crear Docusaurus en una carpeta `/docs` dentro del proyecto existente usando el preset classic con TypeScript.

Configurar los scripts necesarios para:
- Desarrollo local de docs
- Build de docs
- Servir docs estáticamente

---

## 2. Configuración Básica

### docusaurus.config.ts

Configurar:
- Metadata del proyecto (título, tagline, URL)
- Idioma principal (español)
- Tema y estilos (adaptado al proyecto)
- Navbar con enlaces principales
- Desactivar blog si no se necesita
- Habilitar soporte para Mermaid (diagramas)
- Syntax highlighting para TypeScript, JSON, Bash

### Sidebar

Crear estructura de navegación organizada por secciones principales:
- Arquitectura
- API
- Componentes
- Flujos de Usuario
- Desarrollo

---

## 3. Estructura de Documentación

Organizar los docs en carpetas lógicas según estas categorías:

```
docs/docs/
├── intro.md
├── architecture/      # Visión general, tech stack, patrones
├── api/              
│   ├── endpoints/    # APIs internas
│   └── external/     # Microservicios externos
├── components/       # Componentes UI y de negocio
├── user-flows/       # Flujos completos de usuario
└── development/      # Setup, convenciones, troubleshooting
```

Usar archivos `_category_.json` para configurar el orden y metadata de cada sección.

---

## 4. Templates Estandarizados

Crear templates reutilizables para mantener consistencia:

### Template: Microservicio Externo

Debe incluir:
- Quick context (para IA): propósito, versión, tipo de auth, rate limits
- Endpoints utilizados (request, response, errores)
- Integración en el código (dónde está implementado, cómo se usa)
- Mapeo de datos (campos externos → campos internos)
- Webhooks configurados (si aplica)
- Variables de entorno necesarias
- Troubleshooting (errores comunes y soluciones)
- Diagrama de flujo (con Mermaid)

### Template: Componente

Debe incluir:
- Descripción y propósito
- Props/parámetros
- Ejemplos de uso
- Variantes visuales
- Dependencias
- Ubicación en el código
- Notas técnicas y TODOs

### Template: Flujo de Usuario

Debe incluir:
- Descripción del flujo
- Objetivo del usuario
- Punto de entrada
- Diagrama de flujo (Mermaid)
- Pasos detallados
- Estados posibles
- Componentes involucrados
- APIs utilizadas
- Casos edge y manejo de errores

---

## 5. Deploy en Vercel

Configurar para que las docs se desplieguen junto con la app:

**Opciones:**
- Subdomain dedicado (docs.tuapp.com)
- Mismo dominio en subpath (tuapp.com/docs)

Considerar la estructura del proyecto Next.js actual y adaptar la configuración de Vercel apropiadamente.

---

## 6. Integración con IA

### Cómo usar con IAs (Cursor, Claude, etc.):

**Método directo:**
- Referencia archivos específicos: "Lee docs/docs/api/external/stripe.md"
- La IA puede acceder al contenido completo

**Método búsqueda:**
- Buscar archivos relevantes con grep
- Copiar contenido al clipboard
- Pegar como contexto en la IA

**Ventaja clave:** Las IAs tendrán acceso a detalles específicos (endpoints, schemas, configuraciones) que no caben en OpenMemory.

---

## 7. Plugins Recomendados

- **Mermaid**: Para diagramas de flujo y arquitectura
- **OpenAPI (opcional)**: Si se quiere auto-generar docs desde schemas

---

## 8. Workflow de Documentación

### Al desarrollar features:
1. Implementar funcionalidad
2. Documentar en Docusaurus usando el template apropiado
3. Commit código + docs juntos
4. Deploy automático

### Al usar IA:
1. Identificar qué docs necesitas
2. Referenciar archivos específicos o copiar contenido
3. La IA responde con conocimiento específico del proyecto

---

## 9. Prioridades de Documentación

Empezar documentando (en orden de prioridad):
1. **Microservicios externos** que uses (Stripe, SendGrid, etc.)
2. **Flujo de autenticación** (casi siempre es fundamental)
3. **Componentes más complejos o reutilizados**
4. **Endpoints críticos de la API**

---

## Notas Importantes

- Adaptar la estructura a las necesidades específicas del proyecto
- Los templates son guías, no reglas estrictas
- Mantener los docs actualizados con el código
- La documentación es para humanos Y para IAs: debe ser clara y completa

---

## Resultado Esperado

Una base de conocimiento que:
- Está integrada en el mismo repo
- Se actualiza junto con el código
- Es accesible para las IAs sin configuración extra
- Reduce la dispersión de archivos .md
- Facilita onboarding de nuevos desarrolladores (o nuevas IAs)