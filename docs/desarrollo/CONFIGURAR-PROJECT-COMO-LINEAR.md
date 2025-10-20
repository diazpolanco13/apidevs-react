# 🎨 Configurar GitHub Project como Linear

**Objetivo**: Transformar tu GitHub Project en una experiencia similar a Linear

**Tiempo**: 10 minutos

---

## 📍 **PASO 1: Agregar Issues al Proyecto (2 min)**

### **Ir a tu proyecto**:
```
https://github.com/users/diazpolanco13/projects/3
```

### **Agregar los 5 issues**:

**Opción más rápida**:
1. Scroll hasta el final de la tabla
2. Verás un botón **"+ Add item"** o **"Add items"**
3. Click ahí
4. En el buscador escribe: `#2`
5. Click en: **"🔴 Implementar Persistencia de Conversaciones del Chatbot"**
6. Repetir con: `#3`, `#4`, `#5`, `#6`

Los 5 issues aparecerán en tu proyecto ✅

---

## 📊 **PASO 2: Configurar Custom Fields (3 min)**

Los custom fields son como los campos de Linear (Priority, Status, etc.)

### **2.1 Crear Campo "Priority"**

1. En tu proyecto → Click **⚙️ Settings** (arriba a la derecha)
2. Scroll hasta **"Custom fields"**
3. Click **"+ New field"**
4. Configurar:
   ```
   Field name: Priority
   Field type: Single select
   Options:
     - 🔴 Critical (color: rojo)
     - 🟠 High (color: naranja)
     - 🟡 Medium (color: amarillo)
     - 🟢 Low (color: verde)
   ```
5. Click **"Save"**

### **2.2 Crear Campo "Area"**

1. Click **"+ New field"** otra vez
2. Configurar:
   ```
   Field name: Area
   Field type: Single select
   Options:
     - 🤖 IA Asistente (color: morado)
     - ✍️ Content Creator (color: cyan)
     - 📊 Admin Panel (color: azul)
     - 🎨 Frontend (color: azul claro)
     - ⚙️ Backend (color: verde)
     - 📚 Docs (color: gris)
   ```
3. Click **"Save"**

### **2.3 Crear Campo "Estimate"**

1. Click **"+ New field"**
2. Configurar:
   ```
   Field name: Estimate
   Field type: Number
   Suffix: hours
   ```
3. Click **"Save"**

### **2.4 Crear Campo "Target Date"**

1. Click **"+ New field"**
2. Configurar:
   ```
   Field name: Target Date
   Field type: Date
   ```
3. Click **"Save"**

---

## 🎨 **PASO 3: Configurar View "Board" - Kanban (2 min)**

### **3.1 Crear/Editar View Board**

1. En tu proyecto → Click tab actual (probablemente "Prioritized backlog")
2. Click **"⋮"** (tres puntos) → **"View settings"**
3. O crear nuevo: Click **"+ New view"** → **"Board"**

### **3.2 Configurar el Board**

```
Layout: Board
Group by: Status
Sort: Priority (Critical → Low)
```

### **3.3 Configurar Columnas**

Asegúrate de tener estas columnas (estados):
- **📝 Todo** (No status)
- **🚧 In Progress**
- **👀 In Review**
- **✅ Done**

**Cómo agregar columnas**:
- En el board → Click **"+ New status"**
- Agregar: "In Progress", "In Review", "Done"

---

## 📋 **PASO 4: Configurar View "Table" (1 min)**

### **4.1 Crear View Table**

1. Click **"+ New view"**
2. Tipo: **Table**
3. Nombre: "All Tasks"

### **4.2 Configurar Columnas**

Mostrar estas columnas (en orden):
1. ✅ **Title**
2. ✅ **Status**
3. ✅ **Priority** (custom field)
4. ✅ **Area** (custom field)
5. ✅ **Assignees**
6. ✅ **Estimate** (custom field)
7. ✅ **Target Date** (custom field)
8. ✅ **Labels**

**Cómo ajustar columnas**:
- Click **"⋮"** → **"View settings"** → **"Fields"**
- Check/uncheck las que quieres mostrar
- Drag & drop para reordenar

### **4.3 Configurar Sort y Group**

```
Sort: Priority (Critical first)
Group by: Area (opcional)
```

---

## 🗺️ **PASO 5: Configurar View "Roadmap" (2 min)**

### **5.1 Crear View Roadmap**

1. Click **"+ New view"**
2. Tipo: **Roadmap**
3. Nombre: "Timeline"

### **5.2 Configurar Timeline**

```
Date field: Target Date
Layout: By week (o By month)
Group by: Priority (o Area)
Zoom: Fit to screen
```

### **5.3 Asignar Fechas a Issues**

En la vista Roadmap o Table:
- Issue #2: Target Date → 27 Oct 2025 (esta semana)
- Issue #3: Target Date → 27 Oct 2025 (esta semana)
- Issue #4: Target Date → 10 Nov 2025 (próximas 2 sem)
- Issue #5: Target Date → 10 Nov 2025 (próximas 2 sem)
- Issue #6: Target Date → 20 Nov 2025 (próximo mes)

---

