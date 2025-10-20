# 📁 Documentación de Desarrollo - APIDevs

Bienvenido al centro de gestión de desarrollo del proyecto APIDevs.

---

## 📚 **DOCUMENTOS PRINCIPALES**

### **1. [ROADMAP.md](./ROADMAP.md)** - Visión General
📍 **¿Qué es?** Mapa completo del proyecto con timeline y progreso  
🎯 **Cuándo usarlo**: Para ver el estado general y planificación a largo plazo  
⏱️ **Actualización**: Semanal

**Contenido**:
- Estado actual del proyecto (85% completado)
- Timeline Q4 2025 - Q1 2026
- Progreso por área (IA, Content Creator, Admin, etc.)
- KPIs y métricas de éxito
- Visión a largo plazo

---

### **2. [PRIORIDADES.md](./PRIORIDADES.md)** - Lista de Tareas
🎯 **¿Qué es?** Todas las tareas pendientes priorizadas y detalladas  
🎯 **Cuándo usarlo**: Al planificar qué trabajar hoy/esta semana  
⏱️ **Actualización**: Diaria

**Contenido**:
- 🔴 Críticas (esta semana)
- 🟠 Altas (próximas 2 semanas)
- 🟡 Medias (próximo mes)
- 🟢 Bajas (futuro)
- Matriz de priorización (Impacto vs Esfuerzo)
- Estimaciones de tiempo

---

### **3. [GUIA-GESTION-TAREAS.md](./GUIA-GESTION-TAREAS.md)** - Cómo Trabajar
📋 **¿Qué es?** Guía completa del sistema de gestión elegido  
🎯 **Cuándo usarlo**: Al configurar por primera vez o al crear issues  
⏱️ **Actualización**: Raramente

**Contenido**:
- Por qué elegimos GitHub Projects
- Setup paso a paso (15 min)
- Sistema de labels
- Workflow diario
- Automatizaciones
- Templates y tips

---

### **4. CHANGELOG.md** - Historial de Cambios
📝 **¿Qué es?** Registro de todo lo completado  
🎯 **Cuándo usarlo**: Para ver qué se ha logrado  
⏱️ **Actualización**: Al completar cada feature

**Formato**:
```markdown
## [Unreleased]

### Agregado
- Feature X

### Cambiado
- Mejora Y

### Corregido
- Bug Z

## [2.0.0] - 2025-10-20

### Agregado
- Sistema de IA asistente completo
- Content Creator 100% funcional
- Conversor Markdown → Portable Text
```

---

## 🗂️ **CARPETA `areas/`** - Status por Módulo

Documentos detallados del estado de cada área:

- **ia-asistente.md**: Status IA, features pendientes
- **content-creator.md**: Status Content Creator
- **admin-panel.md**: Status Admin Panel
- **blog.md**: Status Blog Sanity
- **tradingview-integration.md**: Status integración TradingView

**Formato de cada documento**:
```markdown
# [Área]

## Estado Actual
[Porcentaje completado, features funcionando]

## Features Pendientes
[Lista de pendientes con prioridad]

## Problemas Conocidos
[Bugs o limitaciones actuales]

## Próximos Pasos
[Qué sigue]
```

---

## 🚀 **FLUJO DE TRABAJO RECOMENDADO**

### **Al iniciar el día**:
1. 📖 Revisar [PRIORIDADES.md](./PRIORIDADES.md) → Ver qué es crítico
2. 📊 Abrir [GitHub Project](https://github.com/tuuser/apidevs-react/projects/1) → Ver board
3. 🎯 Mover issue a "Doing"
4. 💻 Crear branch: `git checkout -b feature/nombre-issue`

### **Durante el desarrollo**:
1. ✍️ Commits frecuentes con mensajes semánticos
2. 📝 Actualizar checklist en el issue
3. 🧪 Testing mientras desarrollas

### **Al completar**:
1. 🔄 Push y crear PR
2. ✅ Marcar issue como Done
3. 📝 Agregar entrada en CHANGELOG.md
4. 📊 Actualizar ROADMAP.md si es feature importante

### **Semanalmente**:
1. 📊 Actualizar [ROADMAP.md](./ROADMAP.md) con progreso
2. 🎯 Re-priorizar [PRIORIDADES.md](./PRIORIDADES.md) si es necesario
3. 📈 Revisar métricas en GitHub Project Insights

---

## 🏷️ **SISTEMA DE LABELS**

### **Prioridades**
- 🔴 `priority:critical` - Bloqueante, requiere atención inmediata
- 🟠 `priority:high` - Importante, próximas 2 semanas
- 🟡 `priority:medium` - Útil, próximo mes
- 🟢 `priority:low` - Nice to have, futuro

### **Áreas**
- 🤖 `area:ia-asistente`
- ✍️ `area:content-creator`
- 📊 `area:admin-panel`
- 🎨 `area:frontend`
- ⚙️ `area:backend`
- 📚 `area:docs`

### **Tipos**
- 🐛 `type:bug` - Algo no funciona
- ✨ `type:feature` - Nueva funcionalidad
- 🔧 `type:improvement` - Mejora de algo existente
- 📝 `type:docs` - Documentación

### **Esfuerzo**
- ⏱️ `effort:small` - < 2 horas
- ⏱️ `effort:medium` - 2-6 horas
- ⏱️ `effort:large` - > 6 horas

---

## 📊 **ESTADO ACTUAL (20 Oct 2025)**

### **Progreso General: 85%** 🚀

| Área | Estado | Próxima Feature |
|------|--------|-----------------|
| IA Asistente | 95% ✅ | Persistencia conversaciones |
| Content Creator | 100% ✅ | - |
| Admin Panel | 90% 🔄 | Tab conversaciones |
| Integración TradingView | 100% ✅ | - |
| Blog Sanity | 100% ✅ | - |
| Checkout Stripe | 100% ✅ | - |

### **Tareas Críticas (Esta Semana)**
1. 🔴 Persistencia de conversaciones (6-8h)
2. 🔴 Tab conversaciones admin (4-6h)

### **Tareas Altas (Próximas 2 Semanas)**
3. 🟠 Tools de modificación (8-10h)
4. 🟠 Analytics reales (4-6h)
5. 🟠 Context memory (3-4h)

---

## 🛠️ **HERRAMIENTAS**

### **GitHub CLI** (Recomendado)
```bash
# Instalar
sudo apt install gh

# Autenticar
gh auth login

# Ver issues asignados
gh issue list --assignee @me --state open

# Crear issue
gh issue create --title "Feature X" --label "priority:high"

# Ver PRs
gh pr list --author @me
```

### **Scripts Útiles**
- `scripts/create-github-issues.sh` - Crear issues automáticamente
- `scripts/test-markdown-converter.ts` - Test del conversor markdown

---

## 📈 **MÉTRICAS DE ÉXITO**

### **Técnicas**
- ✅ Uptime > 99%
- ✅ Respuesta IA < 2s
- ✅ Streaming latency < 200ms
- ⏳ Cobertura tests > 80%

### **Productividad**
- ⏳ Issues cerrados/semana > 5
- ⏳ Velocity (story points) estable
- ⏳ Tiempo de PR a merge < 24h

### **Negocio**
- ⏳ Conversiones chat → registro > 5%
- ⏳ Tickets soporte ↓ 50%
- ⏳ NPS > 8/10

---

## 🔗 **RECURSOS RELACIONADOS**

### **Documentación Técnica**
- [Sistema IA Completo](../ia/SISTEMA-IA-COMPLETO.md)
- [Content Creator Progress](../ia/CONTENT-CREATOR-PROGRESS.md)
- [Asistente IA Clientes](../ia/ASISTENTE-IA-CLIENTES.md)

### **APIs y Servicios**
- [Stripe Webhooks](../apis/stripe-webhooks.md) _(crear)_
- [TradingView API](../apis/tradingview-api.md) _(crear)_
- [Supabase Schema](../apis/supabase-schema.md) _(crear)_

### **External Links**
- [GitHub Project Board](https://github.com/tuuser/apidevs-react/projects/1)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Stripe Dashboard](https://dashboard.stripe.com)

---

## 💡 **TIPS Y MEJORES PRÁCTICAS**

### **Commits Semánticos**
```bash
feat: nueva feature
fix: corrección de bug
docs: actualización de documentación
refactor: refactorización sin cambio de funcionalidad
test: añadir o actualizar tests
chore: tareas de mantenimiento
```

### **Mensajes de Commit Buenos**
✅ `feat: implementar persistencia de conversaciones (#123)`  
✅ `fix: corregir auto-scroll en chat widget (#124)`  
✅ `docs: actualizar ROADMAP con progreso semanal`

❌ `update`  
❌ `fix bug`  
❌ `changes`

### **Referencias a Issues**
```bash
# Mencionar issue (sin cerrar)
git commit -m "feat: avance en #123"

# Cerrar issue automáticamente
git commit -m "feat: completar feature (closes #123)"

# Cerrar múltiples
git commit -m "feat: feature X (closes #123, closes #124)"
```

---

## 🆘 **¿NECESITAS AYUDA?**

1. 📖 **Primero**: Buscar en esta documentación
2. 🔍 **Segundo**: Buscar en issues cerrados (quizá ya se resolvió)
3. 💬 **Tercero**: Preguntar en Discord/Slack del equipo
4. 🐛 **Último recurso**: Crear issue con label `help-wanted`

---

## 📅 **CHANGELOG DE ESTA DOCUMENTACIÓN**

- **2025-10-20**: Creación inicial
  - ROADMAP.md
  - PRIORIDADES.md
  - GUIA-GESTION-TAREAS.md
  - README.md (este archivo)

---

**Mantenido por**: Carlos Diaz  
**Última actualización**: 20 de Octubre de 2025  
**Versión**: 1.0

---

<div align="center">

**¿Listo para empezar?**

1. Lee [PRIORIDADES.md](./PRIORIDADES.md) para ver qué trabajar  
2. Configura [GitHub Projects](./GUIA-GESTION-TAREAS.md#setup-inicial-15-minutos)  
3. ¡Empieza a codear! 🚀

</div>