## 🎯 **PASO 6: Asignar Valores a Custom Fields**

Para cada issue, asignar:

### **Issue #2 - Persistencia Conversaciones**
- Priority: 🔴 Critical
- Area: 🤖 IA Asistente
- Estimate: 7 hours
- Target Date: 27 Oct 2025
- Status: 🚧 In Progress (mover ahora)

### **Issue #3 - Tab Conversaciones Admin**
- Priority: 🔴 Critical
- Area: 📊 Admin Panel
- Estimate: 5 hours
- Target Date: 27 Oct 2025
- Status: 📝 Todo

### **Issue #4 - Tools Modificación**
- Priority: 🟠 High
- Area: 🤖 IA Asistente
- Estimate: 9 hours
- Target Date: 10 Nov 2025
- Status: 📝 Todo

### **Issue #5 - Analytics Reales**
- Priority: 🟠 High
- Area: 📊 Admin Panel
- Estimate: 5 hours
- Target Date: 10 Nov 2025
- Status: 📝 Todo

### **Issue #6 - Context Memory**
- Priority: 🟡 Medium
- Area: 🤖 IA Asistente
- Estimate: 3.5 hours
- Target Date: 20 Nov 2025
- Status: 📝 Todo

**Cómo asignar**:
- Click en el issue en la tabla
- Se abre panel lateral derecho
- Seleccionar valores para cada campo

---

## 🚀 **RESULTADO FINAL**

Tu proyecto se verá así:

### **Vista Board (Kanban)**:
```
┌───────────────────────────────────────────────────────────┐
│ 📊 APIDevs Development Roadmap                            │
├───────────────────────────────────────────────────────────┤
│ [Board] [Table] [Roadmap]                                 │
├───────────────────────────────────────────────────────────┤
│                                                             │
│  📝 Todo (3)       🚧 In Progress (1)    ✅ Done (0)       │
│ ┌──────────────┐  ┌──────────────────┐  ┌─────────────┐  │
│ │ #3 🔴        │  │ #2 🔴            │  │             │  │
│ │ Tab Conv     │  │ Persistencia     │  │             │  │
│ │ 📊 Admin     │  │ 🤖 IA            │  │             │  │
│ │ ⏱️ 5h        │  │ ⏱️ 7h            │  │             │  │
│ │ 📅 Oct 27    │  │ 📅 Oct 27        │  │             │  │
│ ├──────────────┤  └──────────────────┘  └─────────────┘  │
│ │ #4 🟠        │                                           │
│ │ Tools Mod    │                                           │
│ │ 🤖 IA        │                                           │
│ │ ⏱️ 9h        │                                           │
│ │ 📅 Nov 10    │                                           │
│ ├──────────────┤                                           │
│ │ #5 🟠        │                                           │
│ │ Analytics    │                                           │
│ └──────────────┘                                           │
└───────────────────────────────────────────────────────────┘
```

### **Vista Table**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Title                     │ Status  │ Priority │ Area  │ Est. │ │
├─────────────────────────────────────────────────────────────────┤
│ #2 Persistencia Conv.     │ 🚧 Doing│ 🔴 Crit  │ 🤖 IA │ 7h   │ │
│ #3 Tab Conversaciones     │ 📝 Todo │ 🔴 Crit  │ 📊 AP │ 5h   │ │
│ #4 Tools Modificación     │ 📝 Todo │ 🟠 High  │ 🤖 IA │ 9h   │ │
│ #5 Analytics Reales       │ 📝 Todo │ 🟠 High  │ 📊 AP │ 5h   │ │
│ #6 Context Memory         │ 📝 Todo │ 🟡 Med   │ 🤖 IA │ 3.5h │ │
└─────────────────────────────────────────────────────────────────┘
```

### **Vista Roadmap (Timeline)**:
```
┌─────────────────────────────────────────────────────────────┐
│              Oct 20 → Nov 20                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Week 1 (Oct 20-27):  [#2 ▓▓▓▓▓▓▓] [#3 ▓▓▓▓▓]              │
│                                                              │
│ Week 2 (Oct 28-Nov 3):                                      │
│                                                              │
│ Week 3 (Nov 4-10):   [#4 ▓▓▓▓▓▓▓▓▓] [#5 ▓▓▓▓▓]            │
│                                                              │
│ Week 4 (Nov 11-20):  [#6 ▓▓▓▓]                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ **CONFIGURACIÓN AVANZADA (Opcional)**

### **Automation - Auto-mover Issues**

1. En Settings del proyecto → **Workflows**
2. Activar estos workflows automáticos:

**Workflow 1: Auto-archive**
```
When: Item is closed
Then: Archive item
```

**Workflow 2: Auto-assign**
```
When: Item is added to project
Then: Set Status to "Todo"
```

**Workflow 3: PR opens**
```
When: Pull request is opened
Then: Set Status to "In Review"
```

**Workflow 4: PR merges**
```
When: Pull request is merged
Then: Set Status to "Done"
```

---

## 🎹 **KEYBOARD SHORTCUTS (como Linear)**

Una vez en el proyecto, usa estos atajos:

| Atajo | Acción |
|-------|--------|
| `c` | Create new issue |
| `e` | Edit selected item |
| `/` | Focus search |
| `?` | Show all shortcuts |
| `Cmd/Ctrl + K` | Command palette |
| `g` + `i` | Go to issues |
| `g` + `p` | Go to projects |

---

## 📱 **MOBILE APP**

GitHub Projects tiene app móvil:
- iOS: https://apps.apple.com/app/github/id1477376905
- Android: https://play.google.com/store/apps/details?id=com.github.android

Puedes gestionar tu proyecto desde el teléfono 📱

---

## 🎨 **PERSONALIZACIÓN VISUAL**

### **Colores de Estado**

En Settings → Customize columns:
- 📝 Todo: Gris (#6b7280)
- 🚧 In Progress: Azul (#3b82f6)
- 👀 In Review: Amarillo (#fbca04)
- ✅ Done: Verde (#10b981)

### **Emojis en Títulos**

Los emojis ya están en los títulos:
- 🔴 = Crítico
- 🟠 = Alto
- 🟡 = Medio
- 🟢 = Bajo

---

## 📊 **INSIGHTS Y ANALYTICS**

GitHub Projects tiene analytics automáticos:

1. En tu proyecto → Tab **"Insights"**
2. Verás:
   - **Burn down chart** (progreso vs tiempo)
   - **Velocity** (issues completados por semana)
   - **Cumulative flow** (flow de estados)
   - **Cycle time** (tiempo de Todo → Done)

---

## 🔄 **WORKFLOW COMPLETO**

### **Diario**:
```bash
# 1. Ver qué trabajar hoy
gh issue list --assignee @me --state open

# 2. Abrir proyecto en navegador
https://github.com/users/diazpolanco13/projects/3

# 3. Mover issue a "In Progress"
# (drag & drop en Board view)

# 4. Crear branch desde issue
gh issue develop 2 --checkout

# 5. Trabajar en la feature
# ...

# 6. Commit con referencia
git commit -m "feat: persistencia conversaciones (#2)"

# 7. Push y crear PR
git push origin feature/2-persistencia
gh pr create --fill

# 8. El issue se mueve a "In Review" automáticamente

# 9. Al hacer merge → issue se cierra y va a "Done"
gh pr merge --squash
```

---

## 🆚 **COMPARACIÓN: GitHub Project vs Linear**

| Feature | GitHub Projects | Linear |
|---------|----------------|--------|
| **Board (Kanban)** | ✅ | ✅ |
| **Table view** | ✅ | ✅ |
| **Roadmap/Timeline** | ✅ | ✅ |
| **Custom fields** | ✅ | ✅ |
| **Automation** | ✅ | ✅ |
| **Keyboard shortcuts** | ✅ | ✅ |
| **Insights/Analytics** | ✅ | ✅ |
| **Mobile app** | ✅ | ✅ |
| **Integración Git** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Velocidad UI** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Precio** | 🆓 GRATIS | 💰 $8/mes |

**Tienes 95% de las features de Linear a $0/mes** 🎉

---

## 🎯 **CHECKLIST DE SETUP**

- [ ] Agregar issues #2, #3, #4, #5, #6 al proyecto
- [ ] Crear custom field "Priority"
- [ ] Crear custom field "Area"
- [ ] Crear custom field "Estimate"
- [ ] Crear custom field "Target Date"
- [ ] Configurar view "Board" (Kanban)
- [ ] Configurar view "Table"
- [ ] Configurar view "Roadmap"
- [ ] Asignar valores de Priority a cada issue
- [ ] Asignar valores de Area a cada issue
- [ ] Asignar Estimate (horas) a cada issue
- [ ] Asignar Target Date a issues críticos
- [ ] Mover issue #2 a "In Progress"
- [ ] Activar workflows de automatización

---

## 💡 **TIPS PRO**

### **1. Filtros Rápidos**

En cualquier view, usa el buscador:
```
priority:critical          # Solo críticos
area:ia-asistente          # Solo IA Asistente
status:"In Progress"       # Solo en progreso
assignee:@me              # Solo tuyos
```

### **2. Saved Views**

Crea views personalizadas:
- "🔥 This Week" → Filter: Target Date < 7 days
- "🤖 IA Tasks" → Filter: Area = IA Asistente
- "🔴 Urgent" → Filter: Priority = Critical

### **3. Notificaciones**

Activa notificaciones:
- Settings → Notifications → Watch project
- Recibirás alertas de cambios importantes

---

## 🚀 **SIGUIENTE PASO**

Una vez configurado todo:

1. **Ir a tu proyecto**: https://github.com/users/diazpolanco13/projects/3
2. **Agregar los 5 issues** (scroll abajo → "+ Add item")
3. **Configurar custom fields** (Settings → Custom fields)
4. **Asignar valores** (click en cada issue)
5. **¡Empezar a trabajar!** 🎉

---

## 🆘 **¿NECESITAS AYUDA?**

Si algo no funciona o quieres ayuda con la configuración, avísame y te guío paso a paso por cada pantalla! 🤝

---

**¡Tu GitHub Project estará idéntico a Linear en 10 minutos!** ⚡


